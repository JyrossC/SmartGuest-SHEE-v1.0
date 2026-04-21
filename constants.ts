
import { MenuItem, Room, UserTier, UserRole, InventoryItem, SpaTreatment, TechAmenity, SubscriptionPackage, StaffMember } from './types';

export const MOCK_USER = {
  name: "Juma Baraka",
  role: UserRole.GUEST,
  tier: UserTier.ROYAL,
  healthGoal: "Muscle Gain & Stress Reduction",
  dietaryRestrictions: ["Gluten Free"],
  mood: "Exhausted"
};

export const INITIAL_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'pkg_silver',
    name: 'Silver',
    price: 99,
    defaultCommissionRate: 15,
    features: { nutrition: false, fitness: true, spa: false, concierge: true },
    description: 'Essential amenities for boutique hotels.'
  },
  {
    id: 'pkg_gold',
    name: 'Gold',
    price: 199,
    defaultCommissionRate: 12,
    features: { nutrition: true, fitness: true, spa: true, concierge: true },
    description: 'Full suite for luxury resorts.',
    recommended: true
  },
  {
    id: 'pkg_plat',
    name: 'Platinum',
    price: 399,
    defaultCommissionRate: 8,
    features: { nutrition: true, fitness: true, spa: true, concierge: true },
    description: 'Enterprise grade with lowest commission fees.'
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv1', name: 'Wagyu Beef Patties', category: 'Food', quantity: 45, threshold: 10, unit: 'pcs' },
  { id: 'inv2', name: 'Organic Quinoa', category: 'Food', quantity: 12, threshold: 5, unit: 'kg' },
  { id: 'inv3', name: 'Massage Oil (Lavender)', category: 'Spa', quantity: 3, threshold: 5, unit: 'bottles' },
  { id: 'inv4', name: 'Clean Towels', category: 'Housekeeping', quantity: 150, threshold: 50, unit: 'pcs' },
  { id: 'inv5', name: 'Yoga Mats', category: 'Gym', quantity: 20, threshold: 20, unit: 'pcs' },
  { id: 'inv6', name: 'Serengeti Coffee Beans', category: 'Food', quantity: 8, threshold: 10, unit: 'kg' }
];

export const MOCK_STAFF: StaffMember[] = [
    { id: 'st1', name: 'Gordon Ramsay', role: UserRole.CHEF, email: 'chef@shee.com', phone: '+255 700 111 222', status: 'Online', department: 'Kitchen', shift: 'Evening' },
    { id: 'st2', name: 'Mike Tyson', role: UserRole.TRAINER, email: 'gym@shee.com', phone: '+255 700 333 444', status: 'Online', department: 'Wellness', shift: 'Morning' },
    { id: 'st3', name: 'Alice Walker', role: UserRole.SPA_MANAGER, email: 'spa@shee.com', phone: '+255 700 555 666', status: 'Away', department: 'Spa', shift: 'Morning' },
    { id: 'st4', name: 'John Wick', role: UserRole.CONCIERGE, email: 'frontdesk@shee.com', phone: '+255 700 777 888', status: 'Offline', department: 'Front Office', shift: 'Night' }
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'f1',
    name: 'Grilled Serengeti Tilapia',
    description: 'Fresh catch served with steamed spinach and quinoa.',
    price: 25,
    calories: 350,
    category: 'Main',
    tags: ['High Protein', 'Gluten Free', 'Healthy'],
    imageUrl: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: 'f2',
    name: 'Zanzibar Spiced Beef Curry',
    description: 'Slow-cooked beef in aromatic coconut sauce.',
    price: 30,
    calories: 600,
    category: 'Main',
    tags: ['High Protein', 'Spicy'],
    imageUrl: 'https://picsum.photos/300/200?random=2'
  },
  {
    id: 'f3',
    name: 'Avocado & Mango Salad',
    description: 'Organic greens topped with seasonal fruits and lime dressing.',
    price: 15,
    calories: 200,
    category: 'Starter',
    tags: ['Vegan', 'Low Calorie', 'Gluten Free'],
    imageUrl: 'https://picsum.photos/300/200?random=3'
  },
  {
    id: 'f4',
    name: 'Wagyu Beef Burger',
    description: 'Premium beef patty with truffle mayo and fries.',
    price: 45,
    calories: 900,
    category: 'Main',
    tags: ['Indulgent'],
    imageUrl: 'https://picsum.photos/300/200?random=4'
  },
  {
    id: 'd1',
    name: 'Kilimanjaro Mist',
    description: 'Sparkling water with cucumber and mint infusion.',
    price: 8,
    calories: 5,
    category: 'Drink',
    tags: ['Hydrating', 'Non-Alcoholic'],
    imageUrl: 'https://picsum.photos/300/200?random=5'
  },
  {
    id: 'd2',
    name: 'Savanna Sunset Pinotage',
    description: 'Full-bodied red wine with berry notes.',
    price: 18,
    calories: 125,
    category: 'Drink',
    tags: ['Alcoholic'],
    imageUrl: 'https://picsum.photos/300/200?random=6'
  }
];

