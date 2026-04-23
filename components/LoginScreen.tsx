
import React, { useState } from 'react';
import { UserRole, UserTier, UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  onBack: () => void;
  initialMode?: 'signin' | 'signup';
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  const personas: UserProfile[] = [
    { name: "System Owner", role: UserRole.SUPER_ADMIN, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
    { name: "General Manager", role: UserRole.HOTEL_ADMIN, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
    { name: "Chef Gordon", role: UserRole.CHEF, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
    { name: "Coach Mike", role: UserRole.TRAINER, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
    { name: "Sarah (Spa)", role: UserRole.SPA_MANAGER, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
    { name: "James (Concierge)", role: UserRole.CONCIERGE, tier: UserTier.NORMAL, healthGoal: "-", dietaryRestrictions: [], mood: "-" },
  ];

  const guestPersona: UserProfile = {
    name: "Juma Baraka",
    role: UserRole.GUEST,
    tier: UserTier.ROYAL,
    healthGoal: "Muscle Gain",
    dietaryRestrictions: ["Gluten Free"],
    mood: "Relaxed"
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop" alt="Lobby" className="w-full h-full object-cover opacity-30 filter blur-sm scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[80vh] flex flex-col md:flex-row bg-[#1c1c1e] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in-up">
        
        {/* Left Side: Visual */}
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-luxury-gold/5 p-12 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-transparent opacity-30"></div>
             <div>
                 <h2 className="text-3xl font-serif font-bold text-luxury-gold mb-2">SMARTGUEST</h2>
                 <p className="text-xs uppercase tracking-widest text-gray-400">Ecosystem v5.0</p>
             </div>
             <div className="relative z-10">
                 <p className="text-2xl font-serif text-white leading-relaxed italic">
                    "{mode === 'signin' ? 'Welcome back to your sanctuary.' : 'Your journey to holistic wellness begins here.'}"
                 </p>
             </div>
             <button onClick={onBack} className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors relative z-10">
                 ← Back to Home
             </button>
        </div>

        {/* Right Side: Form / Selection */}
        <div className="flex-1 p-8 md:p-12 flex flex-col bg-[#1c1c1e]">
            {/* Toggle */}
            <div className="flex self-center bg-black/40 rounded-full p-1 border border-white/5 mb-8">
                <button 
                    onClick={() => setMode('signin')}
                    className={`px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'signin' ? 'bg-luxury-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Sign In
                </button>
                <button 
                    onClick={() => setMode('signup')}
                    className={`px-8 py-2 rounded-full text-sm font-bold transition-all duration-300 ${mode === 'signup' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Sign Up
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {mode === 'signin' ? (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Select Account</h3>
                            <p className="text-gray-400 text-sm">For demonstration purposes, choose a persona.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {/* Guest Quick Login */}
                            <button
                                onClick={() => onLogin(guestPersona)}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center font-bold text-xl shadow-lg">
                                    👤
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold group-hover:text-luxury-gold transition-colors">{guestPersona.name}</p>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Royal Guest • VIP</p>
                                </div>
                                <span className="ml-auto text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            <div className="my-4 border-t border-white/5 relative">
                                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#1c1c1e] px-2 text-xs text-gray-500">Staff Access</span>
                            </div>

                            {personas.map((persona) => (
                                <button
                                    key={persona.role}
                                    onClick={() => onLogin(persona)}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-white/5 transition-all"
                                >
                                    <span className="text-lg opacity-70">{getIcon(persona.role)}</span>
                                    <span className="text-gray-300 text-sm">{persona.name} <span className="text-gray-600">({persona.role})</span></span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-4 animate-bounce">
                            ✨
                        </div>
                        <h3 className="text-2xl font-bold text-white">Join SmartGuest</h3>
                        <p className="text-gray-400 max-w-xs">
                            Create a guest profile to unlock AI nutrition, wellness tracking, and premium concierge services.
                        </p>
                        
                        <form className="w-full max-w-sm space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(guestPersona); }}>
                            <input type="text" placeholder="Full Name" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-luxury-gold outline-none" />
                            <input type="email" placeholder="Email Address" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-luxury-gold outline-none" />
                            <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-luxury-gold transition-colors shadow-lg">
                                Create Account (Demo)
                            </button>
                        </form>
                    </div>
                )}
            </div>
            
            <div className="mt-6 text-center">
                <button onClick={onBack} className="md:hidden text-xs text-gray-500 hover:text-white underline">Back to Home</button>
            </div>
        </div>
      </div>
    </div>
  );
};

const getIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN: return '🌐';
    case UserRole.HOTEL_ADMIN: return '🏨';
    case UserRole.CHEF: return '👨‍🍳';
    case UserRole.TRAINER: return '💪';
    case UserRole.SPA_MANAGER: return '🌿';
    case UserRole.CONCIERGE: return '🛎️';
    case UserRole.GUEST: return '👤';
    default: return '👔';
  }
};

export default LoginScreen;
