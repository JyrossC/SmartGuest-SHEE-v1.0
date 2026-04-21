import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  VolumeX,
  Heart, 
  Flame, 
  Timer, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Camera,
  X,
  Plus
} from 'lucide-react';
import { MOCK_USER, FITNESS_EQUIPMENT } from '../constants';
import { getWorkoutPlan, generateImage, generateSpeech, generateTourVideo } from '../services/geminiService';
import { CartItem, LocationTier } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner class names
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FitnessAIProps {
  addToCart: (item: CartItem) => void;
  isDND: boolean;
}

const LIVE_TIPS = [
  "Keep your core engaged throughout the movement.",
  "Remember to breathe: inhale on the way down, exhale on the effort.",
  "Your posture looks excellent. Sustainable pace detected.",
  "Focus on the mind-muscle connection for better activation.",
  "Slightly lower your shoulders to release tension.",
  "Hydration check: Don't forget to take small sips in between sets.",
  "Heart rate is optimal for fat burning. Stay at this intensity.",
  "Form Alert: Ensure your knees don't cross your toes."
];

interface ExercisePlan {
  title: string;
  totalDuration: string;
  exercises: {
    name: string;
    duration: number;
    reps: string;
    sets: string;
    instructions: string;
    tip: string;
  }[];
}

