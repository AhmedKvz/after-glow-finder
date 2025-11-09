export interface User {
  id: string;
  name: string;
  avatar?: string;
  handle: string;
  city: string;
  interests: string[];
  rating?: number;
  joinedEvents?: number;
  hostedEvents?: number;
}

export interface Host {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  verifiedHost?: boolean;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  host: Host;
  djName?: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    coordinates?: [number, number];
  };
  capacity: number;
  attendees: number;
  price: number;
  originalPrice?: number;
  genres: string[];
  tags: string[];
  images: string[];
  isPrivate: boolean;
  isPromoted: boolean;
  distance: number;
  rating?: number;
  reviewCount?: number;
  bringOwnDrinks: boolean;
  allowPlusOnes: boolean;
  maxPlusOnes?: number;
  eventType?: 'club' | 'private_host';
  isLocationHidden?: boolean;
  ticketingEnabled?: boolean;
  joinRequestRequired?: boolean;
}

export interface Helper {
  id: string;
  name: string;
  avatar?: string;
  category: 'wellness' | 'transport' | 'logistics' | 'rentals' | 'concierge';
  service: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  availability: 'available' | 'busy' | 'offline';
  estimatedTime?: string;
  // Category-specific fields
  certifications?: string[];
  medicalStaff?: string[];
  serviceLocation?: 'home_visit' | 'studio' | 'clinic' | 'venue';
  duration?: string;
  equipmentList?: string[];
  vehicleType?: string;
  vehicleCapacity?: number;
  insuranceCovered?: boolean;
  languages?: string[];
  coverageArea?: string;
  comboOffers?: { name: string; price: string; description: string }[];
  inventoryItems?: { name: string; pricePerDay: string; quantity: number }[];
  minimumRental?: string;
  deliveryFee?: string;
  conciergeServices?: string[];
  vipAccess?: boolean;
  personalShopper?: boolean;
}

export interface Notification {
  id: string;
  type: 'invite' | 'payment' | 'reminder' | 'update' | 'request' | 'approval';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  data?: any;
}

export interface EventRequest {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'pending' | 'approved' | 'declined';
  plusOnes: number;
  requestedAt: string;
  message?: string;
}

export interface EventAccess {
  id: string;
  event_id: string;
  user_id: string;
  status: 'requested' | 'approved' | 'rejected' | 'blocked';
  message?: string;
  created_at: string;
  updated_at: string;
}