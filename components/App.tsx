
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import NutritionAI from './NutritionAI';
import FitnessAI from './FitnessAI';
import RoomBooking from './RoomBooking';
import WellnessChat from './WellnessChat';
import LoginScreen from './LoginScreen';
import LandingPage from './LandingPage';
import AdminDashboards from './AdminDashboards';
import SpaWellness from './SpaWellness';
import { MOCK_USER, MOCK_INVENTORY } from '../constants';
import { CartItem, UserTier, Transaction, UserProfile, UserRole, AppFeatures, InventoryItem, SymptomLogEntry } from '../types';

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
    <div className="space-y-8">
      {/* Hero Widget */}
      <div className="relative rounded-[2.5rem] overflow-hidden h-[400px] shadow-2xl border border-white/5 group">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" alt="Resort Hero" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-10 md:p-14">
          <div className="animate-fade-in-up">
              <p className="text-luxury-gold uppercase tracking-[0.3em] text-xs font-bold mb-2 shadow-black drop-shadow-md">Sanctuary Mode</p>
              <h2 className="font-serif text-4xl md:text-6xl text-white mb-2 shadow-black drop-shadow-lg">Karibu, {user.name.split(' ')[0]}.</h2>
              <p className="text-lg text-gray-200 drop-shadow-md max-w-lg font-light">The weather is perfect for a sunset yoga session. Your itinerary is clear for the evening.</p>
          </div>
        </div>
      </div>
      
      {/* Quick Status Widgets (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Accommodation Widget */}
        <div className="glass-card p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">🛏️</div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Stays</span>
          </div>
          <div className="space-y-1">
              <p className="text-3xl font-serif text-white">{rooms.length > 0 ? rooms.length : '0'}</p>
              <p className="text-xs text-gray-400 font-medium">{rooms.length > 0 ? rooms[0].name : 'No Active Booking'}</p>
          </div>
          {rooms.length === 0 && <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full w-0 bg-blue-500"></div></div>}
          {rooms.length > 0 && <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full w-full bg-blue-500"></div></div>}
        </div>

        {/* Wellness Widget */}
        <div className="glass-card p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-6">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">🧘</div>
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wellness</span>
          </div>
          <div className="space-y-1">
             <p className="text-3xl font-serif text-white">{services.length + rentals.length}</p>
             <p className="text-xs text-gray-400 font-medium">Sessions Scheduled</p>
          </div>
           <div className="mt-4 flex -space-x-2">
               {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-black backdrop-blur-sm"></div>)}
           </div>
        </div>

        {/* Dining Widget */}
        <div className="glass-card p-6 rounded-[2rem] hover:bg-white/5 transition-all duration-300 group cursor-default relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/20 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-6">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">🥗</div>
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dining</span>
          </div>
          <div className="space-y-1">
             <p className="text-3xl font-serif text-white">{food.length}</p>
             <p className="text-xs text-gray-400 font-medium">Items in Cart</p>
          </div>
        </div>

        {/* Total Cost Widget */}
        <div className="bg-gradient-to-br from-luxury-gold to-[#B89830] p-6 rounded-[2rem] shadow-[0_10px_40px_rgba(212,175,55,0.3)] relative overflow-hidden text-black group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex justify-between items-start">
                   <h3 className="font-bold text-xs uppercase tracking-widest opacity-70">Total Due</h3>
                   <div className="bg-black/10 p-1.5 rounded-full"><div className="w-2 h-2 bg-black rounded-full animate-pulse"></div></div>
               </div>
               <div>
                   <p className="text-4xl font-serif font-bold tracking-tight">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                   <p className="text-[10px] font-bold opacity-60 mt-1 uppercase">Pending Checkout</p>
               </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AI Health Profile Card */}
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 font-serif text-9xl text-white pointer-events-none">Aa</div>
            
            <h3 className="font-serif text-2xl text-white mb-6 flex items-center gap-3">
                <span>Health Profile</span>
                <span className="bg-luxury-gold/20 text-luxury-gold text-[10px] px-2 py-0.5 rounded-full font-sans font-bold uppercase tracking-wide">Live</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Goal</p>
                    <p className="text-white font-medium">{user.healthGoal}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Mood</p>
                    <p className="text-white font-medium">{user.mood}</p>
                </div>
            </div>

            {/* Symptom Log Timeline */}
            <div className="mt-auto">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4 ml-1">Recent Consultations</p>
                {symptomLogs.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                        <p className="text-sm text-gray-600">No logs yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {symptomLogs.map(log => (
                            <div key={log.id} className="flex gap-4 items-start group">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-luxury-gold group-hover:shadow-[0_0_10px_rgba(212,175,55,0.8)] transition-shadow"></div>
                                    <div className="w-px h-full bg-white/10"></div>
                                </div>
                                <div className="pb-4">
                                    <p className="text-sm text-white font-medium">{log.recommendedTreatmentName}</p>
                                    <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()} • {log.symptoms.join(', ')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Booking History */}
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col relative">
            <h3 className="font-serif text-2xl text-white mb-6">Transaction History</h3>
            {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-30 py-12">
                    <span className="text-6xl mb-4 grayscale">📜</span>
                    <p>No past transactions.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar space-y-2">
                    {history.map((tx) => (
                        <div 
                          key={tx.id} 
                          onClick={() => setSelectedTransaction(tx)}
                          className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-colors border border-transparent hover:border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                                    🧾
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">Booking #{tx.id.slice(-6)}</p>
                                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.items.length} items</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white font-mono font-bold">${tx.total.toFixed(0)}</p>
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Paid</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Booking Details Modal - iOS Sheet Style */}
      {selectedTransaction && (
        <div 
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xl p-0 md:p-4 animate-fade-in"
          onClick={() => setSelectedTransaction(null)}
        >
          <div 
            className="bg-[#1c1c1e] max-w-lg w-full rounded-t-[2.5rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
              <div className="h-1.5 w-12 bg-white/20 rounded-full mx-auto mt-4 mb-2 md:hidden"></div>
              
              {/* Header */}
              <div className="p-8 pb-4 border-b border-white/5">
                  <h3 className="font-serif text-3xl text-white text-center">Receipt</h3>
                  <p className="text-center text-gray-500 text-sm mt-1 font-mono tracking-widest">{selectedTransaction.id}</p>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                  <div className="space-y-4">
                      {selectedTransaction.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                              <div className="flex-1 pr-4">
                                  <p className="text-white font-medium text-sm">{item.name}</p>
                                  {item.aiReasoning && (
                                      <p className="text-[10px] text-luxury-gold mt-1 italic">"{item.aiReasoning.slice(0, 50)}..."</p>
                                  )}
                              </div>
                              <p className="text-gray-400 font-mono text-sm">${item.price}</p>
                          </div>
                      ))}
                  </div>
                  
                  <div className="border-t border-dashed border-white/10 pt-6">
                      <div className="flex justify-between items-center">
                          <span className="text-gray-500 uppercase tracking-widest text-xs">Total Paid</span>
                          <span className="text-3xl font-serif text-luxury-gold">${selectedTransaction.total.toFixed(2)}</span>
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-black/20 text-center">
                  <button onClick={() => setSelectedTransaction(null)} className="text-white hover:text-gray-300 font-bold uppercase tracking-widest text-xs">Close Receipt</button>
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
      case 'concierge':
        return <WellnessChat addToCart={addToCart} />;
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
            className="fixed bottom-8 right-8 bg-luxury-gold text-black w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform z-40 flex items-center justify-center group"
        >
            {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {cart.length}
                </span>
            )}
            <span className="text-2xl group-hover:rotate-12 transition-transform block">🛍️</span>
        </button>
      )}

      {/* Checkout Modal (Guest Only) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-[#1c1c1e]/90 backdrop-blur-md h-full border-l border-white/10 shadow-2xl overflow-hidden flex flex-col relative rounded-l-[2.5rem] animate-fade-in-up">
            <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
               <h2 className="font-serif text-2xl text-white">
                   {showReceipt ? 'Payment Confirmed' : 'Your Bag'}
               </h2>
               {!isProcessing && !showReceipt && (
                   <button onClick={() => setIsCheckoutOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">&times;</button>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar">
               {showReceipt ? (
                   <div className="space-y-6 animate-fade-in">
                       <div className="text-center py-10">
                           <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-black text-3xl shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-float">✓</div>
                           <h3 className="text-white font-serif text-2xl mb-2">Success</h3>
                           <p className="text-gray-400 text-sm font-mono tracking-widest">{transactionId}</p>
                       </div>
                       
                       <div className="glass-panel p-6 rounded-2xl">
                           <div className="flex justify-between text-sm mb-4 border-b border-white/10 pb-4">
                               <span className="text-gray-400">Amount Paid</span>
                               <span className="text-white font-bold text-lg">${finalTotal.toFixed(2)}</span>
                           </div>
                           <p className="text-xs text-center text-gray-500">A digital receipt has been sent to your email.</p>
                       </div>
                   </div>
               ) : (
                   <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center mt-32 opacity-30"><div className="text-6xl mb-4 grayscale">🕸️</div><p className="text-gray-400">Bag is empty.</p></div>
                        ) : (
                            cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[10px] uppercase bg-luxury-gold/10 text-luxury-gold px-1.5 py-0.5 rounded font-bold">{item.type}</span>
                                        {item.deliveryMode === 'Contactless (DND)' && <span className="text-[10px] uppercase bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold">DND</span>}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-white font-mono">${item.price}</span>
                                    <button onClick={() => removeFromCart(idx)} disabled={isProcessing} className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30">&times;</button>
                                </div>
                            </div>
                            ))
                        )}
                   </div>
               )}
            </div>

            <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-md">
              {showReceipt ? (
                  <button onClick={handleCloseReceipt} className="w-full bg-white/10 hover:bg-white text-white hover:text-black py-4 rounded-2xl font-bold uppercase tracking-widest transition-all">Start New Order</button>
              ) : (
                  <>
                    <div className="space-y-2 mb-6 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                        {isRoyal && <div className="flex justify-between"><span className="text-luxury-gold">Royal Discount</span><span className="text-luxury-gold">-${discountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between"><span className="text-gray-500">Service Fee</span><span className="text-white">${serviceFee.toFixed(2)}</span></div>
                        <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10 mt-4"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
                    </div>
                    
                    <button onClick={handlePayment} disabled={cart.length === 0 || isProcessing} className="w-full bg-luxury-gold text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        {isProcessing ? 'Processing...' : 'Pay with Apple Pay'}
                    </button>
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