const FitnessAI: React.FC<FitnessAIProps> = ({ addToCart, isDND }) => {
  const [location, setLocation] = useState<'In-Room' | 'Gym'>('Gym');
  const [tier, setTier] = useState<LocationTier>(LocationTier.STANDARD);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['eq1']);
  
  const [plan, setPlan] = useState<ExercisePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string | null>(null);
  const [generatingVisual, setGeneratingVisual] = useState(false);
  const [generatingAnimation, setGeneratingAnimation] = useState(false);

  // Live Workout States
  const [isLive, setIsLive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [calories, setCalories] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = async (text: string) => {
    if (!voiceEnabled || isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const audio = new Audio(`data:audio/mp3;base64,${base64}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error("Speech Error:", e);
      setIsSpeaking(false);
    }
  };

  // Timer and Biometric simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive && !isPaused) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
        setHeartRate(prev => {
            const shift = Math.floor(Math.random() * 3) - 1;
            const target = 135;
            return prev < target ? prev + 1 : prev + shift;
        });
        setCalories(prev => prev + (Math.random() * 0.15));
        
        // Change tip occasionally during the live session
        if (workoutTime % 25 === 0 && workoutTime > 0) {
            const nextTip = Math.floor(Math.random() * LIVE_TIPS.length);
            const tipText = LIVE_TIPS[nextTip];
            setCurrentTipIndex(nextTip);
            setLastCorrection(tipText);
            speak(`AI Sentinel Tip: ${tipText}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLive, isPaused, workoutTime, voiceEnabled]);

  const toggleEquipment = (id: string) => {
    setSelectedEquipment(prev => 
        prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    setVisualUrl(null);
    setAnimationUrl(null);
    try {
      const equipNames = FITNESS_EQUIPMENT.filter(e => selectedEquipment.includes(e.id)).map(e => e.name).join(', ');
      const context = tier === LocationTier.PRIVATE ? 'Private Facility' : location;
      const result = await getWorkoutPlan(MOCK_USER, `${context} ${location === 'In-Room' ? `with ${equipNames}` : ''}`);
      setPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisual = async (type: 'photo' | '3d') => {
    if (!plan || !plan.exercises.length) return;
    
    const is3D = type === '3d';
    if (is3D) setGeneratingAnimation(true);
    else setGeneratingVisual(true);

    const context = tier === LocationTier.PRIVATE ? 'Private VIP Gym Suite' : location;
    const currentEx = plan.exercises[currentExerciseIndex]?.name || "workout";
    
    if (is3D) {
      const videoPrompt = `A 3D demonstrative animation video of a fit person performing ${currentEx} in a ${context}. Professional training HUD, glowing muscle highlights, Unreal Engine style.`;
      const url = await generateTourVideo(videoPrompt);
      if (url) setAnimationUrl(url);
      setGeneratingAnimation(false);
    } else {
      const style = "A cinematic, high-quality photo of a luxury hotel setting, warm lighting, premium atmosphere";
      const photoPrompt = `${style}. A fit person is performing ${currentEx} in a ${context}. High detail, professional composition.`;
      const url = await generateImage(photoPrompt);
      if (url) setVisualUrl(url);
      setGeneratingVisual(false);
    }
  };

  const startWorkout = () => {
    setIsLive(true);
    setWorkoutTime(0);
    setCalories(0);
    setHeartRate(72);
    setCurrentExerciseIndex(0);
    const initialText = `AI Monitor Initialized. Starting with ${plan?.exercises[0]?.name || 'your workout'}. ${plan?.exercises[0]?.instructions || ''}`;
    setLastCorrection(initialText);
    speak(initialText);
  };

  const nextExercise = () => {
    if (!plan) return;
    if (currentExerciseIndex < plan.exercises.length - 1) {
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      const exercise = plan.exercises[nextIdx];
      speak(`Next up: ${exercise.name}. ${exercise.instructions}`);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      const prevIdx = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIdx);
      const exercise = plan?.exercises[prevIdx];
      if (exercise) speak(`Moving back to: ${exercise.name}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLiveWorkout = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-luxury-black/95 backdrop-blur-2xl flex flex-col p-6 md:p-12 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
              <div>
                  <h2 className="text-luxury-gold font-serif text-3xl">Live Session</h2>
                  <p className="text-gray-500 text-xs uppercase tracking-widest">Powered by SmartGuest AI Sentinel</p>
              </div>
              <button 
                onClick={() => setIsLive(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                aria-label="End Session"
              >
                <X className="text-white" />
              </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
              {/* Main Monitor View */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-black border border-white/5 shadow-2xl flex items-center justify-center group flex-1">
                      {/* Simulated Camera Feed / Visual UI */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                          <Activity className={cn("w-48 h-48 text-luxury-gold animate-pulse-slow", isPaused && "animate-none")} />
                      </div>

                      {/* Workout Animation Overlay (Veo if available, else static) */}
                      {animationUrl && (
                        <div className="absolute inset-0 z-0">
                           <video 
                                src={animationUrl} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover opacity-60 mix-blend-screen"
                            />
                        </div>
                      )}
                      
                      {/* Form Tracking Points (Simulated) */}
                      <div className="absolute inset-0 pointer-events-none z-10">
                          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_green]"></div>
                          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_green]"></div>
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-pulse"></div>
                          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_green]"></div>
                          
                          {/* HUD Overlay */}
                          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-[10px] uppercase font-bold tracking-tighter text-white">Sentinel AI-V1 View</span>
                          </div>

                          <div className="absolute bottom-6 left-6 text-white bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 max-w-sm">
                              <p className="text-[10px] text-luxury-gold uppercase font-bold mb-1">Live Coaching</p>
                              <h4 className="text-lg font-serif mb-1">{plan?.exercises[currentExerciseIndex]?.name}</h4>
                              <p className="text-xs font-light leading-snug text-white/80">{plan?.exercises[currentExerciseIndex]?.instructions}</p>
                          </div>
                      </div>

                      <div className="z-10 text-center">
                          <h3 className="font-serif text-3xl text-white mb-2">{isPaused ? 'Paused' : 'Monitoring Form...'}</h3>
                          <p className="text-gray-400 text-sm">Visualizing Biometric Alignment</p>
                      </div>

                      {/* Carousel Controls Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-12 z-20">
                          <button 
                            disabled={currentExerciseIndex === 0}
                            onClick={prevExercise}
                            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-30"
                          >
                              <ChevronLeft />
                          </button>
                          
                          <button 
                            onClick={() => setIsPaused(!isPaused)}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                          >
                              {isPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
                          </button>

                          <button 
                            disabled={plan && currentExerciseIndex >= plan.exercises.length - 1}
                            onClick={nextExercise}
                            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-30"
                          >
                              <ChevronRight />
                          </button>
                      </div>

                      {/* Top Bar Controls */}
                      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                          <button 
                            onClick={() => handleGenerateVisual('3d')}
                            disabled={generatingAnimation}
                            className="flex items-center gap-2 bg-blue-600/40 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 text-white text-[10px] uppercase font-bold tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
                          >
                              {generatingAnimation ? <Activity size={14} className="animate-spin" /> : <Activity size={14} />}
                              {generatingAnimation ? 'Rendering...' : 'AI 3D Logic'}
                          </button>
                          
                          <button 
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={cn(
                                "p-3 rounded-full border transition-all",
                                voiceEnabled ? "bg-luxury-gold border-luxury-gold text-black" : "bg-black/40 border-white/10 text-white"
                            )}
                          >
                              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                          </button>
                      </div>
                  </div>

                  {/* Quick Stats Overlay */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center">
                          <Timer className="text-luxury-gold mb-2 w-5 h-5" />
                          <span className="text-2xl font-serif text-white">{formatTime(workoutTime)}</span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold">Elapsed</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center">
                          <Heart className="text-red-500 mb-2 w-5 h-5 animate-pulse" />
                          <span className="text-2xl font-serif text-white">{heartRate} <span className="text-xs font-sans text-gray-500">bpm</span></span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold">Pulse</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center">
                          <Flame className="text-orange-500 mb-2 w-5 h-5" />
                          <span className="text-2xl font-serif text-white">{Math.floor(calories)} <span className="text-xs font-sans text-gray-500">kcal</span></span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold">Burn</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center">
                          <Activity className="text-blue-500 mb-2 w-5 h-5" />
                          <span className="text-2xl font-serif text-white">88%</span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold">Efficiency</span>
                      </div>
                  </div>
              </div>

              {/* Sidebar Helper */}
              <div className="space-y-6">
                  <div className="bg-luxury-gold text-black p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                          <Dumbbell size={80} />
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-4 opacity-70">Current Objective</h4>
                      <p className="text-xl font-serif leading-tight">Focusing on {location === 'In-Room' ? 'Endurance' : 'Hypertrophy'} for Muscle Gain.</p>
                      <div className="mt-6 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-black/30"></span>
                          <span className="w-2 h-2 rounded-full bg-black"></span>
                          <span className="w-2 h-2 rounded-full bg-black/30"></span>
                      </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex-1 overflow-y-auto max-h-[400px] scrollbar-hide">
                      <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">AI Sentinel Logs</h4>
                      <div className="space-y-6">
                          <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                              <div className="w-10 h-10 rounded-full bg-luxury-gold flex items-center justify-center shrink-0">
                                  <Timer size={18} className="text-black" />
                              </div>
                              <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold">Current Set</p>
                                  <p className="text-lg font-serif text-white">{plan?.exercises[currentExerciseIndex]?.sets} Sets • {plan?.exercises[currentExerciseIndex]?.reps} Reps</p>
                              </div>
                          </div>

                          {isLive && (
                              <motion.div 
                                key={currentTipIndex}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex gap-4"
                              >
                                  <div className="w-8 h-8 rounded-full bg-luxury-gold/20 flex items-center justify-center shrink-0">
                                      <Activity size={14} className="text-luxury-gold" />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-white mb-1">Voice Feedback</p>
                                      <p className="text-sm text-gray-400 font-light italic">"{LIVE_TIPS[currentTipIndex]}"</p>
                                  </div>
                              </motion.div>
                          )}
                          
                          <div className="border-t border-white/5 pt-6">
                              <p className="text-[10px] text-gray-600 uppercase font-bold mb-2">Technical Cue</p>
                              <div className="text-sm text-white font-medium leading-relaxed">
                                  {plan?.exercises[currentExerciseIndex]?.tip}
                              </div>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={() => setIsLive(false)}
                    className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold transition-colors"
                  >
                      Finish Session
                  </button>
              </div>
          </div>
      </div>
    </motion.div>
  );

  const handleBookSession = () => {
    if (location === 'Gym') {
        const price = tier === LocationTier.PRIVATE ? 150 : 50; 
        addToCart({
            id: `gym-${Date.now()}`,
            name: tier === LocationTier.PRIVATE ? "Private Gym Suite Reservation" : "Personal Trainer Session",
            price: price,
            type: 'Service',
            locationTier: tier,
            details: tier === LocationTier.PRIVATE ? "Exclusive Access • 1 Hour" : "Public Gym • 1 Hour Trainer"
        });
    } else {
        const equipNames = FITNESS_EQUIPMENT.filter(e => selectedEquipment.includes(e.id)).map(e => e.name);
        addToCart({
            id: `inroom-${Date.now()}`,
            name: "In-Room Performance Gear",
            price: 0,
            type: 'Rental',
            locationTier: LocationTier.IN_ROOM,
            details: `Renting: ${equipNames.join(', ')}`,
            deliveryMode: isDND ? 'Contactless (DND)' : 'Standard'
        });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <AnimatePresence>
        {isLive && renderLiveWorkout()}
      </AnimatePresence>

      <header className="text-center">
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6"
        >
            <Activity size={14} className="text-luxury-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Biometric Optimization</span>
        </motion.div>
        <h2 className="font-serif text-5xl md:text-7xl text-white mb-6">Elite Fitness</h2>
        <p className="text-gray-400 max-w-2xl mx-auto font-light text-lg">
          Our AI Sentinel creates and monitors bespoke regimens tailored to your immediate environment. 
          Goal: <span className="text-luxury-gold font-medium italic">{MOCK_USER.healthGoal}</span>
        </p>
      </header>

      {/* Selector UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="space-y-4">
            <button 
                onClick={() => { setLocation('In-Room'); setTier(LocationTier.IN_ROOM); }}
                className={cn(
                    "w-full p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden group",
                    location === 'In-Room' ? 'border-luxury-gold bg-luxury-gold/5 shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'border-white/5 bg-white/5 hover:border-gray-500'
                )}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Plus size={60} /></div>
                <h3 className="text-2xl font-serif mb-2 text-white">Private Sanctuary</h3>
                <p className="text-sm text-gray-500">Bespoke In-Room Experience</p>
                <div className={cn("mt-6 h-1 w-24 bg-luxury-gold rounded-full transition-all duration-500", location === 'In-Room' ? 'w-full' : 'opacity-0')}></div>
            </button>

            <button 
                onClick={() => { setLocation('Gym'); setTier(LocationTier.STANDARD); }}
                className={cn(
                    "w-full p-8 rounded-[2.5rem] border-2 transition-all duration-500 text-left relative overflow-hidden group",
                    location === 'Gym' ? 'border-luxury-gold bg-luxury-gold/5' : 'border-white/5 bg-white/5 hover:border-gray-500'
                )}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Dumbbell size={60} /></div>
                <h3 className="text-2xl font-serif mb-2 text-white">Performance Center</h3>
                <p className="text-sm text-gray-500">Fully Equipped Resort Gym</p>
                <div className={cn("mt-6 h-1 w-24 bg-luxury-gold rounded-full transition-all duration-500", location === 'Gym' ? 'w-full' : 'opacity-0')}></div>
            </button>
        </div>

        {/* Dynamic Detail Card */}
        <div className="glass-card p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between">
           {location === 'In-Room' ? (
                <div className="animate-fade-in-up">
                    <h4 className="font-serif text-2xl text-white mb-6">Select Your Gear</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {FITNESS_EQUIPMENT.map(eq => (
                            <button 
                                key={eq.id}
                                onClick={() => toggleEquipment(eq.id)}
                                className={cn(
                                    "p-4 rounded-3xl border transition-all flex flex-col items-center gap-2",
                                    selectedEquipment.includes(eq.id) ? 'border-luxury-gold bg-luxury-gold/20 shadow-inner' : 'border-white/5 bg-black/20 hover:bg-black/40'
                                )}
                            >
                                <span className="text-2xl">{eq.icon}</span>
                                <span className="text-[10px] uppercase font-bold text-center leading-tight text-white/60">{eq.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
           ) : (
                <div className="animate-fade-in-up h-full flex flex-col">
                    <h4 className="font-serif text-2xl text-white mb-6">Tier Preference</h4>
                    <div className="space-y-4 flex-1">
                        <button 
                            onClick={() => setTier(LocationTier.STANDARD)}
                            className={cn(
                                "w-full p-6 rounded-[2rem] border transition-all text-left flex justify-between items-center",
                                tier === LocationTier.STANDARD ? "border-luxury-gold bg-luxury-gold/10" : "border-white/5 bg-white/5"
                            )}
                        >
                            <span className="font-medium text-white">Public Access</span>
                            {tier === LocationTier.STANDARD && <CheckCircle2 className="text-luxury-gold" size={20} />}
                        </button>
                        <button 
                            onClick={() => setTier(LocationTier.PRIVATE)}
                            className={cn(
                                "w-full p-6 rounded-[2rem] border transition-all text-left flex justify-between items-center group",
                                tier === LocationTier.PRIVATE ? "border-luxury-gold bg-luxury-gold/10 shadow-lg" : "border-white/5 bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-white">Private VIP Suite</span>
                                <span className="text-[10px] bg-luxury-gold text-black px-1.5 py-0.5 rounded-full font-bold">+$100</span>
                            </div>
                            {tier === LocationTier.PRIVATE && <CheckCircle2 className="text-luxury-gold" size={20} />}
                        </button>
                    </div>
                </div>
           )}

           <button 
             onClick={generatePlan}
             disabled={loading}
             className="w-full mt-10 bg-gradient-to-r from-luxury-gold to-[#B89830] text-black font-bold py-5 rounded-full shadow-[0_20px_50px_rgba(212,175,55,0.2)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
           >
             {loading ? 'Analyzing Vitals...' : 'Generate AI Protocol'}
           </button>
        </div>
      </div>

      {plan && (
        <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel p-10 md:p-12 rounded-[4rem] border border-white/5"
        >
          <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
             <div>
               <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-luxury-gold mb-3">Protocol Optimized</p>
               <h4 className="font-serif text-4xl md:text-5xl text-white">Morning Alignment</h4>
             </div>
             
             <div className="flex flex-wrap items-center gap-4">
                 <button 
                    onClick={() => handleGenerateVisual('photo')}
                    disabled={generatingVisual || generatingAnimation}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-luxury-gold/50 transition-all text-xs font-bold uppercase tracking-widest text-white disabled:opacity-50"
                 >
                    <Camera size={14} className="text-luxury-gold" />
                    {generatingVisual ? 'Rendering...' : 'Ref. Photo'}
                 </button>
                 <button 
                    onClick={() => handleGenerateVisual('3d')}
                    disabled={generatingVisual || generatingAnimation}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 transition-all text-xs font-bold uppercase tracking-widest text-blue-400 disabled:opacity-50"
                 >
                    <Activity size={14} />
                    {generatingAnimation ? 'Simulating...' : '3D HUD'}
                 </button>
                 <button 
                    onClick={startWorkout}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-black hover:bg-luxury-gold transition-all text-xs font-bold uppercase tracking-widest shadow-xl"
                 >
                    <Play size={14} fill="currentColor" />
                    Launch Session
                 </button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                {/* Visuals Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {visualUrl ? (
                        <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 relative group cursor-pointer shadow-2xl">
                            <img 
                                src={visualUrl} 
                                alt="Workout Visual" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] uppercase font-bold text-white tracking-widest bg-black/60 px-4 py-2 rounded-full border border-white/10">Reference View</span>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-700 opacity-50">
                            <Camera className="mb-2" size={30} />
                            <p className="text-[10px] uppercase font-bold tracking-widest">Awaiting Visualization</p>
                        </div>
                    )}

                    {animationUrl ? (
                        <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-blue-500/10 relative group bg-black shadow-2xl">
                            <video 
                                src={animationUrl} 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-cover mix-blend-screen opacity-80"
                            />
                            <div className="absolute top-6 right-6 flex items-center gap-2 bg-blue-600/20 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/30">
                                <Activity size={10} className="text-blue-400" />
                                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">AI Veo Feed</span>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-700 opacity-50 bg-white/5">
                            <Activity className="mb-2" size={30} />
                            <p className="text-[10px] uppercase font-bold tracking-widest">3D Simulator Entry</p>
                        </div>
                    )}
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plan.exercises.map((ex, idx) => (
                            <div 
                                key={idx}
                                onClick={() => {
                                    setCurrentExerciseIndex(idx);
                                    startWorkout();
                                }}
                                className={cn(
                                    "p-6 rounded-3xl border transition-all cursor-pointer group",
                                    currentExerciseIndex === idx ? "bg-luxury-gold/10 border-luxury-gold" : "bg-white/5 border-white/10 hover:border-white/30"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xl font-serif text-white group-hover:text-luxury-gold transition-colors">{ex.name}</h4>
                                    <span className="text-xs font-mono text-gray-500">{ex.sets} x {ex.reps}</span>
                                </div>
                                <p className="text-xs text-gray-400 font-light line-clamp-2">{ex.instructions}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-luxury-gold/5 blur-3xl group-hover:bg-luxury-gold/10 transition-all"></div>
                    <h5 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">Concierge Checkout</h5>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-light">Service</span>
                            <span className="text-white font-medium">{location === 'Gym' ? 'Public Performance' : 'Sanctuary Gear'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-light">Tier Upgrade</span>
                            <span className="text-white font-medium">{tier === LocationTier.PRIVATE ? 'Private Suite' : 'Standard'}</span>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                            <span className="text-lg font-serif text-white">Total</span>
                            <span className="text-2xl font-serif text-luxury-gold">
                                ${location === 'Gym' ? (tier === LocationTier.PRIVATE ? '150' : '50') : '0.00'}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={handleBookSession}
                        className="w-full mt-8 bg-luxury-gold hover:bg-white text-black font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 group-active:scale-95"
                    >
                        Confirm Booking
                    </button>
                    {location === 'In-Room' && (
                        <p className="text-[10px] text-center text-gray-600 mt-4 font-bold uppercase tracking-tighter">Gear delivered in &lt;15 mins</p>
                    )}
                </div>

                <div className="p-8 border border-white/5 rounded-[3rem] bg-white/2">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-luxury-gold" size={16} />
                        <h6 className="text-xs font-bold uppercase tracking-widest text-white">Health Note</h6>
                    </div>
                    <p className="text-xs text-gray-500 font-light leading-relaxed">
                        Your current mood is listed as <span className="text-luxury-gold">Exhausted</span>. 
                        The AI Sentinel has automatically adjusted intensities to 70% threshold to prevent burnout while maintaining progress.
                    </p>
                </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FitnessAI;
