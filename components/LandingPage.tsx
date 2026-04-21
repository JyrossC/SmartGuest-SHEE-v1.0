
import React, { useEffect, useState, useRef } from 'react';
import { ROOMS, MENU_ITEMS, SPA_TREATMENTS } from '../constants';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

type PageType = 'HOME' | 'ACCOMMODATIONS' | 'WELLNESS' | 'CULINARY' | 'VILLAS' | 'ABOUT' | 'SUSTAINABILITY' | 'CAREERS' | 'PRESS' | 'PRIVACY' | 'TERMS';

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number, key?: React.Key }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting) setVisible(true);
        });
      });
      if(domRef.current) observer.observe(domRef.current);
      return () => observer.disconnect();
    }, []);
  
    return (
      <div
        ref={domRef}
        className={`transition-all duration-1000 transform ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
};

// --- SUB-PAGES ---

const AccommodationsView = ({ onReserve, filterVilla = false }: { onReserve: () => void, filterVilla?: boolean }) => {
    const displayedRooms = filterVilla ? ROOMS.filter(r => r.type === 'Villa') : ROOMS;
    const title = filterVilla ? "Private Villas" : "Accommodations";
    const subtitle = filterVilla ? "Exclusive residences for those seeking absolute privacy." : "Designed for deep rest and restoration.";

    return (
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
             <div className="text-center mb-16">
                <h2 className="text-5xl font-serif font-bold mb-4">{title}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-12">
                {displayedRooms.map((room, idx) => (
                    <FadeInSection key={room.id} delay={idx * 100}>
                        <div className="flex flex-col md:flex-row gap-8 bg-[#121212] rounded-3xl overflow-hidden border border-white/5 hover:border-luxury-gold/30 transition-all group">
                            <div className="w-full md:w-1/2 h-80 md:h-auto relative overflow-hidden">
                                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded text-xs uppercase font-bold text-white border border-white/10">
                                    {room.type}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col justify-center flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-3xl font-serif text-white">{room.name}</h3>
                                    <p className="text-2xl font-mono text-luxury-gold">${room.price}<span className="text-sm text-gray-500">/night</span></p>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">{room.description}</p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {room.amenities.map(am => (
                                        <span key={am} className="text-xs uppercase tracking-wider bg-white/5 px-3 py-1 rounded text-gray-300">{am}</span>
                                    ))}
                                </div>
                                <button onClick={onReserve} className="self-start px-8 py-3 bg-luxury-gold text-black font-bold uppercase tracking-widest rounded hover:bg-white transition-colors">
                                    Reserve Now
                                </button>
                            </div>
                        </div>
                    </FadeInSection>
                ))}
            </div>
        </div>
    );
};

const WellnessView = ({ onReserve }: { onReserve: () => void }) => (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-4">Wellness & Spa</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Science-backed therapies meets ancient healing traditions.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
            <FadeInSection>
                <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070" className="rounded-3xl w-full h-[500px] object-cover" alt="Spa" />
            </FadeInSection>
            <FadeInSection delay={200}>
                <h3 className="text-3xl font-serif text-white mb-6">The Symptom Spa</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    Unlike traditional spas, our menu is dynamic. Our AI analyzes your physical state—whether you are suffering from jetlag, muscle fatigue from a safari, or stress—and recommends the precise botanical treatment you need.
                </p>
                <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-luxury-gold">✓</span> In-Room Private Treatments</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-luxury-gold">✓</span> AI-Powered Health Profiling</li>
                    <li className="flex items-center gap-3 text-gray-300"><span className="text-luxury-gold">✓</span> Native African Botanicals</li>
                </ul>
                <button onClick={onReserve} className="text-luxury-gold border-b border-luxury-gold pb-1 hover:text-white hover:border-white transition-colors">
                    Access Wellness Portal →
                </button>
            </FadeInSection>
        </div>

        <h3 className="text-2xl font-serif text-white mb-8 border-b border-white/10 pb-4">Signature Therapies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SPA_TREATMENTS.map((t, idx) => (
                <FadeInSection key={t.id} delay={idx * 100}>
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-luxury-gold transition-all h-full flex flex-col">
                        <h4 className="text-xl font-bold text-white mb-2">{t.name}</h4>
                        <p className="text-sm text-luxury-gold mb-4">{t.durationMin} Minutes • ${t.price}</p>
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">{t.description}</p>
                    </div>
                </FadeInSection>
            ))}
        </div>
    </div>
);

const CulinaryView = ({ onReserve }: { onReserve: () => void }) => (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-16">
            <h2 className="text-5xl font-serif font-bold mb-4">Culinary Journeys</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Where gastronomy meets metabolic health.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
             {MENU_ITEMS.map((item, idx) => (
                 <FadeInSection key={item.id} delay={idx * 50}>
                     <div className="bg-[#121212] rounded-2xl overflow-hidden group border border-white/5">
                         <div className="h-64 overflow-hidden">
                             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <div className="p-6">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-xl font-serif text-white">{item.name}</h4>
                                 <span className="text-luxury-gold">${item.price}</span>
                             </div>
                             <p className="text-xs text-gray-500 mb-4">{item.category} • {item.calories} kcal</p>
                             <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                             <div className="flex gap-2">
                                 {item.tags.map(tag => (
                                     <span key={tag} className="text-[10px] uppercase border border-white/10 px-2 py-1 rounded text-gray-500">{tag}</span>
                                 ))}
                             </div>
                         </div>
                     </div>
                 </FadeInSection>
             ))}
        </div>
        
        <div className="bg-luxury-charcoal p-12 rounded-3xl border border-luxury-gold/20 text-center">
            <h3 className="text-3xl font-serif text-white mb-4">AI Nutritionist</h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Create a guest profile to unlock our AI Nutritionist. It will curate a bespoke menu for your entire stay based on your DNA, allergies, and fitness goals.
            </p>
            <button onClick={onReserve} className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-luxury-gold transition-colors">
                Create Dining Profile
            </button>
        </div>
    </div>
);

const AboutView = () => (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen animate-fade-in">
        <h2 className="text-5xl font-serif font-bold mb-8 text-center">About SHEE</h2>
        <div className="prose prose-invert prose-lg mx-auto">
            <p className="lead text-xl text-luxury-gold mb-8">
                SmartGuest AI Ecosystem (SHEE) is not just a hotel platform; it is a philosophy of hospitality that places human well-being at the center of the experience, powered by invisible intelligence.
            </p>
            <p className="text-gray-300 mb-6">
                Founded in 2024, SHEE was born from a simple observation: modern luxury travelers do not just want a bed to sleep in; they want to leave their vacation feeling better than when they arrived. They want hyper-personalization without intrusion.
            </p>
            <p className="text-gray-300 mb-6">
                We integrate state-of-the-art AI agents—Nutritionists, Trainers, and Concierges—into the fabric of resort operations. This allows us to offer "The Wellness Trinity": harmonizing the Body, Mind, and Soul of every guest.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                <div className="bg-[#1a1a1a] p-6 rounded-xl border-l-4 border-luxury-gold">
                    <h4 className="font-bold text-white mb-2">Our Mission</h4>
                    <p className="text-sm text-gray-400">To transform every hotel stay into a transformative wellness journey.</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border-l-4 border-luxury-gold">
                    <h4 className="font-bold text-white mb-2">Our Vision</h4>
                    <p className="text-sm text-gray-400">A world where hospitality is the primary driver of preventative health.</p>
                </div>
            </div>
        </div>
    </div>
);

const SustainabilityView = () => (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
        <h2 className="text-5xl font-serif font-bold mb-8 text-center text-green-400">Sustainability</h2>
        <div className="bg-[#121212] p-8 rounded-3xl border border-white/5 mb-12">
            <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2127" className="w-full h-64 object-cover rounded-xl mb-8 opacity-80" alt="Nature" />
            <h3 className="text-2xl font-bold text-white mb-4">Paperless. Plastic-Free. Precise.</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
                The SmartGuest Ecosystem reduces hotel waste by up to 40% through AI-driven inventory management. 
                By predicting exactly what guests will eat and use, we minimize food spoilage and resource overuse.
            </p>
            <ul className="space-y-4">
                <li className="flex items-center gap-4 text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>100% Digital Guest Journey (No paper menus or bills)</span>
                </li>
                <li className="flex items-center gap-4 text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Locally Sourced Ingredients (Farm-to-Table only)</span>
                </li>
                <li className="flex items-center gap-4 text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Smart Energy Management in Villas</span>
                </li>
            </ul>
        </div>
    </div>
);

const CareersView = () => (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen">
        <h2 className="text-5xl font-serif font-bold mb-4 text-center">Join the Collective</h2>
        <p className="text-center text-gray-400 mb-16">Shape the future of intelligent hospitality.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
                { role: "AI Prompt Engineer", dept: "Technology", loc: "Remote / Zanzibar" },
                { role: "Executive Wellness Chef", dept: "Culinary", loc: "Serengeti Lodge" },
                { role: "Holistic Spa Director", dept: "Wellness", loc: "Kilimanjaro Resort" },
                { role: "Full Stack Developer", dept: "Technology", loc: "Remote" }
            ].map((job, idx) => (
                <div key={idx} className="bg-[#1a1a1a] p-8 rounded-xl border border-white/5 hover:border-luxury-gold transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white group-hover:text-luxury-gold">{job.role}</h3>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{job.dept}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">📍 {job.loc}</p>
                    <span className="text-sm font-bold text-white border-b border-transparent group-hover:border-white transition-all">Apply Now →</span>
                </div>
            ))}
        </div>
    </div>
);

const PressView = () => (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen">
        <h2 className="text-5xl font-serif font-bold mb-12 text-center">Press Room</h2>
        <div className="space-y-8">
            {[
                { date: "Oct 20, 2025", title: "SmartGuest Launches v5.0 with Veo Video Integration", source: "TechCrunch" },
                { date: "Sep 15, 2025", title: "The Hotel That Knows What You Want to Eat Before You Do", source: "Condé Nast Traveler" },
                { date: "Aug 01, 2025", title: "Sustainability in Safari: How AI is Reducing Waste", source: "National Geographic" }
            ].map((news, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b border-white/10 pb-8 hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer">
                    <div className="text-sm text-luxury-gold font-mono w-32">{news.date}</div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif text-white mb-1">{news.title}</h3>
                        <p className="text-gray-500 text-sm">Published in {news.source}</p>
                    </div>
                    <span className="text-white opacity-50">↗</span>
                </div>
            ))}
        </div>
    </div>
);

// --- LEGAL PAGES ---

const PrivacyView = () => (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen animate-fade-in">
        <h2 className="text-5xl font-serif font-bold mb-8">Privacy Policy</h2>
        <div className="prose prose-invert prose-lg text-gray-400">
            <p className="text-xl text-white mb-6">Last Updated: October 2025</p>
            <p className="mb-6">
                At SmartGuest (SHEE), we treat your data with the same discretion as your physical presence in our resort. We believe that privacy is the ultimate luxury. This policy outlines how we collect, use, and protect your information within our AI-integrated ecosystem.
            </p>
            
            <h3 className="text-2xl text-white font-bold mt-8 mb-4">1. Data Collection</h3>
            <p className="mb-4">
                To provide our hyper-personalized services, we collect:
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li><strong>Health Data:</strong> Dietary restrictions, allergies, and fitness goals (voluntarily provided).</li>
                    <li><strong>Biometric Preferences:</strong> Sleep temperature preferences and lighting settings.</li>
                    <li><strong>Usage Data:</strong> Interactions with our AI Concierge, Nutritionist, and Spa services.</li>
                </ul>
            </p>

            <h3 className="text-2xl text-white font-bold mt-8 mb-4">2. AI & Data Usage</h3>
            <p className="mb-4">
                Our Artificial Intelligence models use your data solely to enhance your stay in real-time. 
                <br/><br/>
                <strong>We do not sell your data.</strong> Your health profile is anonymized and processed locally where possible. After checkout, your personal health logs are automatically purged from our active cache unless you choose to save them to a recurring guest profile.
            </p>

            <h3 className="text-2xl text-white font-bold mt-8 mb-4">3. Third-Party Services</h3>
            <p className="mb-4">
                We integrate with select partners (e.g., Veo for video generation, Google Maps for location) to provide specific features. Data shared with these partners is strictly limited to the minimum required for the transaction.
            </p>
        </div>
    </div>
);

const TermsView = () => (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto min-h-screen animate-fade-in">
        <h2 className="text-5xl font-serif font-bold mb-8">Terms of Service</h2>
        <div className="prose prose-invert prose-lg text-gray-400">
            <p className="text-xl text-white mb-6">Effective Date: January 1, 2025</p>
            
            <h3 className="text-2xl text-white font-bold mt-8 mb-4">1. Acceptance of Terms</h3>
            <p className="mb-4">
                By accessing the SmartGuest Ecosystem, booking a stay, or using our AI services, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of our platform.
            </p>

            <h3 className="text-2xl text-white font-bold mt-8 mb-4">2. AI Advisory Disclaimer</h3>
            <p className="mb-4">
                The SmartGuest AI Nutritionist, Fitness Trainer, and Spa Therapist provide recommendations based on general wellness principles and data you provide. 
                <br/><br/>
                <strong>These services do not constitute medical advice.</strong> Please consult with a physician before beginning any rigorous exercise or strict dietary regimen suggested by our system. SHEE is not liable for injuries resulting from unsupervised workouts.
            </p>

            <h3 className="text-2xl text-white font-bold mt-8 mb-4">3. Booking & Cancellations</h3>
            <p className="mb-4">
                Reservations made through the SHEE platform are subject to the specific cancellation policies of the selected property (e.g., Zanzibar vs. Serengeti). Generally, cancellations made less than 48 hours before arrival are non-refundable.
            </p>

            <h3 className="text-2xl text-white font-bold mt-8 mb-4">4. Code of Conduct</h3>
            <p className="mb-4">
                Guests are expected to treat staff and digital infrastructure with respect. Misuse of the AI Concierge (e.g., harassment or illegal queries) may result in immediate suspension of digital privileges.
            </p>
        </div>
    </div>
);

// --- COOKIE MODAL ---

const CookieSettingsModal = ({ onClose }: { onClose: () => void }) => {
    const [preferences, setPreferences] = useState({
        essential: true,
        analytics: false,
        marketing: false,
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const savedPrefs = localStorage.getItem('shee_cookie_prefs');
        if (savedPrefs) {
            setPreferences(JSON.parse(savedPrefs));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('shee_cookie_prefs', JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1c1c1e] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                <div className="p-8 pb-4 border-b border-white/5">
                    <h3 className="text-2xl font-serif text-white">Cookie Preferences</h3>
                    <p className="text-gray-400 text-sm mt-2">
                        We use cookies to ensure the SHEE ecosystem runs smoothly and to personalize your experience.
                    </p>
                </div>
                
                <div className="p-8 space-y-6">
                    {/* Essential */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold">Essential Cookies</p>
                            <p className="text-xs text-gray-500">Required for the site to function (e.g., login, booking).</p>
                        </div>
                        <div className="w-10 h-6 bg-luxury-gold rounded-full opacity-50 cursor-not-allowed relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold">Analytics</p>
                            <p className="text-xs text-gray-500">Helps us improve our AI models based on usage patterns.</p>
                        </div>
                        <button 
                            onClick={() => setPreferences(p => ({...p, analytics: !p.analytics}))}
                            className={`w-10 h-6 rounded-full relative transition-colors ${preferences.analytics ? 'bg-luxury-gold' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${preferences.analytics ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Marketing */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-white font-bold">Marketing</p>
                            <p className="text-xs text-gray-500">Used to show you relevant offers for your next stay.</p>
                        </div>
                        <button 
                            onClick={() => setPreferences(p => ({...p, marketing: !p.marketing}))}
                            className={`w-10 h-6 rounded-full relative transition-colors ${preferences.marketing ? 'bg-luxury-gold' : 'bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${preferences.marketing ? 'right-1' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-black/20 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-wider">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-luxury-gold text-black hover:bg-white'}`}
                    >
                        {saved ? 'Saved ✓' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('HOME');
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (page: PageType) => {
      setCurrentPage(page);
      window.scrollTo(0, 0);
  };

  const handleSubscribe = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newsletterEmail || !newsletterEmail.includes('@')) return;
      
      setNewsletterStatus('loading');
      
      // Simulate API interaction
      setTimeout(() => {
          setNewsletterStatus('success');
          setNewsletterEmail('');
          setTimeout(() => setNewsletterStatus('idle'), 3000);
      }, 1500);
  };

  const renderContent = () => {
      switch(currentPage) {
          case 'ACCOMMODATIONS': return <AccommodationsView onReserve={onGetStarted} />;
          case 'VILLAS': return <AccommodationsView onReserve={onGetStarted} filterVilla={true} />;
          case 'WELLNESS': return <WellnessView onReserve={onGetStarted} />;
          case 'CULINARY': return <CulinaryView onReserve={onGetStarted} />;
          case 'ABOUT': return <AboutView />;
          case 'SUSTAINABILITY': return <SustainabilityView />;
          case 'CAREERS': return <CareersView />;
          case 'PRESS': return <PressView />;
          case 'PRIVACY': return <PrivacyView />;
          case 'TERMS': return <TermsView />;
          default: return (
            <>
              {/* Hero Section */}
              <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover opacity-50 scale-105 animate-pulse-slow"
                        poster="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    >
                        <source src="" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-[#050505]"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto space-y-8 mt-20">
                    <FadeInSection>
                        <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse"></span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-300">AI Ecosystem v5.0</span>
                        </div>
                    </FadeInSection>
                    
                    <FadeInSection delay={200}>
                        <h1 className="text-6xl md:text-9xl font-serif font-bold tracking-tighter text-white mb-6 leading-none">
                            Beyond <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE5B4] to-[#D4AF37] bg-300% animate-shine">Luxury.</span>
                        </h1>
                    </FadeInSection>
                    
                    <FadeInSection delay={400}>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                            A holistic sanctuary where Artificial Intelligence anticipates your needs before you do. 
                            <span className="text-luxury-gold italic"> Mind, Body, and Spirit</span> aligned.
                        </p>
                    </FadeInSection>
                    
                    <FadeInSection delay={600}>
                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center pt-10">
                            <button onClick={onGetStarted} className="group relative px-8 py-4 bg-white text-black rounded-full text-lg font-bold overflow-hidden">
                                <span className="relative z-10 group-hover:text-luxury-gold transition-colors">Start Your Journey</span>
                                <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                            </button>
                            <button onClick={onLogin} className="px-8 py-4 text-white rounded-full text-lg font-bold hover:text-luxury-gold transition-colors flex items-center gap-2 group">
                                <span>Member Access</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </FadeInSection>
                </div>
              </section>

              {/* INTELLIGENCE SECTION (Bento Grid) */}
              <section className="py-32 px-6 max-w-7xl mx-auto">
                <FadeInSection>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">The Intelligence Engine</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">Four integrated AI modules working silently to perfect your stay.</p>
                    </div>
                </FadeInSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Card 1: Nutrition */}
                    <FadeInSection delay={100}>
                        <div onClick={() => navigateTo('CULINARY')} className="group cursor-pointer relative h-full rounded-3xl bg-[#121212] border border-white/5 overflow-hidden hover:border-luxury-gold/30 transition-all duration-500">
                            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" alt="Food" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8">
                                <div className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center text-xl mb-4">🥗</div>
                                <h3 className="text-2xl font-bold text-white mb-2">AI Nutritionist</h3>
                                <p className="text-gray-400 text-sm">Menus generated based on your health goals and DNA.</p>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Card 2: Fitness - Large */}
                    <div className="md:col-span-2 md:row-span-2">
                        <FadeInSection delay={200}>
                            <div onClick={() => navigateTo('WELLNESS')} className="group cursor-pointer relative h-full min-h-[300px] md:min-h-full rounded-3xl bg-[#121212] border border-white/5 overflow-hidden hover:border-luxury-gold/30 transition-all duration-500">
                                <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000" alt="Gym" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-10 max-w-lg">
                                    <div className="w-12 h-12 rounded-full bg-luxury-gold text-black flex items-center justify-center text-2xl mb-6">💪</div>
                                    <h3 className="text-4xl font-bold font-serif text-white mb-4">Smart Fitness</h3>
                                    <p className="text-gray-300 text-lg">Whether in your private villa or our state-of-the-art facility, receive dynamic workout protocols generated in real-time based on your recovery score.</p>
                                </div>
                            </div>
                        </FadeInSection>
                    </div>

                    {/* Card 3: Spa */}
                    <FadeInSection delay={300}>
                        <div onClick={() => navigateTo('WELLNESS')} className="group cursor-pointer relative h-full rounded-3xl bg-[#121212] border border-white/5 overflow-hidden hover:border-luxury-gold/30 transition-all duration-500">
                             <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700" alt="Spa" />
                             <div className="absolute bottom-0 left-0 p-8">
                                <div className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center text-xl mb-4">🌿</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Symptom Spa</h3>
                                <p className="text-gray-400 text-sm">Treatments matched to your physical state.</p>
                            </div>
                        </div>
                    </FadeInSection>

                     {/* Card 4: Concierge */}
                     <FadeInSection delay={400}>
                        <div onClick={() => onGetStarted()} className="group cursor-pointer relative h-full rounded-3xl bg-[#121212] border border-white/5 overflow-hidden hover:border-luxury-gold/30 transition-all duration-500">
                             <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
                             <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
                                 <span className="text-9xl">🛎️</span>
                             </div>
                             <div className="absolute bottom-0 left-0 p-8">
                                <div className="w-10 h-10 rounded-full bg-luxury-gold text-black flex items-center justify-center text-xl mb-4">🤖</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Concierge</h3>
                                <p className="text-gray-400 text-sm">24/7 instant requests and local knowledge.</p>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
              </section>

              {/* ACCOMMODATION SECTION (Horizontal Scroll) */}
              <section className="py-20 bg-[#0a0a0a] border-y border-white/5 relative">
                  <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                      <FadeInSection>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold">Sanctuaries of Silence</h2>
                        <p className="text-gray-400 mt-4 max-w-md">Private villas designed for deep rest. Select your preferred environment.</p>
                      </FadeInSection>
                      <FadeInSection delay={200}>
                          <button onClick={() => navigateTo('ACCOMMODATIONS')} className="text-luxury-gold uppercase tracking-widest text-xs font-bold hover:text-white transition-colors flex items-center gap-2">
                              View All Suites <span>→</span>
                          </button>
                      </FadeInSection>
                  </div>

                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 px-6 pb-12 max-w-[100vw] scrollbar-hide">
                      {ROOMS.map((room, idx) => (
                          <div key={room.id} className="snap-center shrink-0 w-[85vw] md:w-[600px] group cursor-pointer" onClick={() => navigateTo('ACCOMMODATIONS')}>
                              <FadeInSection delay={idx * 100}>
                                <div className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden mb-6">
                                    <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                    <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                        <span className="text-xs font-bold uppercase tracking-wider text-white">{room.type}</span>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-3xl font-serif text-white">{room.name}</h3>
                                        <p className="text-xl font-mono text-luxury-gold">${room.price}</p>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {room.amenities.slice(0,3).map(amenity => (
                                            <span key={amenity} className="text-[10px] uppercase border border-white/10 px-2 py-1 rounded text-gray-500">{amenity}</span>
                                        ))}
                                    </div>
                                </div>
                              </FadeInSection>
                          </div>
                      ))}
                  </div>
              </section>

              {/* CULINARY & WELLNESS (Split Layout) */}
              <section className="py-32 px-6 max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                      
                      {/* Culinary Text */}
                      <FadeInSection>
                          <div>
                              <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Gastronomy</span>
                              <h2 className="text-5xl font-serif font-bold mb-8">Culinary Alchemy</h2>
                              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                  Our Executive Chef partners with the AI Nutritionist to create dishes that are visually stunning and metabolically perfect. 
                                  From Wagyu beef to organic quinoa, every calorie serves a purpose.
                              </p>
                              
                              <div className="space-y-6">
                                  {MENU_ITEMS.slice(0,3).map(item => (
                                      <div key={item.id} className="flex items-center gap-6 group cursor-pointer" onClick={() => navigateTo('CULINARY')}>
                                          <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                          <div>
                                              <h4 className="text-xl font-serif text-white group-hover:text-luxury-gold transition-colors">{item.name}</h4>
                                              <p className="text-sm text-gray-500">{item.calories} kcal • {item.tags[0]}</p>
                                          </div>
                                          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                              <span className="text-luxury-gold">→</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <button onClick={() => navigateTo('CULINARY')} className="mt-8 text-luxury-gold uppercase text-xs font-bold tracking-widest hover:text-white transition-colors">Explore Menus →</button>
                          </div>
                      </FadeInSection>

                      {/* Visual Side */}
                      <FadeInSection delay={200}>
                          <div className="relative">
                              <div className="absolute -inset-4 bg-luxury-gold/5 rounded-full blur-3xl"></div>
                              <div className="relative grid grid-cols-2 gap-4">
                                  <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070" className="rounded-2xl w-full h-64 object-cover transform translate-y-12" alt="Cocktail" />
                                  <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974" className="rounded-2xl w-full h-64 object-cover" alt="Plating" />
                              </div>
                          </div>
                      </FadeInSection>
                  </div>
              </section>

              {/* SPA HIGHLIGHT */}
              <section className="py-20 bg-luxury-charcoal/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <div className="max-w-7xl mx-auto px-6 relative z-10">
                      <FadeInSection>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-serif text-white mb-4">Restorative Therapies</h2>
                            <p className="text-gray-400">Select treatments based on how you feel right now.</p>
                        </div>
                      </FadeInSection>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {SPA_TREATMENTS.map((treatment, idx) => (
                              <FadeInSection key={treatment.id} delay={idx * 100}>
                                  <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 hover:border-luxury-gold transition-all duration-300 group cursor-pointer h-full flex flex-col" onClick={() => navigateTo('WELLNESS')}>
                                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-luxury-gold">{treatment.name}</h3>
                                      <p className="text-xs text-gray-500 mb-4">{treatment.durationMin} mins</p>
                                      <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">{treatment.description}</p>
                                      <span className="text-luxury-gold text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Book Treatment →</span>
                                  </div>
                              </FadeInSection>
                          ))}
                      </div>
                  </div>
              </section>

              {/* CTA Section */}
              <section className="py-32 bg-black text-center px-6 relative overflow-hidden border-b border-white/5">
                 <div className="absolute inset-0 bg-gradient-to-t from-luxury-gold/5 to-transparent pointer-events-none"></div>
                 <FadeInSection>
                     <h2 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 tracking-tighter">
                         Your sanctuary <br/> awaits.
                     </h2>
                     <div className="flex flex-col md:flex-row justify-center gap-6 items-center">
                         <button onClick={onLogin} className="px-12 py-5 bg-luxury-gold text-black rounded-full text-xl font-bold hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105">
                             Access Member Portal
                         </button>
                         <button onClick={onGetStarted} className="px-12 py-5 bg-transparent border border-white/20 text-white rounded-full text-xl font-bold hover:bg-white/10 transition-colors">
                             Create Guest Profile
                         </button>
                     </div>
                 </FadeInSection>
              </section>
            </>
          );
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F7] font-sans selection:bg-luxury-gold selection:text-black overflow-x-hidden flex flex-col">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled || currentPage !== 'HOME' ? 'bg-[#050505]/95 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigateTo('HOME')}>
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">✨</span>
            <span className="font-serif text-xl tracking-[0.2em] text-white group-hover:text-luxury-gold transition-colors">SMARTGUEST</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest font-bold text-gray-400">
             <button onClick={() => navigateTo('ACCOMMODATIONS')} className="hover:text-luxury-gold transition-colors">Stays</button>
             <button onClick={() => navigateTo('WELLNESS')} className="hover:text-luxury-gold transition-colors">Wellness</button>
             <button onClick={() => navigateTo('CULINARY')} className="hover:text-luxury-gold transition-colors">Dining</button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onLogin} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Log In</button>
            <button 
                onClick={onGetStarted}
                className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-luxury-gold transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
                Reserve
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Cookie Settings Modal */}
      {showCookieSettings && (
          <CookieSettingsModal onClose={() => setShowCookieSettings(false)} />
      )}

      {/* SOPHISTICATED FOOTER */}
      <footer className="bg-[#050505] pt-20 pb-10 px-6 border-t border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                
                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => navigateTo('HOME')}>
                        <span className="text-2xl">✨</span>
                        <span className="font-serif text-xl tracking-[0.2em] text-white">SMARTGUEST</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        Redefining hospitality through the seamless integration of artificial intelligence and human intuition. 
                    </p>
                    <div className="flex gap-4">
                        {[
                            { icon: '📸', url: 'https://instagram.com', label: 'Instagram' },
                            { icon: '🐦', url: 'https://twitter.com', label: 'Twitter' },
                            { icon: '💼', url: 'https://linkedin.com', label: 'LinkedIn' },
                            { icon: '📘', url: 'https://facebook.com', label: 'Facebook' }
                        ].map(social => (
                            <a 
                                key={social.label} 
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-sm text-gray-400 hover:border-luxury-gold hover:text-luxury-gold hover:bg-white/5 cursor-pointer transition-all"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Links Column 1 */}
                <div>
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Experience</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li onClick={() => navigateTo('ACCOMMODATIONS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Accommodations</li>
                        <li onClick={() => navigateTo('WELLNESS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Wellness & Spa</li>
                        <li onClick={() => navigateTo('CULINARY')} className="hover:text-luxury-gold cursor-pointer transition-colors">Culinary Journeys</li>
                        <li onClick={() => navigateTo('VILLAS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Private Villas</li>
                    </ul>
                </div>

                {/* Links Column 2 */}
                <div>
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Company</h4>
                    <ul className="space-y-4 text-sm text-gray-500">
                        <li onClick={() => navigateTo('ABOUT')} className="hover:text-luxury-gold cursor-pointer transition-colors">About SHEE</li>
                        <li onClick={() => navigateTo('SUSTAINABILITY')} className="hover:text-luxury-gold cursor-pointer transition-colors">Sustainability</li>
                        <li onClick={() => navigateTo('CAREERS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Careers</li>
                        <li onClick={() => navigateTo('PRESS')} className="hover:text-luxury-gold cursor-pointer transition-colors">Press Room</li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">The Newsletter</h4>
                    <p className="text-gray-500 text-xs mb-4">Curated wellness tips and exclusive offers.</p>
                    
                    {newsletterStatus === 'success' ? (
                        <div className="text-luxury-gold text-xs font-bold animate-fade-in flex items-center gap-2">
                            <span>✓</span> You're on the list.
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex border-b border-white/20 pb-2">
                            <input 
                                type="email" 
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Email Address" 
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-600 focus:ring-0"
                                disabled={newsletterStatus === 'loading'}
                            />
                            <button 
                                type="submit"
                                disabled={newsletterStatus === 'loading'}
                                className="text-luxury-gold text-xs font-bold uppercase hover:text-white transition-colors disabled:opacity-50"
                            >
                                {newsletterStatus === 'loading' ? '...' : 'Join'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-600 text-xs">
                    © 2025 SmartGuest AI Ecosystem. All rights reserved.
                </p>
                <div className="flex gap-6 text-xs text-gray-600">
                    <span onClick={() => navigateTo('PRIVACY')} className="hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
                    <span onClick={() => navigateTo('TERMS')} className="hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
                    <span onClick={() => setShowCookieSettings(true)} className="hover:text-gray-400 cursor-pointer transition-colors">Cookie Settings</span>
                </div>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">
                    Zanzibar • Serengeti • Kilimanjaro
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
