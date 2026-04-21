
import React, { useState } from 'react';
import { MENU_ITEMS } from '../constants';
import { getNutritionRecommendation, getSmartPairing } from '../services/geminiService';
import { MenuItem, CartItem, UserProfile } from '../types';

interface NutritionAIProps {
  addToCart: (item: CartItem) => void;
  user: UserProfile;
}

interface RecommendationData {
    reasoning: string;
    recommendedItemIds: string[];
}

const NutritionAI: React.FC<NutritionAIProps> = ({ addToCart, user }) => {
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pairingSuggestion, setPairingSuggestion] = useState<{for: string, text: string, drinkId?: string} | null>(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  
  // Detail View State
  const [viewingItem, setViewingItem] = useState<MenuItem | null>(null);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setRecommendation(null);
    try {
      const data = await getNutritionRecommendation(user);
      setRecommendation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (item: MenuItem, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      type: 'Food'
    });
    
    // Trigger Smart Pairing if it's a food item
    if (item.category === 'Main' || item.category === 'Starter') {
      setPairingLoading(true);
      // Ensure we display loading state before async call
      setPairingSuggestion({ for: item.name, text: '' }); 
      
      const suggestion = await getSmartPairing(item.name, user);
      setPairingSuggestion({ 
          for: item.name, 
          text: suggestion.text, 
          drinkId: suggestion.drinkId 
      });
      setPairingLoading(false);
    }
    setViewingItem(null); // Close detail view if open
  };

  const handleAddPairing = () => {
      if (!pairingSuggestion?.drinkId) return;
      
      const drink = MENU_ITEMS.find(i => i.id === pairingSuggestion.drinkId);
      if (drink) {
          addToCart({
              id: `${drink.id}-${Date.now()}`,
              name: drink.name,
              price: drink.price,
              type: 'Food',
              details: `Paired with ${pairingSuggestion.for}`
          });
          setPairingSuggestion(null); // Close popup
      }
  };

  const handleOrderRecommendation = () => {
      if (!recommendation) return;
      
      const itemsToOrder = MENU_ITEMS.filter(item => recommendation.recommendedItemIds.includes(item.id));
      
      itemsToOrder.forEach(item => {
          addToCart({
              id: `${item.id}-${Date.now()}`,
              name: item.name,
              price: item.price,
              type: 'Food',
              details: 'Part of AI Meal Plan'
          });
      });
  };

  const recommendedItems = recommendation 
      ? MENU_ITEMS.filter(item => recommendation.recommendedItemIds.includes(item.id)) 
      : [];
      
  const totalRecommendationPrice = recommendedItems.reduce((acc, item) => acc + item.price, 0);

  // Helper to generate mock macros for display purposes
  const getMacros = (item: MenuItem) => {
      // Very basic estimation for visual demo
      const protein = item.tags.includes('High Protein') ? 35 : item.tags.includes('Vegan') ? 15 : 20;
      const fat = item.tags.includes('Indulgent') ? 40 : 15;
      const carbs = 100 - protein - fat;
      return { protein, fat, carbs };
  };

  // --- DETAIL VIEW RENDER ---
  if (viewingItem) {
      const macros = getMacros(viewingItem);
      
      return (
        <div className="space-y-6 animate-fade-in">
           <button 
                onClick={() => setViewingItem(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-luxury-gold transition-colors mb-4"
              >
                  <span>←</span> Back to Menu
              </button>

            <div className="bg-luxury-charcoal rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-80 md:h-auto relative">
                    <img src={viewingItem.imageUrl} alt={viewingItem.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:bg-gradient-to-r"></div>
                    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
                         <span className="bg-luxury-gold text-black px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-2 inline-block">
                             {viewingItem.category}
                         </span>
                         <h2 className="text-3xl font-serif text-white leading-tight">{viewingItem.name}</h2>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-2 flex-wrap">
                            {viewingItem.tags.map(tag => (
                                <span key={tag} className="border border-white/20 px-2 py-1 rounded text-xs text-gray-300">{tag}</span>
                            ))}
                        </div>
                        <p className="text-3xl font-serif text-luxury-gold">${viewingItem.price}</p>
                    </div>

                    <p className="text-gray-300 text-lg leading-relaxed mb-8 flex-1">{viewingItem.description}</p>

                    {/* Nutrition Breakdown */}
                    <div className="bg-black/20 rounded-xl p-6 border border-white/5 mb-8">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between">
                            <span>Nutritional Profile</span>
                            <span className="text-white">{viewingItem.calories} kcal</span>
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Protein</span>
                                    <span>{macros.protein}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${macros.protein}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Healthy Fats</span>
                                    <span>{macros.fat}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500" style={{ width: `${macros.fat}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Carbohydrates</span>
                                    <span>{macros.carbs}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: `${macros.carbs}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleAddItem(viewingItem)}
                        className="w-full bg-luxury-gold text-black py-4 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
                    >
                        Add to Order — ${viewingItem.price}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- LIST VIEW RENDER ---
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="font-serif text-3xl text-luxury-gold mb-2">Wellness Dining & Nutrition</h2>
        <p className="text-gray-400">Personalized menus based on your goal: <span className="text-white font-semibold">{user.healthGoal}</span></p>
      </header>

      {/* AI Nutritionist Section */}
      <div className="bg-luxury-charcoal p-6 rounded-xl border border-luxury-gold/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🥗</div>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">✨</span> AI Nutritionist Consultation
        </h3>
        
        {!recommendation && !loading && (
          <button 
            onClick={handleGetRecommendation}
            className="bg-luxury-gold text-luxury-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
          >
            Generate My Personalized Menu
          </button>
        )}

        {loading && (
          <div className="flex items-center space-x-3 text-luxury-gold animate-pulse">
            <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce delay-200"></div>
            <span>Analyzing nutritional profiles...</span>
          </div>
        )}

        {recommendation && (
          <div className="animate-fade-in">
             <div className="prose prose-invert max-w-none mt-4 bg-black/30 p-6 rounded-lg border-l-4 border-luxury-gold mb-6">
                 <p className="font-serif italic text-luxury-gold text-lg mb-2">"Here is my recommendation for you..."</p>
                 <p className="font-sans text-gray-300 leading-relaxed">{recommendation.reasoning}</p>
             </div>
             
             {/* Recommended Items Display */}
             {recommendedItems.length > 0 && (
                 <div className="bg-white/5 rounded-xl p-6 border border-white/5 mt-6">
                     <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Curated Selection</h4>
                     <div className="space-y-4 mb-6">
                         {recommendedItems.map(item => (
                             <div 
                                key={item.id} 
                                onClick={() => setViewingItem(item)}
                                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 hover:bg-black/60 p-4 rounded-lg border border-white/10 hover:border-luxury-gold/50 cursor-pointer transition-all group"
                             >
                                 <div className="flex gap-4 items-center w-full md:w-auto">
                                     <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-white/10 group-hover:border-luxury-gold/50 transition-colors" />
                                     <div className="flex-1">
                                         <p className="text-luxury-gold text-[10px] uppercase font-bold tracking-widest mb-1">{item.category}</p>
                                         <p className="text-white font-bold text-sm md:text-base">{item.name}</p>
                                         <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                                     </div>
                                 </div>
                                 <div className="mt-3 md:mt-0 flex items-center justify-between w-full md:w-auto md:flex-col md:items-end">
                                    <span className="text-luxury-gold font-mono text-lg">${item.price}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 group-hover:text-luxury-gold transition-colors">View Details</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                     
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10">
                         <div className="text-center md:text-left">
                             <p className="text-xs text-gray-500 uppercase">Total Plan Price</p>
                             <p className="text-2xl font-serif text-white">${totalRecommendationPrice.toFixed(2)}</p>
                         </div>
                         <button 
                            onClick={handleOrderRecommendation}
                            className="w-full md:w-auto bg-gradient-to-r from-luxury-gold to-yellow-600 text-black px-8 py-3 rounded font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105"
                         >
                             Order Full Meal Plan
                         </button>
                     </div>
                 </div>
             )}
          </div>
        )}
      </div>

      {/* Menu Marketplace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MENU_ITEMS.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setViewingItem(item)}
            className="bg-luxury-charcoal rounded-xl overflow-hidden group hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all border border-transparent hover:border-luxury-gold/30 flex flex-col cursor-pointer"
          >
            <div className="h-48 overflow-hidden relative">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs text-luxury-gold border border-luxury-gold/20">
                ${item.price}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-serif text-lg text-white group-hover:text-luxury-gold transition-colors">{item.name}</h4>
              </div>
              <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden line-clamp-2">{item.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4 flex-1">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-gray-300">{tag}</span>
                ))}
              </div>

              <button 
                onClick={(e) => handleAddItem(item, e)}
                className="w-full py-2 border border-luxury-gold text-luxury-gold rounded hover:bg-luxury-gold hover:text-black transition-colors"
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Sommelier Notification - iOS Glass Style */}
      {pairingSuggestion && (
        <div className="fixed bottom-8 right-8 max-w-md w-full z-50 animate-fade-in-up">
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
             
             {/* Ambient Glow */}
             <div className="absolute top-0 left-0 w-20 h-20 bg-luxury-gold/20 blur-[50px] rounded-full pointer-events-none"></div>
             
             <div className="flex items-start gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-900 to-black border border-white/10 flex items-center justify-center text-2xl shadow-lg shrink-0">
                    🍷
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h5 className="font-bold text-white text-sm mb-1 tracking-wide">Sommelier Insight</h5>
                        <button 
                            onClick={() => setPairingSuggestion(null)} 
                            className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
                        >
                            &times;
                        </button>
                    </div>
                    
                    <p className="text-xs text-luxury-gold font-medium mb-2 uppercase tracking-widest">
                        Pairing for {pairingSuggestion.for}
                    </p>
                    
                    {pairingLoading ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce delay-200"></span>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-300 leading-relaxed font-light">
                                {pairingSuggestion.text}
                            </p>
                            {pairingSuggestion.drinkId && (
                                <button 
                                    onClick={handleAddPairing}
                                    className="mt-3 w-full bg-white/10 hover:bg-luxury-gold hover:text-black border border-white/10 text-white text-xs font-bold py-2 rounded uppercase tracking-widest transition-all"
                                >
                                    Add Pairing (+${MENU_ITEMS.find(i => i.id === pairingSuggestion.drinkId)?.price})
                                </button>
                            )}
                        </>
                    )}
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionAI;
