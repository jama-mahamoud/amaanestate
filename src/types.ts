export interface Property {
  id: string;
  title: string;
  price: number | string;
  location: string;
  city: string;
  beds?: number;
  baths?: number;
  size?: string;
  image: string;
  type: 'sale' | 'rent';
  category: 'Villa' | 'Apartment' | 'Commercial' | 'Land' | 'House';
  status: 'published' | 'draft' | 'sold';
  description?: string;
  features?: string[];
}

export interface Vehicle {
  id: string;
  title: string;
  price: number | string;
  city: string;
  year: number;
  mileage: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  image: string;
  type: 'sale' | 'rent';
  category: 'SUV' | 'Sedan' | 'Truck' | 'Lux' | 'Bus';
  transmission: 'Automatic' | 'Manual';
  description?: string;
}

export type ServiceCategory = 
  | 'Construction & Engineering' 
  | 'Electrical & Technical' 
  | 'Plumbing & Water' 
  | 'Home & Maintenance' 
  | 'Education & Teaching';

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
