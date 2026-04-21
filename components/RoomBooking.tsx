
import React, { useState, useMemo, useEffect } from 'react';
import { ROOMS, MOCK_USER, AMENITY_DESCRIPTIONS } from '../constants';
import { CartItem, Room, UserTier } from '../types';

interface RoomBookingProps {
  addToCart: (item: CartItem) => void;
}

// Internal Component for Image Carousel
const RoomImageCarousel = ({ images, name, heightClass = "h-64" }: { images: string[], name: string, heightClass?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={`${heightClass} overflow-hidden relative group bg-black`}>
            <img 
                src={images[currentIndex]} 
                alt={`${name} view ${currentIndex + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700" 
            />
            {images.length > 1 && (
                <>
                    <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        ←
                    </button>
                    <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        →
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {images.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-luxury-gold' : 'bg-white/50'}`} 
                            />
                        ))}
                    </div>
                </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
        </div>
    );
};

const RoomBooking: React.FC<RoomBookingProps> = ({ addToCart }) => {
  // Default to today and 3 days from now
  const today = new Date().toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(threeDaysLater);
  const [dateError, setDateError] = useState('');
  
  // States for navigation
  const [confirmingRoom, setConfirmingRoom] = useState<Room | null>(null); // For Modal
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null); // For Detail Page
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const savedPrefs = localStorage.getItem('shee_room_prefs');
    if (savedPrefs) {
        try {
            const parsed = JSON.parse(savedPrefs);
            if (parsed.amenities) setSelectedAmenities(parsed.amenities);
        } catch (e) {
            console.error("Failed to load preferences", e);
        }
    }
  }, []);

  // Derived Data
  const allAmenities = useMemo(() => {
    const amenities = new Set<string>();
    ROOMS.forEach(room => room.amenities.forEach(a => amenities.add(a)));
    return Array.from(amenities).sort();
  }, []);

  const filteredRooms = useMemo(() => {
    return ROOMS.filter(room => {
        // Filter by Search Query (Name or Type)
        const matchesSearch = 
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            room.type.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by Amenities
        const matchesAmenities = selectedAmenities.length === 0 || 
            selectedAmenities.every(selected => room.amenities.includes(selected));

        return matchesSearch && matchesAmenities;
    });
  }, [selectedAmenities, searchQuery]);

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const isRoyal = MOCK_USER.tier === UserTier.ROYAL;

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    setDateError('');

    // Ensure check-out is always after check-in
    if (newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOut = e.target.value;
    
    // Validate that checkout is strictly after checkin
    if (newCheckOut > checkIn) {
        setCheckOut(newCheckOut);
        setDateError('');
    } else {
        setDateError('Check-out date must be after check-in date.');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
    setPreferencesSaved(false); // Reset saved state on change
  };

  const savePreferences = () => {
      localStorage.setItem('shee_room_prefs', JSON.stringify({ amenities: selectedAmenities }));
      setPreferencesSaved(true);
      setTimeout(() => setPreferencesSaved(false), 3000);
  };

  const initiateBooking = (room: Room, e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setConfirmingRoom(room);
  };

  const handleConfirmBooking = () => {
    if (!confirmingRoom) return;
    
    const totalPrice = confirmingRoom.price * nights;
    
    addToCart({
      id: `${confirmingRoom.id}-${Date.now()}`,
      name: confirmingRoom.name,
      price: totalPrice,
      type: 'Room',
      details: `${nights} Nights (${checkIn} to ${checkOut})`
    });
    
    setConfirmingRoom(null);
    setViewingRoom(null); // Close detail view if open
  };

  // --- DETAIL VIEW RENDER ---
  if (viewingRoom) {
      const images = viewingRoom.imageUrls && viewingRoom.imageUrls.length > 0 ? viewingRoom.imageUrls : [viewingRoom.imageUrl];
      const totalCost = viewingRoom.price * nights;

      return (
          <div className="space-y-6 animate-fade-in">
              <button 
                onClick={() => setViewingRoom(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-luxury-gold transition-colors mb-4"
              >
                  <span>←</span> Back to Suites
              </button>

              <div className="bg-luxury-charcoal rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Hero Image / Gallery */}
                  <RoomImageCarousel images={images} name={viewingRoom.name} heightClass="h-[400px] md:h-[500px]" />

                  <div className="p-8">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-white/5 pb-8">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-luxury-gold text-black px-3 py-1 text-xs font-bold uppercase tracking-widest rounded">{viewingRoom.type}</span>
                                  {isRoyal && <span className="text-luxury-gold text-xs border border-luxury-gold px-2 py-0.5 rounded">Royal Rates Applied</span>}
                              </div>
                              <h2 className="font-serif text-4xl text-white mb-4">{viewingRoom.name}</h2>
                              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">{viewingRoom.description}</p>
                          </div>
                          <div className="text-right bg-black/20 p-6 rounded-xl border border-white/5 min-w-[250px]">
                              <p className="text-xs uppercase text-gray-500 tracking-widest mb-1">Price per Night</p>
                              <p className="text-3xl font-serif text-luxury-gold mb-4">${viewingRoom.price.toLocaleString()}</p>
                              
                              <div className="space-y-2 text-sm text-gray-400 mb-6">
                                  <div className="flex justify-between"><span>Check In:</span><span className="text-white">{checkIn}</span></div>
                                  <div className="flex justify-between"><span>Check Out:</span><span className="text-white">{checkOut}</span></div>
                                  <div className="flex justify-between pt-2 border-t border-white/10"><span>Total ({nights} nights):</span><span className="text-white font-bold">${totalCost.toLocaleString()}</span></div>
                              </div>

                              <button 
                                onClick={() => initiateBooking(viewingRoom)}
                                className="w-full bg-luxury-gold text-black py-3 rounded font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg"
                              >
                                  Book Now
                              </button>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div>
                              <h3 className="font-serif text-2xl text-white mb-6">Room Amenities</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {viewingRoom.amenities.map(amenity => (
                                      <div key={amenity} className="flex items-start gap-3 p-3 rounded bg-white/5 border border-white/5 hover:border-luxury-gold/30 transition-colors">
                                          <span className="text-luxury-gold text-xl">✨</span>
                                          <div>
                                              <p className="text-white font-bold text-sm">{amenity}</p>
                                              <p className="text-xs text-gray-500 mt-1">{AMENITY_DESCRIPTIONS[amenity] || 'Premium facility included.'}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          
                          <div>
                              <h3 className="font-serif text-2xl text-white mb-6">Why this Suite?</h3>
                              <ul className="space-y-4 text-gray-400">
                                  <li className="flex gap-3">
                                      <span className="text-green-500">✓</span>
                                      <span>Located in the quietest wing of the resort for maximum privacy.</span>
                                  </li>
                                  <li className="flex gap-3">
                                      <span className="text-green-500">✓</span>
                                      <span>Direct access to the {viewingRoom.type === 'Villa' ? 'private beach area' : 'executive lounge'}.</span>
                                  </li>
                                  <li className="flex gap-3">
                                      <span className="text-green-500">✓</span>
                                      <span>Dedicated concierge available 24/7 via the in-room tablet.</span>
                                  </li>
                                  <li className="flex gap-3">
                                      <span className="text-green-500">✓</span>
                                      <span>Premium organic toiletries and aromatherapy menu included.</span>
                                  </li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- LIST VIEW RENDER ---
  return (
    <div className="space-y-8 relative">
      <header className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="font-serif text-3xl text-luxury-gold mb-2">Accommodations</h2>
           <p className="text-gray-400">Select your sanctuary. SmartGuest ensures <span className="text-white">Complete Privacy</span>.</p>
        </div>
        
        {/* Date Selection Control */}
        <div className="bg-luxury-charcoal p-4 rounded-xl border border-luxury-gold/20 flex flex-col shadow-lg">
            <div className="flex gap-4 items-center">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Check In</label>
                    <input 
                        type="date" 
                        value={checkIn}
                        min={today}
                        onChange={handleCheckInChange}
                        className="bg-black/30 border border-white/10 rounded px-3 py-1 text-white text-sm focus:border-luxury-gold outline-none"
                    />
                </div>
                <div className="text-luxury-gold">→</div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Check Out</label>
                    <input 
                        type="date" 
                        value={checkOut}
                        min={(() => {
                            const d = new Date(checkIn);
                            d.setDate(d.getDate() + 1);
                            return d.toISOString().split('T')[0];
                        })()}
                        onChange={handleCheckOutChange}
                        className={`bg-black/30 border rounded px-3 py-1 text-white text-sm focus:outline-none ${dateError ? 'border-red-500' : 'border-white/10 focus:border-luxury-gold'}`}
                    />
                </div>
                <div className="pl-4 border-l border-white/10 ml-2">
                    <span className="block text-xl font-bold text-white text-center">{nights}</span>
                    <span className="text-[10px] uppercase text-gray-500">Nights</span>
                </div>
            </div>
            {dateError && (
                <div className="text-red-500 text-[10px] mt-2 text-center bg-red-500/10 py-1 rounded">
                    ⚠ {dateError}
                </div>
            )}
        </div>
      </header>

      {/* Filter & Search Bar */}
      <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search rooms (e.g., 'Ocean', 'Villa')..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-luxury-gold focus:outline-none"
                />
            </div>

            {/* Save Preferences Button */}
            <button 
                onClick={savePreferences}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${
                    preferencesSaved 
                    ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                    : 'bg-white/5 text-luxury-gold border-luxury-gold/30 hover:bg-luxury-gold/10'
                }`}
            >
                {preferencesSaved ? (
                    <><span>✓</span> Saved to Profile</>
                ) : (
                    <><span>❤</span> Save Filters</>
                )}
            </button>
        </div>

        <div>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-luxury-gold text-sm">💎</span>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter by Amenities</h3>
                {selectedAmenities.length > 0 && (
                    <button 
                    onClick={() => setSelectedAmenities([])} 
                    className="ml-auto text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 transition-colors"
                    >
                    Clear All Filters
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {allAmenities.map(amenity => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                        <button
                            key={amenity}
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-3 py-1.5 rounded text-xs border transition-all duration-300 ${
                                isSelected 
                                ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-luxury-gold/30 hover:text-white'
                            }`}
                        >
                            {amenity}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-luxury-charcoal rounded-2xl border border-white/5 border-dashed">
              <div className="text-4xl mb-4">🕵️‍♀️</div>
              <h3 className="text-xl text-white mb-2">No Suites Found</h3>
              <p className="text-gray-500">Try adjusting your search or amenity filters.</p>
              <button onClick={() => {setSelectedAmenities([]); setSearchQuery('');}} className="mt-4 text-luxury-gold underline">View All Rooms</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredRooms.map((room) => {
            const totalCost = room.price * nights;
            return (
                <div 
                    key={room.id} 
                    onClick={() => setViewingRoom(room)}
                    className="bg-luxury-charcoal rounded-2xl overflow-hidden border border-gray-800 hover:border-luxury-gold/50 transition-all group flex flex-col shadow-lg animate-fade-in cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                    
                    {/* Carousel */}
                    <RoomImageCarousel 
                        images={room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls : [room.imageUrl]} 
                        name={room.name} 
                    />

                    <div className="absolute top-4 left-4 z-10 bg-luxury-gold text-black font-bold px-3 py-1 text-xs uppercase tracking-widest rounded-sm">
                        {room.type}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-serif text-2xl text-white group-hover:text-luxury-gold transition-colors">{room.name}</h3>
                            <div className="text-right">
                            <span className="block text-2xl font-bold text-luxury-gold">${room.price}</span>
                            <span className="text-xs text-gray-500">per night</span>
                            </div>
                        </div>
                        <p className="text-gray-400 mb-6 flex-1 line-clamp-3">{room.description}</p>
                        
                        <div className="mb-6">
                            <h4 className="text-xs uppercase text-gray-500 tracking-widest mb-3">Amenities</h4>
                            <div className="flex flex-wrap gap-2">
                            {room.amenities.slice(0, 3).map(a => {
                                const isMatch = selectedAmenities.includes(a);
                                return (
                                    <div key={a} className="relative group/tooltip">
                                        <span className={`px-3 py-1 rounded-full text-xs border ${
                                            isMatch 
                                            ? 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/50' 
                                            : 'bg-black/40 text-gray-300 border-white/5'
                                        }`}>
                                            {a}
                                        </span>
                                    </div>
                                );
                            })}
                            {room.amenities.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">+{room.amenities.length - 3} more</span>
                            )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div className="text-sm text-gray-400">
                                Total for {nights} nights: <span className="text-white font-bold">${totalCost.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={(e) => initiateBooking(room, e)}
                                className="px-8 py-3 bg-white/5 hover:bg-luxury-gold hover:text-black border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold font-bold uppercase tracking-wider rounded transition-all duration-300"
                            >
                                Book Stay
                            </button>
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
      )}

      {/* Confirmation Modal (Keep this for the booking action) */}
      {confirmingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-luxury-charcoal max-w-lg w-full rounded-2xl border border-luxury-gold shadow-2xl overflow-hidden flex flex-col">
            <div className="h-40 overflow-hidden relative">
               <img src={confirmingRoom.imageUrl} alt={confirmingRoom.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal to-transparent"></div>
               <h3 className="absolute bottom-4 left-6 font-serif text-3xl text-white">{confirmingRoom.name}</h3>
            </div>
            
            <div className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase text-gray-500 tracking-widest">Dates</p>
                    <p className="text-white font-bold">{checkIn} — {checkOut}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-gray-500 tracking-widest">Duration</p>
                    <p className="text-white font-bold">{nights} Nights</p>
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                     <span>Rate per night</span>
                     <span>${confirmingRoom.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                     <span>Base Price ({nights} nights)</span>
                     <span>${(confirmingRoom.price * nights).toLocaleString()}</span>
                  </div>
                  
                  {isRoyal && (
                    <div className="flex justify-between text-luxury-gold">
                       <span>Royal Tier Discount (10%)</span>
                       <span>-${(confirmingRoom.price * nights * 0.10).toFixed(2)}</span>
                    </div>
                  )}
               </div>

               <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/10 mt-2">
                  <span className="text-gray-400 uppercase text-xs tracking-widest">Estimated Total</span>
                  <span className="text-2xl font-serif text-luxury-gold">
                    ${((confirmingRoom.price * nights) * (isRoyal ? 0.9 : 1.0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
               </div>
               
               <p className="text-[10px] text-gray-500 text-center">
                 *Final billing including service fees will be calculated at checkout.
               </p>

               <div className="flex gap-4 mt-6">
                  <button 
                    onClick={() => setConfirmingRoom(null)}
                    className="flex-1 py-3 rounded border border-gray-600 text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmBooking}
                    className="flex-1 py-3 rounded bg-luxury-gold text-black font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  >
                    Confirm Reservation
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBooking;
