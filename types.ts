
export enum UserTier {
  NORMAL = 'Normal',
  VIP = 'VIP',
  VVIP = 'VVIP',
  ROYAL = 'Royal'
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  HOTEL_ADMIN = 'Hotel Admin',
  CHEF = 'Executive Chef',
  NUTRITIONIST = 'Nutritionist',
  TRAINER = 'Fitness Trainer',
  SPA_MANAGER = 'Spa Manager',
  CONCIERGE = 'Concierge Manager',
  GUEST = 'Guest'
}

export enum ServiceType {
  ROOM = 'Room',
  FOOD = 'Food',
  SPA = 'Spa',
  GYM = 'Gym',
  RENTAL = 'Rental'
}

export enum LocationTier {
  STANDARD = 'Public Facility',
  IN_ROOM = 'In-Room Service',
  PRIVATE = 'Private Facility'
}

export interface AppFeatures {
  nutrition: boolean;
  fitness: boolean;
  spa: boolean;
  concierge: boolean;
}

export interface SubscriptionPackage {
  id: string;
  name: string; // e.g. "Gold", "Platinum"
  price: number; // Monthly SaaS Fee
  defaultCommissionRate: number;
  features: AppFeatures;
  description: string;
  recommended?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  plan: string; // References SubscriptionPackage.name
  status: 'Active' | 'Suspended' | 'Pending';
  commissionRate: number; // e.g. 10 for 10%
  totalRevenue: number;
  features: AppFeatures;
  location: string;
  joinedDate: string;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  tier: UserTier; // Only relevant if role is GUEST
  healthGoal: string;
  dietaryRestrictions: string[];
  mood: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole; // Using UserRole enum but excluding GUEST/ADMINs typically
  email: string;
  phone: string;
  status: 'Online' | 'Away' | 'Offline';
  department: string;
  shift: 'Morning' | 'Evening' | 'Night';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  category: 'Main' | 'Starter' | 'Dessert' | 'Drink';
  tags: string[]; 
  imageUrl: string;
}

export interface SpaTreatment {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
  tags: string[]; // e.g., "Relaxation", "Deep Tissue"
}

export interface TechAmenity {
  id: string;
  name: string;
  description: string;
  pricePerDay: number;
  imageUrl: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Suite' | 'Villa';
  price: number;
  description: string;
  amenities: string[];
  imageUrl: string; // Kept for backward compatibility
  imageUrls?: string[]; // New: For Carousel
}

export interface ItineraryItem {
  id: string;
  title: string;
  time: string; // e.g. "14:00" or "Morning"
  location: string;
  description: string;
  mapQuery: string; // Used to generate Google Maps link
  isBooked: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  videoUri?: string; 
  suggestedActivities?: ItineraryItem[]; // Structured suggestions from AI
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'Room' | 'Food' | 'Service' | 'Rental';
  details?: string;
  status?: 'Pending' | 'Completed';
  assignedTo?: UserRole; 
  deliveryMode?: 'Standard' | 'Contactless (DND)'; // FR-09
  locationTier?: LocationTier; // FR-08
  // New fields for Spa Context
  symptoms?: string[];
  aiReasoning?: string;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Food' | 'Spa' | 'Gym' | 'Housekeeping';
  quantity: number;
  threshold: number; // Low stock alert level
  unit: string;
}

export interface SymptomLogEntry {
  id: string;
  date: string;
  symptoms: string[];
  recommendedTreatmentName: string;
  reasoning: string;
}
