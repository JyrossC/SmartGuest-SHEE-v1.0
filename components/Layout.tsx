
import React, { useState } from 'react';
import { UserTier, AppFeatures } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userTier: UserTier;
  enabledFeatures: AppFeatures;
  onLogout: () => void;
  // FR-09
  isDND: boolean;
  toggleDND: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userTier, enabledFeatures, onLogout, isDND, toggleDND }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: 'Squares2X2Icon', emoji: '🏠', enabled: true },
    { id: 'booking', label: 'Suites', icon: 'HomeModernIcon', emoji: '🛏️', enabled: true },
    { id: 'nutrition', label: 'Dining', icon: 'CakeIcon', emoji: '🥗', enabled: enabledFeatures.nutrition },
    { id: 'fitness', label: 'Fitness', icon: 'BoltIcon', emoji: '💪', enabled: enabledFeatures.fitness },
    {id: 'spa', label: 'Wellness', icon: 'SparklesIcon', emoji: '🌿', enabled: enabledFeatures.spa },
    { id: 'navigation', label: 'Navigator', icon: 'MapIcon', emoji: '🧭', enabled: true },
    { id: 'concierge', label: 'Concierge', icon: 'ChatBubbleLeftRightIcon', emoji: '🛎️', enabled: enabledFeatures.concierge },
  ];

  const canUseDND = userTier === UserTier.VIP || userTier === UserTier.VVIP || userTier === UserTier.ROYAL;

  return (
    <div className="flex h-screen bg-black font-sans text-luxury-cream overflow-hidden selection:bg-luxury-gold selection:text-black">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-luxury-gold/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Floating Glass Dock Style */}
      <aside className={`
        fixed inset-y-4 left-4 z-50 w-72 rounded-[2rem] glass-panel flex flex-col 
        transform transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'}
        md:translate-x-0 md:static md:h-[calc(100vh-2rem)] md:my-4 md:ml-4 shadow-2xl
      `}>
        {/* Header */}
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl text-white tracking-widest font-bold">SHEE<span className="text-luxury-gold">.</span></h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-[0.2em] font-medium">OS v26.2</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Navigation Area */}
        <div className="px-4 flex-1 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* User Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-[1px]">
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-luxury-gold to-yellow-200 flex items-center justify-center text-black font-bold text-xs shadow-lg shadow-luxury-gold/20">
                    {userTier[0]}
                 </div>
                 <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Membership</p>
                    <p className="font-serif text-white">{userTier}</p>
                 </div>
              </div>
              
              {/* DND Toggle - iOS Style Switch */}
              {canUseDND && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-300">Privacy Mode</span>
                      <button 
                        onClick={toggleDND}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${isDND ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-white/10'}`}
                      >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDND ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                  </div>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2">Menu</p>
            {navItems.filter(i => i.enabled).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`group relative w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`text-lg filter ${isActive ? 'grayscale-0' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}>
                      {item.emoji}
                  </span>
                  <span className={`text-sm font-medium tracking-wide ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                  
                  {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse"></div>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6">
            <button 
                onClick={onLogout}
                className="w-full py-3 rounded-xl border border-white/5 text-xs text-red-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all uppercase tracking-widest font-bold flex items-center justify-center gap-2 group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden pt-4 px-6 pb-2 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl bg-black/50">
          <span className="font-serif text-xl text-white">SHEE<span className="text-luxury-gold">.</span></span>
          <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
            ☰
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 md:pr-8 scroll-smooth no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
              {/* DND Banner */}
              {isDND && canUseDND && (
                  <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 animate-fade-in-up border-l-4 border-red-500">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-xl shadow-lg shadow-red-500/10">⛔</div>
                      <div>
                          <h4 className="text-white font-bold text-sm">Privacy Mode Active</h4>
                          <p className="text-xs text-gray-400">Staff have been notified to leave deliveries at the door.</p>
                      </div>
                  </div>
              )}
            
            {/* Page Content Injection */}
            <div className="animate-fade-in-up">
                {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
