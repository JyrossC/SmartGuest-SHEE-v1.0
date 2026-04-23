
import React, { useState, useEffect } from 'react';
import { SPA_TREATMENTS, TECH_AMENITIES, MOCK_USER } from '../constants';
import { getSpaRecommendation } from '../services/geminiService';
import { CartItem, LocationTier, SpaTreatment, SymptomLogEntry } from '../types';

interface SpaWellnessProps {
  addToCart: (item: CartItem) => void;
  isDND: boolean;
  onLogSymptom: (entry: SymptomLogEntry) => void;
}

const SpaWellness: React.FC<SpaWellnessProps> = ({ addToCart, isDND, onLogSymptom }) => {
  const [activeSection, setActiveSection] = useState<'treatments' | 'mind'>('treatments');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<{ treatment: SpaTreatment, reasoning: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationTier, setLocationTier] = useState<LocationTier>(LocationTier.STANDARD);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const [viewingTreatment, setViewingTreatment] = useState<SpaTreatment | null>(null);

  // Persistence for Location Tier
  useEffect(() => {
    const savedTier = localStorage.getItem('shee_spa_prefs');
    if (savedTier) {
        // Simple string check to ensure it's a valid enum value
        if (Object.values(LocationTier).includes(savedTier as LocationTier)) {
            setLocationTier(savedTier as LocationTier);
        }
    }
  }, []);

  const handleTierChange = (tier: LocationTier) => {
      setLocationTier(tier);
      localStorage.setItem('shee_spa_prefs', tier);
  };

  const symptoms = ["Jetlag", "Muscle Soreness", "Stress/Anxiety", "Sunburn", "Insomnia", "Fatigue"];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
        prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleConsultAI = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setRecommendation(null);
    setIsReasoningExpanded(false);
    
    const result = await getSpaRecommendation(selectedSymptoms);
    if (result && result.treatmentId) {
        const treatment = SPA_TREATMENTS.find(t => t.id === result.treatmentId);
        if (treatment) {
            setRecommendation({ treatment, reasoning: result.reasoning });
            
            // Log to history
            onLogSymptom({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                symptoms: selectedSymptoms,
                recommendedTreatmentName: treatment.name,
                reasoning: result.reasoning
            });
        }
    }
    setLoading(false);
  };

  const getPrice = (basePrice: number) => {
      if (locationTier === LocationTier.IN_ROOM) return basePrice * 1.2; // 20% Surcharge
      if (locationTier === LocationTier.PRIVATE) return basePrice + 100; // Flat fee
      return basePrice;
  };

  const bookTreatment = (treatment: SpaTreatment) => {
      // Check if this treatment matches the current AI recommendation to attach context
      const isRecommended = recommendation?.treatment.id === treatment.id;
      const aiContext = isRecommended ? {
          symptoms: selectedSymptoms,
          aiReasoning: recommendation.reasoning
      } : {};

      addToCart({
          id: `spa-${Date.now()}`,
          name: treatment.name,
          price: getPrice(treatment.price),
          type: 'Service',
          locationTier: locationTier,
          details: `${locationTier} • ${treatment.durationMin} min${isDND ? ' • Contactless' : ''}`,
          deliveryMode: isDND ? 'Contactless (DND)' : 'Standard',
          ...aiContext
      });
  };

  const rentTech = (item: typeof TECH_AMENITIES[0]) => {
      addToCart({
          id: `tech-${Date.now()}`,
          name: `Rental: ${item.name}`,
          price: item.pricePerDay,
          type: 'Rental',
          details: '24 Hour Rental • Delivered to Room',
          deliveryMode: isDND ? 'Contactless (DND)' : 'Standard'
      });
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <header className="mb-8">
            <h2 className="font-serif text-3xl text-luxury-gold mb-2">Spa & Mental Wellness</h2>
            <p className="text-gray-400">Restore your balance. Treatments curated by AI for your specific state.</p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
            <button onClick={() => setActiveSection('treatments')} className={`text-lg font-serif transition-colors ${activeSection === 'treatments' ? 'text-luxury-gold border-b-2 border-luxury-gold' : 'text-gray-500 hover:text-white'}`}>Body Therapies</button>
            <button onClick={() => setActiveSection('mind')} className={`text-lg font-serif transition-colors ${activeSection === 'mind' ? 'text-luxury-gold border-b-2 border-luxury-gold' : 'text-gray-500 hover:text-white'}`}>Mind & Tech Rentals</button>
        </div>

        {activeSection === 'treatments' && (
            <div className="space-y-8">
                {/* Location Tier Selector - Moved to top for context */}
                <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                    <div className="mb-4 flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Select Experience Level</h4>
                            <p className="text-xs text-gray-500">Prices update automatically based on your selection.</p>
                        </div>
                        <div className="text-[10px] text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                            Preference Saved ✓
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { tier: LocationTier.STANDARD, label: 'Spa Facility', priceInfo: 'Standard Rates' },
                            { tier: LocationTier.IN_ROOM, label: 'In-Room Service', priceInfo: '+20% Surcharge' },
                            { tier: LocationTier.PRIVATE, label: 'Private Suite', priceInfo: '+$100 Flat Fee' }
                        ].map(({ tier, label, priceInfo }) => (
                            <button
                                key={tier}
                                onClick={() => handleTierChange(tier)}
                                className={`p-4 rounded-lg border text-left transition-all relative overflow-hidden group ${
                                    locationTier === tier 
                                    ? 'bg-luxury-gold/10 border-luxury-gold' 
                                    : 'bg-luxury-charcoal border-white/10 hover:border-luxury-gold/50'
                                }`}
                            >
                                <div className={`absolute top-0 right-0 p-2 text-4xl opacity-10 ${locationTier === tier ? 'text-luxury-gold' : 'text-gray-500'}`}>
                                    {tier === LocationTier.STANDARD ? '🌿' : tier === LocationTier.IN_ROOM ? '🛏️' : '👑'}
                                </div>
                                <p className={`font-bold ${locationTier === tier ? 'text-luxury-gold' : 'text-white'}`}>{label}</p>
                                <p className="text-xs text-gray-400 mt-1">{priceInfo}</p>
                                {locationTier === tier && <div className="absolute inset-0 border-2 border-luxury-gold rounded-lg pointer-events-none" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Symptom Checker */}
                <div className="bg-luxury-charcoal p-8 rounded-xl border border-luxury-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl">🌿</div>
                    <h3 className="text-xl font-bold text-white mb-4">How are you feeling today?</h3>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {symptoms.map(sym => (
                            <button 
                                key={sym}
                                onClick={() => toggleSymptom(sym)}
                                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                                    selectedSymptoms.includes(sym)
                                    ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)] transform scale-105'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-luxury-gold/50'
                                }`}
                            >
                                {selectedSymptoms.includes(sym) && <span>✓</span>}
                                {sym}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleConsultAI}
                        disabled={loading || selectedSymptoms.length === 0}
                        className="bg-white/10 hover:bg-luxury-gold hover:text-black text-white px-6 py-3 rounded font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
                    >
                        {loading ? 'Consulting Therapist AI...' : 'Find Perfect Treatment'}
                    </button>

                    {recommendation && (
                        <div className="mt-6 bg-black/40 p-6 rounded-lg border-l-4 border-luxury-gold animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-start gap-6">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-2 mb-2">
                                     <span className="bg-luxury-gold/20 text-luxury-gold text-[10px] px-2 py-1 rounded uppercase font-bold tracking-widest">AI Recommended</span>
                                </div>
                                <h4 className="text-white font-serif text-2xl mb-2">{recommendation.treatment.name}</h4>
                                
                                <div className="mb-4">
                                    <button 
                                        onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                                        className="text-xs text-luxury-gold flex items-center gap-1 hover:underline mb-2"
                                    >
                                        {isReasoningExpanded ? 'Hide AI Reasoning' : 'Show AI Reasoning'} 
                                        <span>{isReasoningExpanded ? '▲' : '▼'}</span>
                                    </button>
                                    
                                    {isReasoningExpanded && (
                                        <div className="bg-white/5 p-3 rounded text-sm text-gray-300 italic border border-white/5 animate-fade-in">
                                            "{recommendation.reasoning}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">⏱ {recommendation.treatment.durationMin} mins</span>
                                    <span className="flex items-center gap-1">🏷 {recommendation.treatment.tags.join(', ')}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 min-w-[140px] w-full md:w-auto">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Price</p>
                                    <p className="text-2xl font-serif text-luxury-gold">${getPrice(recommendation.treatment.price).toFixed(0)}</p>
                                    {locationTier !== LocationTier.STANDARD && <p className="text-[10px] text-gray-500">Includes surcharge</p>}
                                </div>
                                <button 
                                    onClick={() => bookTreatment(recommendation.treatment)} 
                                    className="w-full bg-luxury-gold text-black px-4 py-3 rounded font-bold text-sm hover:bg-white transition-colors shadow-lg uppercase tracking-wider"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Treatment List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SPA_TREATMENTS.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => setViewingTreatment(t)}
                          className="bg-luxury-charcoal p-6 rounded-xl border border-white/5 hover:border-luxury-gold/30 transition-all group flex flex-col cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-serif text-white group-hover:text-luxury-gold transition-colors">{t.name}</h4>
                                <span className="font-mono text-luxury-gold text-lg">${getPrice(t.price).toFixed(0)}</span>
                            </div>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{t.description}</p>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-xs text-gray-500">{t.durationMin} mins</span>
                                <span className="text-xs uppercase tracking-widest text-luxury-gold group-hover:text-white transition-colors">View Details</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Treatment Detail Modal/View */}
        {viewingTreatment && activeSection === 'treatments' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-luxury-charcoal rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full p-8 relative">
                    <button 
                        onClick={() => setViewingTreatment(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none"
                    >
                        &times;
                    </button>
                    
                    <div className="mb-6">
                        <span className="bg-luxury-gold text-black px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                             Spa Treatment
                        </span>
                        <h2 className="text-3xl font-serif text-white mb-2">{viewingTreatment.name}</h2>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                             <span className="flex items-center gap-1">⏱ {viewingTreatment.durationMin} mins</span>
                             <span className="flex items-center gap-1">🏷 {viewingTreatment.tags.join(', ')}</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-300 text-lg leading-relaxed mb-8 border-l-2 border-luxury-gold/50 pl-4">
                        {viewingTreatment.description}
                    </p>
                    
                    <div className="bg-black/30 p-4 rounded-xl mb-8 flex justify-between items-center border border-white/5">
                        <div>
                             <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Selected Tier: {locationTier}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-serif text-luxury-gold">${getPrice(viewingTreatment.price).toFixed(0)}</span>
                                {locationTier !== LocationTier.STANDARD && <span className="text-[10px] text-luxury-gold/70 border border-luxury-gold/30 px-1.5 py-0.5 rounded">Surcharge Applied</span>}
                             </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] text-gray-500">Duration</p>
                             <p className="text-sm text-white">{viewingTreatment.durationMin} Minutes</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => {
                            bookTreatment(viewingTreatment);
                            setViewingTreatment(null);
                        }}
                        className="w-full bg-gradient-to-r from-luxury-gold to-yellow-600 text-black py-4 rounded font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-[1.02]"
                    >
                        Add to Order — ${getPrice(viewingTreatment.price).toFixed(0)}
                    </button>
                </div>
            </div>
        )}

        {activeSection === 'mind' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TECH_AMENITIES.map(tech => (
                    <div key={tech.id} className="bg-luxury-charcoal rounded-xl overflow-hidden border border-white/5 hover:border-blue-400/30 transition-all group flex flex-col shadow-lg">
                        <div className="h-48 overflow-hidden relative">
                            <img src={tech.imageUrl} alt={tech.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded border border-blue-400/30 uppercase tracking-wider font-bold">
                                Wellness Tech
                            </div>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-luxury-gold font-mono text-xl">${tech.pricePerDay}<span className="text-sm text-white/70">/day</span></p>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h4 className="text-lg font-serif text-white mb-2">{tech.name}</h4>
                            <p className="text-sm text-gray-400 mb-6 flex-1">{tech.description}</p>
                            
                            <button 
                                onClick={() => rentTech(tech)}
                                className="w-full bg-white/5 hover:bg-blue-500 hover:text-white border border-white/10 hover:border-blue-500 text-gray-300 py-3 rounded transition-colors uppercase tracking-widest font-bold text-xs"
                            >
                                Rent Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default SpaWellness;
