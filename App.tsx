
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import NutritionAI from './components/NutritionAI';
import FitnessAI from './components/FitnessAI';
import RoomBooking from './components/RoomBooking';
import WellnessChat from './components/WellnessChat';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/LandingPage';
import AdminDashboards from './components/AdminDashboards';
import SpaWellness from './components/SpaWellness';
import WeatherWidget from './components/WeatherWidget';
import NavigationModule from './components/NavigationModule';
import { MOCK_USER, MOCK_INVENTORY } from './constants';
import { CartItem, UserTier, Transaction, UserProfile, UserRole, AppFeatures, InventoryItem, SymptomLogEntry } from './types';

// Helper to safely load cart from storage
const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('shee_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Helper to safely load history from storage
const loadHistory = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('shee_history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Helper to load symptom logs
const loadSymptomLogs = (): SymptomLogEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
      const saved = localStorage.getItem('shee_symptom_logs');
      return saved ? JSON.parse(saved) : [];
  } catch {
      return [];
  }
};

const Dashboard: React.FC<{ 
    cart: CartItem[], 
    history: Transaction[], 
    user: UserProfile, 
    commissionRate: number,
    symptomLogs: SymptomLogEntry[] 
}> = ({ cart, history, user, commissionRate, symptomLogs }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const rooms = cart.filter(i => i.type === 'Room');
  const services = cart.filter(i => i.type === 'Service');
  const food = cart.filter(i => i.type === 'Food');
  const rentals = cart.filter(i => i.type === 'Rental');
  
  const subtotal = cart.reduce((a, b) => a + b.price, 0);
  const isRoyal = user.tier === UserTier.ROYAL;
  const discount = isRoyal ? subtotal * 0.1 : 0;
  const totalValue = (subtotal - discount) * 1.1; // Including 10% Service Fee estimate

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative rounded-3xl overflow-hidden h-64 md:h-96 shadow-2xl group border border-white/5">
        <img src="https://picsum.photos/1200/600?random=99" alt="Resort Hero" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter brightness-75 group-hover:brightness-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12">
          <h2 className="font-serif text-3xl md:text-5xl text-white mb-2 shadow-black drop-shadow-lg">Karibu, {user.name}</h2>
          <p className="text-lg md:text-xl text-gray-200 drop-shadow-md">Your sanctuary is ready.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5 hover:border-luxury-gold/50 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-serif text-luxury-gold text-xl">Accommodations</h3>
            <span className="text-2xl group-hover:scale-110 transition-transform">🛏️</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{rooms.length > 0 ? rooms.length : '0'} <span className="text-sm font-normal text-gray-500">Booked</span></p>
          <p className="text-xs text-gray-400">{rooms.length > 0 ? rooms[0].name : 'Select a suite'}</p>
        </div>

        <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5 hover:border-luxury-gold/50 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-serif text-luxury-gold text-xl">Wellness</h3>
             <span className="text-2xl group-hover:scale-110 transition-transform">🧘</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{services.length + rentals.length} <span className="text-sm font-normal text-gray-500">Sessions</span></p>
          <p className="text-xs text-gray-400">Gym, Spa & Rentals</p>
        </div>

        <div className="bg-luxury-charcoal p-6 rounded-xl border border-white/5 hover:border-luxury-gold/50 transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-serif text-luxury-gold text-xl">Dining</h3>
             <span className="text-2xl group-hover:scale-110 transition-transform">🥗</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{food.length} <span className="text-sm font-normal text-gray-500">Orders</span></p>
          <p className="text-xs text-gray-400">Pre-arrival requests</p>
        </div>

        <div className="bg-gradient-to-br from-luxury-gold/20 to-luxury-charcoal p-6 rounded-xl border border-luxury-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300">
           <h3 className="font-serif text-luxury-gold text-xl mb-2">Est. Total</h3>
           <p className="text-3xl font-bold text-white mb-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
           <p className="text-xs text-gray-400">Pending checkout</p>
        </div>

        <WeatherWidget user={user} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-luxury-charcoal p-6 md:p-8 rounded-xl border border-white/5 h-full flex flex-col">
            <h3 className="font-serif text-2xl text-white mb-6 border-b border-white/10 pb-4">Your AI Wellness Profile</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 mb-6">
                <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Current Goal</p>
                <p className="text-base md:text-lg text-luxury-gold">{user.healthGoal}</p>
                </div>
                <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Dietary Focus</p>
                <p className="text-base md:text-lg text-luxury-gold">{user.dietaryRestrictions.join(', ')}</p>
                </div>
                <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Detected Mood</p>
                <p className="text-base md:text-lg text-luxury-gold">{user.mood}</p>
                </div>
                <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Membership</p>
                <p className="text-base md:text-lg text-luxury-gold">{user.tier} Tier</p>
                </div>
            </div>

            {/* Symptom History Section */}
            <div className="mt-auto border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <span>🩺</span> AI Health Insights Log
                </p>
                {symptomLogs.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No health consultations recorded yet.</p>
                ) : (
                    <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {symptomLogs.map(log => (
                            <div key={log.id} className="bg-black/20 p-3 rounded border border-white/5 text-sm">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{new Date(log.date).toLocaleDateString()}</span>
                                    <span className="text-luxury-gold font-bold">{log.recommendedTreatmentName}</span>
                                </div>
                                <p className="text-gray-400 text-xs">Symptoms: {log.symptoms.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="bg-luxury-charcoal p-6 md:p-8 rounded-xl border border-white/5 h-full flex flex-col">
            <h3 className="font-serif text-2xl text-white mb-6 border-b border-white/10 pb-4">Booking History</h3>
            {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50 py-4">
                    <span className="text-4xl mb-2">📜</span>
                    <p>No past transactions found.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 scrollbar-thin">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase text-gray-500 bg-white/5 sticky top-0 backdrop-blur-md">
                            <tr>
                                <th className="p-3 rounded-l-lg">Date</th>
                                <th className="p-3">Items</th>
                                <th className="p-3 rounded-r-lg text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((tx) => (
                                <tr 
                                  key={tx.id} 
                                  onClick={() => setSelectedTransaction(tx)}
                                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                                >
                                    <td className="p-3">
                                        <div className="text-white">{new Date(tx.date).toLocaleDateString()}</div>
                                        <div className="text-[10px] font-mono text-luxury-gold opacity-50 group-hover:opacity-100 transition-opacity">{tx.id}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="text-white">{tx.items.length} items</div>
                                        <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                            {tx.items.map(i => i.name).join(', ')}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className="text-luxury-gold font-bold">${tx.total.toFixed(2)}</span>
                                        <div className="text-[10px] text-green-500 uppercase font-bold flex justify-end items-center gap-1">
                                          Paid <span className="opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-luxury-charcoal max-w-2xl w-full rounded-2xl border border-luxury-gold shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-black/20">
                  <div>
                      <h3 className="font-serif text-2xl text-white">Booking Details</h3>
                      <p className="text-sm text-gray-400 mt-1">Ref: <span className="font-mono text-luxury-gold">{selectedTransaction.id}</span></p>
                  </div>
                  <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5">
                      <div>
                          <p className="text-xs uppercase tracking-widest text-gray-500">Transaction Date</p>
                          <p className="text-white font-bold">{new Date(selectedTransaction.date).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs uppercase tracking-widest text-gray-500">Payment Status</p>
                          <p className="text-green-500 font-bold uppercase text-sm bg-green-500/10 px-2 py-1 rounded inline-block mt-1">✓ Paid</p>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Itinerary Items</h4>
                      <div className="space-y-3">
                          {selectedTransaction.items.map((item, idx) => (
                              <div key={idx} className="bg-black/20 p-4 rounded-lg border border-white/5 hover:border-luxury-gold/30 transition-colors flex flex-col md:flex-row justify-between gap-4">
                                  <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <span className="text-[10px] uppercase bg-luxury-gold/20 text-luxury-gold px-1.5 py-0.5 rounded font-bold tracking-wider">{item.type}</span>
                                          {item.locationTier && <span className="text-[10px] uppercase bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold tracking-wider">{item.locationTier}</span>}
                                      </div>
                                      <p className="text-white font-bold text-lg leading-tight">{item.name}</p>
                                      {item.details && <p className="text-sm text-gray-400 mt-1 font-mono">{item.details}</p>}
                                      {item.deliveryMode === 'Contactless (DND)' && (
                                          <p className="text-xs text-red-400 mt-2 flex items-center gap-1 bg-red-500/10 p-1 rounded inline-flex">
                                              <span>⛔</span> Contactless Delivery Requested
                                          </p>
                                      )}
                                      {/* New AI Context Display */}
                                      {item.aiReasoning && (
                                          <div className="mt-2 bg-white/5 p-2 rounded border-l-2 border-luxury-gold text-xs text-gray-400">
                                              <p className="font-bold text-luxury-gold/70 mb-0.5">AI Wellness Reasoning:</p>
                                              {item.aiReasoning}
                                          </div>
                                      )}
                                  </div>
                                  <div className="text-right flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2 md:gap-0">
                                      <p className="text-luxury-gold font-mono text-lg font-bold">${item.price}</p>
                                      <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                                        item.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                                      }`}>
                                          {item.status || 'Pending'}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center">
                  <span className="text-gray-400 uppercase tracking-widest text-sm">Total Amount Paid</span>
                  <span className="text-3xl font-serif text-luxury-gold">${selectedTransaction.total.toFixed(2)}</span>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

// View State Type for Navigation
type ViewState = 'landing' | 'auth' | 'app';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // App Logic State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [history, setHistory] = useState<Transaction[]>(loadHistory);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [commissionRate, setCommissionRate] = useState<number>(10); // Default 10%
  const [symptomLogs, setSymptomLogs] = useState<SymptomLogEntry[]>(loadSymptomLogs);

  // FR-09: Digital DND
  const [isDND, setIsDND] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [userLocationName, setUserLocationName] = useState<string>("Zanzibar Resort");
  const [navQuery, setNavQuery] = useState<string>('');

  const handleJumpToNavigation = (destination: string) => {
    setNavQuery(destination);
    setActiveTab('navigation');
  };
  
  // Feature Flags (Managed by Super Admin)
  const [features, setFeatures] = useState<AppFeatures>({
    nutrition: true,
    fitness: true,
    spa: true,
    concierge: true
  });

  // Checkout States
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('shee_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shee_history', JSON.stringify(history));
  }, [history]);
  
  // Persist commission rate for Super Admin consistency
  useEffect(() => {
    const savedRate = localStorage.getItem('shee_commission');
    if (savedRate) setCommissionRate(Number(savedRate));
  }, []);

  useEffect(() => {
    localStorage.setItem('shee_commission', commissionRate.toString());
  }, [commissionRate]);
  
  useEffect(() => {
      localStorage.setItem('shee_symptom_logs', JSON.stringify(symptomLogs));
  }, [symptomLogs]);

  useEffect(() => {
    if (viewState === 'app' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          const name = data.address.city || data.address.town || data.address.village || data.address.county || "Local Area";
          setUserLocationName(name);
        } catch (err) {
          console.warn("Global reverse geocoding failed", err);
        }
      }, undefined, { timeout: 10000 });
    }
  }, [viewState]);


  // Navigation Handlers
  const handleNavigateToLogin = () => {
      setAuthMode('signin');
      setViewState('auth');
  };

  const handleNavigateToSignup = () => {
      setAuthMode('signup');
      setViewState('auth');
  };
  
  const handleBackToLanding = () => {
      setViewState('landing');
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard'); // Reset tab on login
    setViewState('app');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCart([]); // Optional: clear cart on logout
    setIsCheckoutOpen(false);
    setIsDND(false);
    setViewState('landing');
  };

  const toggleFeature = (key: keyof AppFeatures) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addToCart = (item: CartItem) => {
    // Inject DND status if active
    const finalItem = {
        ...item,
        status: 'Pending',
        deliveryMode: isDND ? 'Contactless (DND)' : 'Standard',
        details: isDND && !item.details?.includes('Contactless') ? `${item.details || ''} [Contactless]` : item.details
    };
    setCart(prev => [...prev, finalItem as CartItem]);
  };
  
  const handleLogSymptom = (entry: SymptomLogEntry) => {
      setSymptomLogs(prev => [entry, ...prev]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const markTaskComplete = (txId: string, itemId: string) => {
    setHistory(prevHistory => {
        return prevHistory.map(tx => {
            if (tx.id === txId) {
                return {
                    ...tx,
                    items: tx.items.map(item => 
                        item.id === itemId ? { ...item, status: 'Completed' } : item
                    )
                };
            }
            return tx;
        });
    });
  };

  // Calculation Logic (Only for Checkout)
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const isRoyal = currentUser?.tier === UserTier.ROYAL;
  const discountRate = isRoyal ? 0.10 : 0;
  const discountAmount = subtotal * discountRate;
  const netSubtotal = subtotal - discountAmount;
  const serviceFee = netSubtotal * 0.10;
  const finalTotal = netSubtotal + serviceFee;
  
  const hotelShare = netSubtotal * ((100 - commissionRate) / 100);
  const adminShare = netSubtotal * (commissionRate / 100);

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        const txnId = `TXN-${Date.now().toString().slice(-8)}`;
        setTransactionId(txnId);
        const newTxn: Transaction = {
            id: txnId,
            date: new Date().toISOString(),
            items: cart.map(item => ({...item, status: 'Pending'})), // Ensure status is pending
            total: finalTotal
        };
        setHistory(prev => [newTxn, ...prev]);
        setShowReceipt(true);
    }, 2500); 
  };

  const handleCloseReceipt = () => {
      setCart([]);
      setShowReceipt(false);
      setIsCheckoutOpen(false);
  };

  // RENDER LOGIC

  // 1. Landing Page
  if (viewState === 'landing') {
      return <LandingPage onGetStarted={handleNavigateToSignup} onLogin={handleNavigateToLogin} />;
  }

  // 2. Auth Screen
  if (viewState === 'auth') {
      return <LoginScreen onLogin={handleLogin} onBack={handleBackToLanding} initialMode={authMode} />;
  }

  // 3. Main App Logic (Requires User)
  if (!currentUser) {
      // Fallback, shouldn't happen due to viewState logic
      return <LoginScreen onLogin={handleLogin} onBack={handleBackToLanding} />;
  }

  // 4. Admin / Staff Views (Unified Dashboard Component)
  if (currentUser.role !== UserRole.GUEST) {
    return (
        <AdminDashboards 
            user={currentUser} 
            history={history} 
            features={features}
            toggleFeature={toggleFeature}
            onLogout={handleLogout}
            commissionRate={commissionRate}
            setCommissionRate={setCommissionRate}
            inventory={inventory}
            setInventory={setInventory}
            markTaskComplete={markTaskComplete}
        />
    );
  }

  // 5. Guest View (Existing Layout & logic)
  const renderGuestContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard cart={cart} history={history} user={currentUser} commissionRate={commissionRate} symptomLogs={symptomLogs} />;
      case 'booking':
        return <RoomBooking addToCart={addToCart} />;
      case 'nutrition':
        return <NutritionAI addToCart={addToCart} user={currentUser || MOCK_USER} />;
      case 'fitness':
        return <FitnessAI addToCart={addToCart} isDND={isDND} />;
      case 'spa':
        return <SpaWellness addToCart={addToCart} isDND={isDND} onLogSymptom={handleLogSymptom} />;
      case 'navigation':
        return <NavigationModule 
          userLocation={userLocationName} 
          initialQuery={navQuery} 
          clearInitialQuery={() => setNavQuery('')} 
        />;
      case 'concierge':
        return <WellnessChat 
          addToCart={addToCart} 
          userLocation={userLocationName} 
          onNavigate={handleJumpToNavigation} 
        />;
      default:
        return <Dashboard cart={cart} history={history} user={currentUser} commissionRate={commissionRate} symptomLogs={symptomLogs} />;
    }
  };

  return (
    <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userTier={currentUser.tier} 
        enabledFeatures={features}
        onLogout={handleLogout}
        isDND={isDND}
        toggleDND={() => setIsDND(!isDND)}
    >
      {renderGuestContent()}

      {/* Floating Cart Button (Guest Only) */}
      {!isCheckoutOpen && (
        <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="fixed bottom-8 right-8 bg-luxury-gold text-black p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 border-4 border-luxury-charcoal group"
        >
            {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                {cart.length}
                </span>
            )}
            <span className="text-2xl group-hover:rotate-12 transition-transform block">🛍️</span>
        </button>
      )}

      {/* Checkout Modal (Guest Only) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in p-4">
          <div className="w-full max-w-md bg-luxury-charcoal h-full border-l border-luxury-gold/30 shadow-2xl overflow-hidden flex flex-col relative rounded-xl md:rounded-none ml-auto">
            <div className="p-8 pb-4 flex justify-between items-center bg-black/20">
               <h2 className="font-serif text-2xl md:text-3xl text-luxury-gold">
                   {showReceipt ? 'Transaction Receipt' : 'Pre-Arrival Bag'}
               </h2>
               {!isProcessing && !showReceipt && (
                   <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-400 hover:text-white text-2xl hover:rotate-90 transition-transform">&times;</button>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4">
               {showReceipt ? (
                   <div className="space-y-6 animate-fade-in">
                       <div className="text-center py-6 border-b border-white/10">
                           <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black text-3xl shadow-[0_0_20px_rgba(212,175,55,0.4)]">✓</div>
                           <h3 className="text-white font-serif text-2xl">Payment Successful</h3>
                           <p className="text-gray-400 text-sm mt-1">Ref: {transactionId}</p>
                       </div>
                       <div className="space-y-4">
                           <p className="text-xs uppercase tracking-widest text-gray-500">Items Processed</p>
                           {cart.map((item, idx) => (
                               <div key={idx} className="flex justify-between text-sm">
                                   <span className="text-white">{item.name}</span>
                                   <span className="text-gray-400">${item.price}</span>
                               </div>
                           ))}
                       </div>
                       <div className="border-t border-white/10 pt-4 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                            {isRoyal && <div className="flex justify-between text-sm"><span className="text-luxury-gold">Royal Discount</span><span className="text-luxury-gold">-${discountAmount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-sm"><span className="text-gray-400">Service Fee</span><span className="text-white">${serviceFee.toFixed(2)}</span></div>
                            <div className="flex justify-between text-xl font-bold text-luxury-gold pt-2 border-t border-dashed border-gray-700 mt-2"><span>Total Paid</span><span>${finalTotal.toFixed(2)}</span></div>
                       </div>
                       <div className="bg-black/30 p-4 rounded text-xs text-gray-500 mt-8 border border-white/5">
                           <p className="uppercase tracking-widest mb-2 font-bold opacity-50">SmartGuest Financial Engine (Split)</p>
                           <div className="flex justify-between"><span>Hotel Revenue ({100 - commissionRate}%):</span><span>${hotelShare.toFixed(2)}</span></div>
                           <div className="flex justify-between"><span>Platform Commission ({commissionRate}%):</span><span>${adminShare.toFixed(2)}</span></div>
                       </div>
                   </div>
               ) : (
                   <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center mt-20 opacity-50"><div className="text-6xl mb-4">🕸️</div><p className="text-gray-400">Your itinerary is empty.</p></div>
                        ) : (
                            cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded border border-white/5 hover:border-luxury-gold/30 transition-colors">
                                <div>
                                    <h4 className="font-bold text-white">{item.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] uppercase bg-luxury-gold/20 text-luxury-gold px-1 rounded">{item.type}</span>
                                        {item.deliveryMode === 'Contactless (DND)' && <span className="text-[10px] uppercase bg-red-500/20 text-red-400 px-1 rounded">DND</span>}
                                        {item.locationTier && <span className="text-[10px] uppercase bg-blue-500/20 text-blue-400 px-1 rounded">{item.locationTier}</span>}
                                    </div>
                                    {/* Show little icon if it has AI reasoning */}
                                    {item.aiReasoning && (
                                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <span>🧠 AI Recommended</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4"><span className="text-luxury-gold font-mono">${item.price}</span><button onClick={() => removeFromCart(idx)} disabled={isProcessing} className="text-red-500 hover:text-red-400 px-2 disabled:opacity-30">&times;</button></div>
                            </div>
                            ))
                        )}
                   </div>
               )}
            </div>

            <div className="p-8 border-t border-white/10 bg-black/20">
              {showReceipt ? (
                  <button onClick={handleCloseReceipt} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded font-bold uppercase tracking-widest transition-colors border border-white/10">Close & Start New Itinerary</button>
              ) : (
                  <>
                    <div className="flex justify-between mb-2"><span className="text-gray-400">Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                    {isRoyal && <div className="flex justify-between mb-2"><span className="text-luxury-gold">Royal Discount (10%)</span><span className="text-luxury-gold">-${discountAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between mb-6"><span className="text-gray-400">Service Fee (10%)</span><span className="text-white">${serviceFee.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-8 text-xl font-bold text-luxury-gold border-t border-white/10 pt-4"><span>Total Due</span><span>${finalTotal.toFixed(2)}</span></div>
                    <button onClick={handlePayment} disabled={cart.length === 0 || isProcessing} className="w-full bg-luxury-gold text-black py-4 rounded font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:shadow-none relative overflow-hidden">
                        {isProcessing ? <div className="flex items-center justify-center gap-3"><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div><span>Processing...</span></div> : 'Secure Checkout'}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-wider">Processed via SmartGuest Financial Engine</p>
                  </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