export const SPA_TREATMENTS: SpaTreatment[] = [
    {
        id: 's1',
        name: 'Zanzibar Spice Ritual',
        description: 'A full-body exfoliation using cloves and cinnamon followed by a deep tissue massage.',
        durationMin: 90,
        price: 150,
        tags: ['Exfoliation', 'Deep Tissue', 'Energizing']
    },
    {
        id: 's2',
        name: 'Serengeti Sleep Therapy',
        description: 'Gentle aromatherapy massage using lavender and chamomile to induce deep sleep.',
        durationMin: 60,
        price: 120,
        tags: ['Relaxation', 'Sleep', 'Gentle']
    },
    {
        id: 's3',
        name: 'After-Safari Leg Recovery',
        description: 'Focused treatment on legs and feet to reduce swelling and fatigue after game drives.',
        durationMin: 45,
        price: 90,
        tags: ['Recovery', 'Focused', 'Soreness']
    },
    {
        id: 's4',
        name: 'Hydrating Aloe Wrap',
        description: 'Cooling aloe vera wrap perfect for sun-exposed skin.',
        durationMin: 60,
        price: 110,
        tags: ['Skin Care', 'Cooling', 'Sunburn']
    }
];

export const TECH_AMENITIES: TechAmenity[] = [
    {
        id: 't1',
        name: 'Oculus Meditation VR',
        description: 'Immersive guided meditation in virtual landscapes.',
        pricePerDay: 40,
        imageUrl: 'https://picsum.photos/300/200?random=20'
    },
    {
        id: 't2',
        name: 'Neuro-Sonic Sleep Pod',
        description: 'Portable cranial stimulation device to cure jetlag.',
        pricePerDay: 60,
        imageUrl: 'https://picsum.photos/300/200?random=21'
    },
    {
        id: 't3',
        name: 'Hypervolt Massage Gun',
        description: 'Professional grade percussion therapy device.',
        pricePerDay: 25,
        imageUrl: 'https://picsum.photos/300/200?random=22'
    }
];

