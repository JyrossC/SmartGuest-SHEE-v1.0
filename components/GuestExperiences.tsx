import React, { useState } from 'react';
import { Excursion, TechAmenity, CartItem, StaffMember, UserRole } from '../types';

interface GuestExperiencesProps {
  excursions: Excursion[];
  techRentals: TechAmenity[];
  staff: StaffMember[];
  addToCart: (item: CartItem) => void;
}

const GuestExperiences: React.FC<GuestExperiencesProps> = ({ excursions, techRentals, staff, addToCart }) => {
  const [activeTab, setActiveTab] = useState<'excursions' | 'tech' | 'concierges'>('excursions');

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-12">
        <h2 className="font-serif text-4xl text-white mb-2">Experiences & Services</h2>
        <p className="text-gray-400 max-w-2xl text-lg">Curate your perfect stay with our selected daily tours, exclusive tech, or book a consultation with our concierges.</p>
        
        <div className="flex flex-wrap bg-white/5 p-1 rounded-lg border border-white/5 mt-6 w-fit gap-1">
            <button 
                onClick={() => setActiveTab('excursions')}
                className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'excursions' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Daily Excursions
            </button>
            <button 
                onClick={() => setActiveTab('tech')}
                className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'tech' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Wellness Tech
            </button>
            <button 
                onClick={() => setActiveTab('concierges')}
                className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'concierges' ? 'bg-luxury-gold text-black' : 'text-gray-400 hover:text-white'}`}
            >
                Our Concierges
            </button>
        </div>
      </header>

      {activeTab === 'excursions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {excursions.filter(e => e.availableSlots > 0).map(exc => (
                  <div key={exc.id} className="bg-luxury-charcoal border border-white/5 rounded-2xl p-6 hover:border-luxury-gold/30 transition-all flex flex-col group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      
                      <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-luxury-gold transition-colors">{exc.name}</h3>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-6 flex-1 lead-relaxed">{exc.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs font-mono text-luxury-gold mb-6 bg-black/40 p-3 rounded-lg border border-white/5">
                          <div className="flex items-center gap-2"><span>🕒</span> {exc.time}</div>
                          <div className="w-px h-4 bg-white/20"></div>
                          <div className="flex items-center gap-2"><span>👥</span> {exc.availableSlots} slots left</div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                          <span className="text-2xl font-serif text-white">${exc.price}</span>
                          <button 
                            onClick={(() => addToCart({
                                id: exc.id,
                                name: exc.name,
                                price: exc.price,
                                type: 'Service',
                                details: `Excursion at ${exc.time}`
                            }))}
                            className="bg-white/10 hover:bg-luxury-gold hover:text-black text-white px-6 py-2 rounded font-bold uppercase tracking-widest transition-all text-xs border border-white/10 hover:border-transparent"
                          >
                              Book Now
                          </button>
                      </div>
                  </div>
              ))}
              {excursions.filter(e => e.availableSlots > 0).length === 0 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-12 border border-dashed border-white/10 rounded-2xl text-gray-500">
                      No excursions available at the moment. Please check back later.
                  </div>
              )}
          </div>
      )}

      {activeTab === 'tech' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {techRentals.map(tech => {
                  const isAvailable = tech.status === 'Available';
                  return (
                      <div key={tech.id} className={`bg-luxury-charcoal border border-white/5 rounded-2xl overflow-hidden hover:border-luxury-gold/30 transition-all flex flex-col ${!isAvailable ? 'opacity-60 grayscale' : ''}`}>
                          <div className="h-48 bg-black relative">
                              <img src={tech.imageUrl} alt={tech.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal to-transparent"></div>
                              {!isAvailable && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                      <span className="bg-black/80 text-white px-4 py-2 uppercase tracking-widest font-bold text-xs rounded border border-white/10">
                                          Currently {tech.status}
                                      </span>
                                  </div>
                              )}
                          </div>
                          
                          <div className="p-6 flex flex-col flex-1 relative z-10 -mt-8">
                              <h3 className="text-xl font-bold text-white mb-2">{tech.name}</h3>
                              <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">{tech.description}</p>
                              
                              <div className="flex items-center justify-between mt-auto">
                                  <div>
                                      <span className="text-2xl font-serif text-white">${tech.pricePerDay}</span>
                                      <span className="text-gray-500 text-xs ml-1 uppercase tracking-widest">/ Day</span>
                                  </div>
                                  <button 
                                      disabled={!isAvailable}
                                      onClick={() => addToCart({
                                          id: tech.id,
                                          name: tech.name,
                                          price: tech.pricePerDay,
                                          type: 'Rental',
                                          details: 'Delivered to room'
                                      })}
                                      className="bg-white/10 hover:bg-luxury-gold hover:text-black text-white px-6 py-2 rounded font-bold uppercase tracking-widest transition-all text-xs border border-white/10 hover:border-transparent disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white disabled:hover:border-white/10"
                                  >
                                      {isAvailable ? 'Add to Cart' : 'Unavailable'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}

      {activeTab === 'concierges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.filter(s => s.role === UserRole.CONCIERGE).map(concierge => {
                  const isOnline = concierge.status === 'Online';
                  return (
                      <div key={concierge.id} className="bg-luxury-charcoal border border-white/5 rounded-2xl p-6 hover:border-luxury-gold/30 transition-all flex flex-col relative overflow-hidden group">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-2xl shadow-lg border border-white/10">
                                  🛎️
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold text-white">{concierge.name}</h3>
                                  <p className="text-xs text-gray-400 uppercase tracking-widest">{concierge.department}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                                      <span className="text-xs text-gray-400">{concierge.status}</span>
                                  </div>
                              </div>
                          </div>
                          
                          <p className="text-sm text-gray-400 mb-6 flex-1 pr-4">
                              Available for personalized itinerary planning, local booking assistance, and special requests.
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                              <span className="text-lg font-serif text-white">Consultation</span>
                              <button 
                                  onClick={() => addToCart({
                                      id: `concierge_${concierge.id}_${Date.now()}`,
                                      name: `Concierge Consultation`,
                                      price: 0,
                                      type: 'Service',
                                      details: `Requested with ${concierge.name}`
                                  })}
                                  className="bg-white/10 hover:bg-luxury-gold hover:text-black text-white px-6 py-2 rounded font-bold uppercase tracking-widest transition-all text-xs border border-white/10 hover:border-transparent"
                              >
                                  Request
                              </button>
                          </div>
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default GuestExperiences;
