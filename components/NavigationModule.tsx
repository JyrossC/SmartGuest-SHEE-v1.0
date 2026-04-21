import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, MapPin, Navigation, Map as MapIcon, Search, ChevronRight, Activity, LocateFixed, Star, Clock, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getNavigationGuide } from '../services/geminiService';

// Fix for Leaflet default marker icon
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface NavStep {
  instruction: string;
  landmark: string;
  distance: string;
}

interface NavGuide {
  objective: string;
  category?: string;
  rating?: number;
  estimatedTime?: string;
  description?: string;
  location?: {
      lat: number;
      lng: number;
  };
  steps: NavStep[];
  bearing: string;
}

interface NavigationModuleProps {
  userLocation: string;
  initialQuery?: string;
  clearInitialQuery?: () => void;
}

// Component to handle map centering
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 14);
        }
    }, [lat, lng, map]);
    return null;
};

const NavigationModule: React.FC<NavigationModuleProps> = ({ userLocation, initialQuery, clearInitialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [guide, setGuide] = useState<NavGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<'map' | 'compass'>('map');

  // Default coordinates (Zanzibar Centerish)
  const defaultCenter: [number, number] = [-6.1659, 39.2026];

  // Deep Link Trigger
  useEffect(() => {
    if (initialQuery) {
        setQuery(initialQuery);
        handleSearch(initialQuery);
        if (clearInitialQuery) clearInitialQuery();
    }
  }, [initialQuery]);

  const bearingToRotation = (bearing: string) => {
    const map: Record<string, number> = {
      'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
      'S': 180, 'SW': 225, 'W': 270, 'NW': 315
    };
    return map[bearing.toUpperCase()] || 0;
  };

  const handleSearch = async (targetQuery?: string) => {
    const searchQuery = targetQuery || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const result = await getNavigationGuide(searchQuery, userLocation);
      if (result) {
        setGuide(result);
        setRotation(bearingToRotation(result.bearing));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Search Header */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search locations... (e.g., The Rock Restaurant, Stone Town)"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-luxury-gold outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-luxury-gold text-black px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-luxury-gold/20 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Search'}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 px-2">
            <div className="flex items-center gap-2">
                <LocateFixed size={14} className="text-luxury-gold animate-pulse" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Origin: {userLocation}</span>
            </div>
            
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button 
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Map
                </button>
                <button 
                    onClick={() => setViewMode('compass')}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'compass' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
                >
                    Compass
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spatial Visualization Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-luxury-charcoal/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 h-[600px] relative shadow-2xl overflow-hidden">
            {viewMode === 'map' ? (
                <MapContainer 
                    center={guide?.location ? [guide.location.lat, guide.location.lng] : defaultCenter} 
                    zoom={13} 
                    className="h-full w-full z-0"
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {guide?.location && (
                        <>
                            <Marker position={[guide.location.lat, guide.location.lng]}>
                                <Popup>
                                    <div className="text-black p-1">
                                        <h4 className="font-bold">{guide.objective}</h4>
                                        <p className="text-xs">{guide.category}</p>
                                    </div>
                                </Popup>
                            </Marker>
                            <RecenterMap lat={guide.location.lat} lng={guide.location.lng} />
                        </>
                    )}
                </MapContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 border border-luxury-gold rounded-full scale-90"></div>
                        <div className="absolute inset-0 border border-dashed border-white rounded-full scale-75"></div>
                    </div>
                    <motion.div 
                        animate={{ rotate: rotation }}
                        transition={{ type: "spring", stiffness: 60, damping: 20 }}
                        className="relative"
                    >
                        <Compass size={240} strokeWidth={0.5} className="text-luxury-gold/20" />
                        <Navigation 
                            size={200} 
                            fill="currentColor" 
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-luxury-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                        />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-bold text-white text-md opacity-50">N</span>
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-bold text-white text-md opacity-50">S</span>
                        <span className="absolute top-1/2 -right-8 -translate-y-1/2 font-bold text-white text-md opacity-50">E</span>
                        <span className="absolute top-1/2 -left-8 -translate-y-1/2 font-bold text-white text-md opacity-50">W</span>
                    </motion.div>
                    <div className="mt-12 text-center">
                        <h3 className="font-serif text-5xl text-white mb-2 uppercase tracking-tighter">
                            {guide?.bearing || '---'}
                        </h3>
                        <p className="text-xs text-luxury-gold uppercase font-bold tracking-widest">Active Bearing</p>
                    </div>
                </div>
            )}
            
            {/* Overlay for Stats if guide exists */}
            {guide && (
                <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-wrap gap-3 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl pointer-events-auto">
                        <div className="flex items-center gap-2 mb-1">
                            <Star className="text-luxury-gold" size={14} fill="currentColor" />
                            <span className="text-white font-bold">{guide.rating || '4.5'}</span>
                            <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-2">{guide.category || 'Destination'}</span>
                        </div>
                        <p className="text-white text-sm font-serif">{guide.objective}</p>
                    </div>
                    
                    <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto">
                        <Clock className="text-luxury-gold" size={18} />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Est. Travel</p>
                            <p className="text-white text-sm font-bold">{guide.estimatedTime || '12 mins'}</p>
                        </div>
                    </div>
                </div>
            )}
          </div>

          <div className="bg-luxury-charcoal/20 border border-white/5 rounded-3xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-luxury-gold/10 rounded-2xl">
                      <Info className="text-luxury-gold" size={20} />
                  </div>
                  <div>
                      <h4 className="text-white text-sm font-bold">Spatial Grounding</h4>
                      <p className="text-xs text-gray-500">
                          {guide?.description || 'Real-time AI analysis of geographic features and landmarks.'}
                      </p>
                  </div>
              </div>
          </div>
        </div>

        {/* Directions Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-luxury-charcoal/30 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 h-full shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Navigation size={120} />
              </div>

              {!guide ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20">
                    <Activity className="text-luxury-gold animate-pulse" size={48} />
                    <div>
                        <h4 className="text-xl text-white font-serif mb-2">Navigator Offline</h4>
                        <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Please input a destination to activate spatial guidance.</p>
                    </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 relative z-10 flex-1"
                >
                  <div>
                      <p className="text-luxury-gold text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center gap-2">
                        <MapPin size={12} /> Directions HUD
                      </p>
                      <h2 className="text-2xl text-white font-serif leading-tight">Step-by-Step</h2>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {guide.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start group">
                              <div className="flex flex-col items-center">
                                  <div className="w-6 h-6 rounded-full border border-luxury-gold/30 flex items-center justify-center text-white text-[9px] font-bold group-hover:bg-luxury-gold group-hover:text-black transition-colors">
                                      {idx + 1}
                                  </div>
                                  {idx < guide.steps.length - 1 && (
                                      <div className="w-px h-10 bg-gradient-to-b from-luxury-gold/30 to-transparent mt-2"></div>
                                  )}
                              </div>
                              <div className="flex-1 pt-1">
                                  <p className="text-gray-200 text-sm font-medium leading-relaxed mb-1">{step.instruction}</p>
                                  <p className="text-[10px] text-luxury-gold/50 font-bold uppercase tracking-tighter">Via {step.landmark}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-3 mt-auto">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(guide.objective)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black bg-luxury-gold px-6 py-4 rounded-2xl transition-all shadow-lg shadow-luxury-gold/20"
                      >
                         Open in Google Maps
                         <ChevronRight size={14} />
                      </a>
                  </div>
                </motion.div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationModule;