export const ROOMS: Room[] = [
  {
    id: 'r1',
    name: 'Ocean View Suite',
    type: 'Suite',
    price: 450,
    description: 'Panoramic views of the Indian Ocean with private jacuzzi.',
    amenities: ['Jacuzzi', 'King Bed', 'Butler Service'],
    imageUrl: 'https://picsum.photos/600/400?random=10',
    imageUrls: [
        'https://picsum.photos/600/400?random=10',
        'https://picsum.photos/600/400?random=101',
        'https://picsum.photos/600/400?random=102'
    ]
  },
  {
    id: 'r2',
    name: 'Serenity Garden Villa',
    type: 'Villa',
    price: 850,
    description: 'A private sanctuary surrounded by tropical gardens. Includes private pool.',
    amenities: ['Private Pool', '2 Bedrooms', 'In-Room Spa Area'],
    imageUrl: 'https://picsum.photos/600/400?random=11',
    imageUrls: [
        'https://picsum.photos/600/400?random=11',
        'https://picsum.photos/600/400?random=111',
        'https://picsum.photos/600/400?random=112'
    ]
  },
  {
    id: 'r3',
    name: 'Royal Penthouse',
    type: 'Villa',
    price: 2500,
    description: 'The ultimate luxury experience on the top floor.',
    amenities: ['Private Gym', 'Chef on Call', 'Helipad Access'],
    imageUrl: 'https://picsum.photos/600/400?random=12',
    imageUrls: [
        'https://picsum.photos/600/400?random=12',
        'https://picsum.photos/600/400?random=121',
        'https://picsum.photos/600/400?random=122'
    ]
  }
];

export const AMENITY_DESCRIPTIONS: Record<string, string> = {
    'Jacuzzi': 'A private, heated whirlpool bath with hydrotherapy jets.',
    'King Bed': 'Extra-large luxury mattress with premium Egyptian cotton linens.',
    'Butler Service': '24/7 dedicated personal assistant for all your needs.',
    'Private Pool': 'Exclusive temperature-controlled swimming pool within your villa walls.',
    '2 Bedrooms': 'Spacious layout with two separate sleeping areas, ideal for families.',
    'In-Room Spa Area': 'Dedicated zone with massage table and aromatherapy diffusion.',
    'Private Gym': 'Fully equipped fitness station with treadmill, weights, and yoga space.',
    'Chef on Call': 'Personal culinary expert available to cook private meals in your suite.',
    'Helipad Access': 'Direct and private arrival/departure via helicopter.'
};

export const FITNESS_EQUIPMENT = [
    { id: 'eq1', name: 'Yoga Mat', icon: '🧘' },
    { id: 'eq2', name: 'Dumbbells Set (2kg - 10kg)', icon: '🏋️' },
    { id: 'eq3', name: 'Resistance Bands', icon: '🎗️' },
    { id: 'eq4', name: 'Kettlebell (8kg)', icon: '🔔' },
    { id: 'eq5', name: 'Foam Roller', icon: '🪵' },
    { id: 'eq6', name: 'Medicine Ball', icon: '⚽' }
];

export const SYSTEM_INSTRUCTION_NUTRITION = `You are an expert AI Nutritionist for a luxury hotel called SmartGuest.
Your goal is to analyze the hotel's menu and the guest's health profile to recommend the perfect meal.
You must respect dietary restrictions strictly.
Explain WHY you chose the specific items based on their goal (e.g., muscle gain, weight loss).
Format your response as a concise, elegant recommendation letter to a VIP guest.`;

export const SYSTEM_INSTRUCTION_FITNESS = `You are an elite Personal Trainer for VIP hotel guests.
Create a workout plan based on the guest's goal and location (In-Room vs Hotel Gym).
If In-Room, focus on bodyweight or minimal equipment.
If Gym, utilize machines.
Keep it engaging and suitable for a luxury wellness retreat.`;

export const SYSTEM_INSTRUCTION_CONCIERGE = `You are a high-end Hotel Concierge for SmartGuest Resorts.
You know the local area perfectly. Use Google Search to find real, current events or weather if asked.
Your tone is professional, warm, and subservient but authoritative on quality.
Always suggest "Premium" or "Private" options when available.`;

export const SYSTEM_INSTRUCTION_SPA = `You are a Holistic Wellness Therapist at a luxury resort.
Analyze the guest's symptoms (e.g., Jetlag, Stress, Muscle Soreness) and match them to one of our SPA TREATMENTS.
Explain the physiological benefits of the chosen treatment.
Tone: Calming, reassuring, and expert.`;
