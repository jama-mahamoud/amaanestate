export type ListingCategory = 'property' | 'rental' | 'land' | 'vehicle';
export type ListingStatus = 'pending' | 'active' | 'sold' | 'rented' | 'archived' | 'suspended' | 'rejected';
export type ListingType = 'sale' | 'rent';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ListingCategory;
  subcategory?: string;
  price: number;
  currency: string;
  city: string;
  location: string;
  listingType: ListingType;
  ownerId: string;
  status: ListingStatus;
  isFeatured?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  legalChecked?: boolean;
  ownershipVerified?: boolean;
  images: string[];
  features?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: any;
  updatedAt?: any;
}

export interface Property extends Listing {
  category: 'property';
  beds?: number;
  baths?: number;
  size?: string;
}

export interface VehicleListing extends Listing {
  category: 'vehicle';
  year: number;
  mileage: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
}

export type ServiceCategory = 
  | 'Construction & Engineering' 
  | 'Electrical & Technical' 
  | 'Plumbing & Water' 
  | 'Home & Maintenance' 
  | 'Education & Teaching';

export type ServiceStatus = 'active' | 'hidden';

export interface ProfessionalService {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  city: string;
  providerId: string;
  providerName?: string;
  providerImage?: string;
  status: ServiceStatus;
  createdAt: any;
}

export interface Professional {
  id: string;
  name: string;
  title: string;
  category: ServiceCategory;
  skills: string[];
  experienceYears: number;
  city: string;
  image: string;
  rating: number;
  reviewCount: number;
  availability: 'Available' | 'Busy' | 'On Leave';
  bio: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  isVerified: boolean;
}

export type UserRole = 'admin' | 'editor' | 'agent' | 'verified_professional' | 'normal_user';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: any; // Using any for Firestore Timestamp compatibility or date string
  photoURL: string | null;
  isVerified: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  language: 'en' | 'so';
  featuredImage?: string;
  gallery?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
  isFeatured?: boolean;
  published: boolean;
  views: number;
  createdAt: any;
  updatedAt?: any;
}
