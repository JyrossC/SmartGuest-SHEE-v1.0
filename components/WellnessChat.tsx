
import React, { useState, useRef, useEffect } from 'react';
import { Navigation as NavIcon, MapPin, Compass } from 'lucide-react';
import { generateSpeech, getConciergeResponse, generateTourVideo } from '../services/geminiService';
import { ChatMessage, CartItem, ItineraryItem } from '../types';

interface WellnessChatProps {
    addToCart: (item: CartItem) => void;
    userLocation: string;
    onNavigate: (destination: string) => void;
}

// Helper to convert raw PCM (Int16) to AudioBuffer
// Gemini TTS returns raw PCM 16-bit data, usually at 24kHz
const pcmToAudioBuffer = (
  data: Uint8Array, 
  ctx: AudioContext, 
  sampleRate: number = 24000, 
  numChannels: number = 1
): AudioBuffer => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const WellnessChat: React.FC<WellnessChatProps> = ({ addToCart, userLocation, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Jambo! I am your personal concierge. I see you are connecting from ${userLocation}. I can help you plan your stay, find local gems, or book activities. Try asking: "What are good sunset spots nearby?"`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Changed from boolean to string | null to track WHICH message is playing
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  
  // Itinerary State
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Parse JSON suggestions from text if available
  const extractSuggestions = (text: string): { cleanText: string, suggestions: ItineraryItem[] } => {
    let cleanText = text;
    let suggestions: ItineraryItem[] = [];

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (Array.isArray(parsed)) {
                suggestions = parsed.map((item: any, idx) => ({
                    id: `sugg-${Date.now()}-${idx}`,
                    title: item.title,
                    time: item.time,
                    location: item.location,
                    description: item.description,
                    mapQuery: item.mapQuery,
                    isBooked: false
                }));
            }
            // Remove the JSON block from display text to keep UI clean
            cleanText = text.replace(jsonMatch[0], '').trim();
        } catch (e) {
            console.error("Failed to parse activity JSON", e);
        }
    }
    return { cleanText, suggestions };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await getConciergeResponse(userMsg.text, userLocation);
      
      const { cleanText, suggestions } = extractSuggestions(result.text || "");
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanText || "I'm checking the schedule...",
        timestamp: new Date(),
        suggestedActivities: suggestions.length > 0 ? suggestions : undefined
      };
      setMessages(prev => [...prev, modelMsg]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting to the network.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const addToItinerary = (item: ItineraryItem) => {
      if (itinerary.some(i => i.id === item.id)) return;
      setItinerary(prev => [...prev, { ...item, isBooked: true }].sort((a, b) => a.time.localeCompare(b.time)));
      
      // Optionally add a notification message
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: `Confirmed! I've added "${item.title}" at ${item.time} to your schedule.`,
          timestamp: new Date()
      }]);
  };

  const removeFromItinerary = (id: string) => {
      setItinerary(prev => prev.filter(i => i.id !== id));
  };

  const handleGenerateVideo = async () => {
    setGeneratingVideo(true);
    const placeholderId = Date.now().toString();
    setMessages(prev => [...prev, {
        id: placeholderId,
        role: 'model',
        text: "Certainly. I am generating a video preview of a bespoke tour for you. This may take a moment...",
        timestamp: new Date()
    }]);

    const prompt = "Cinematic drone shot of a luxury safari tour in Serengeti, golden hour, 4k, peaceful atmosphere";
    const videoUri = await generateTourVideo(prompt);

    if (videoUri) {
        setMessages(prev => prev.map(msg => 
            msg.id === placeholderId 
            ? { ...msg, text: "Here is a preview of the Premium Safari Experience:", videoUri } 
            : msg
        ));
    } else {
        setMessages(prev => prev.map(msg => 
            msg.id === placeholderId 
            ? { ...msg, text: "I apologize, I could not generate the video preview at this time." } 
            : msg
        ));
    }
    setGeneratingVideo(false);
  };

  const playTTS = async (id: string, text: string) => {
    // If audio is already playing, do not start another one
    if (playingMessageId) return;
    
    setPlayingMessageId(id);
    
    try {
      const base64Audio = await generateSpeech(text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        
        const ctx = audioContextRef.current;
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Use manual PCM decoding instead of native decodeAudioData
        const audioBuffer = pcmToAudioBuffer(bytes, ctx, 24000); 
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
        
        source.onended = () => setPlayingMessageId(null);
      } else {
        setPlayingMessageId(null);
      }
    } catch (e) {
      console.error("Audio playback error", e);
      setPlayingMessageId(null);
    }
  };

  const handleQuickAction = (action: string, price: number) => {
    addToCart({
        id: `service-${Date.now()}`,
        name: action,
        price: price,
        type: 'Service',
        details: 'Requested via Concierge'
    });
    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `Confirmed. I have added "${action}" to your billing.`,
        timestamp: new Date()
    }]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass-card rounded-[2.5rem] overflow-hidden relative">
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-black/40 backdrop-blur-md z-10 flex justify-between items-center border-b border-white/5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-xl">🤖</div>
                <div>
                    <h3 className="font-bold text-white">Concierge</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Online</span>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={handleGenerateVideo}
                disabled={generatingVideo || loading}
                className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-luxury-gold transition-colors disabled:opacity-50"
            >
                {generatingVideo ? (
                    <span className="w-2 h-2 bg-luxury-gold rounded-full animate-ping"></span>
                ) : '🎥'}
                {generatingVideo ? 'Rendering...' : 'Preview Safari'}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 pt-24 pb-32 space-y-8 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-3xl backdrop-blur-md shadow-lg transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-luxury-gold to-[#B89830] text-black rounded-tr-sm mr-2' 
                    : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5 ml-2'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  
                  {msg.videoUri && (
                      <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                          <video src={msg.videoUri} controls className="w-full" />
                      </div>
                  )}

                  {msg.role === 'model' && (
                    <button 
                      onClick={() => playTTS(msg.id, msg.text)}
                      disabled={playingMessageId !== null && playingMessageId !== msg.id}
                      className={`mt-3 text-[10px] flex items-center gap-1.5 uppercase tracking-widest font-bold transition-all ${
                          playingMessageId === msg.id 
                          ? 'text-luxury-gold animate-pulse' 
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {playingMessageId === msg.id ? '🔊 Speaking...' : '🔈 Read'}
                    </button>
                  )}
                </div>

                {/* Activity Suggestions Cards */}
                {msg.suggestedActivities && msg.suggestedActivities.length > 0 && (
                    <div className="mt-4 w-full max-w-[90%] grid grid-cols-1 gap-3 animate-fade-in pl-2">
                        {msg.suggestedActivities.map((activity) => (
                            <div key={activity.id} className="bg-black/60 border border-white/10 p-4 rounded-2xl flex justify-between items-center gap-4 hover:border-luxury-gold/50 transition-all group">
                                <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm group-hover:text-luxury-gold transition-colors">{activity.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                        <span className="text-luxury-gold font-mono">{activity.time}</span>
                                        <span>• {activity.location}</span>
                                    </div>
                                    <button 
                                        onClick={() => onNavigate(activity.mapQuery || activity.title)}
                                        className="mt-2 text-[10px] text-gray-500 hover:text-luxury-gold flex items-center gap-1.5 transition-colors font-bold uppercase tracking-widest"
                                    >
                                        <Compass size={10} /> Open Spatial View
                                    </button>
                                </div>
                                <button 
                                    onClick={() => addToItinerary(activity)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-luxury-gold hover:text-black flex items-center justify-center transition-all"
                                >
                                    {itinerary.some(i => i.title === activity.title) ? '✓' : '+'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                <span className="text-[10px] text-gray-600 mt-2 mx-4">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            ))}
            
            {loading && (
               <div className="flex justify-start ml-2">
                 <div className="bg-white/5 px-6 py-4 rounded-3xl rounded-tl-sm border border-white/5">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="absolute bottom-6 left-6 right-6">
              <div className="glass-panel p-2 rounded-[2rem] flex items-center gap-2 shadow-2xl">
                 <div className="flex gap-2 pl-2">
                    <button onClick={() => handleQuickAction('Room Service', 50)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs transition-colors" title="Room Service">🍽️</button>
                    <button onClick={() => handleQuickAction('Housekeeping', 0)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs transition-colors" title="Housekeeping">🧹</button>
                 </div>
                 <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:ring-0 placeholder-gray-500 font-medium"
                 />
                 <button 
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                 >
                    <span className="ml-0.5 mt-0.5">➤</span>
                 </button>
              </div>
          </div>
      </div>

      {/* Itinerary Panel (Schedule) */}
      <div className="w-full lg:w-80 glass-card rounded-[2.5rem] flex flex-col h-[400px] lg:h-auto overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20">
              <h3 className="text-white font-serif text-xl">Itinerary</h3>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Upcoming</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {itinerary.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                      <div className="text-4xl grayscale">📅</div>
                      <p className="text-sm font-medium">Nothing scheduled.</p>
                  </div>
              ) : (
                  <div className="relative pl-4 border-l border-white/10 ml-2 py-2 space-y-6">
                      {itinerary.map((item, idx) => (
                          <div key={idx} className="relative group">
                              <span className="absolute -left-[21px] top-4 w-2.5 h-2.5 bg-black border-2 border-luxury-gold rounded-full z-10"></span>
                              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-all">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-mono text-luxury-gold">{item.time}</span>
                                      <button onClick={() => removeFromItinerary(item.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
                                  </div>
                                  <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                  <p className="text-gray-400 text-xs mt-1">{item.location}</p>
                                  <button 
                                      onClick={() => onNavigate(item.mapQuery || item.title)}
                                      className="mt-3 w-full py-2 rounded-lg bg-luxury-gold/10 hover:bg-luxury-gold/20 text-[10px] text-luxury-gold border border-luxury-gold/20 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                      <NavIcon size={12} /> Spatial Guidance
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default WellnessChat;
