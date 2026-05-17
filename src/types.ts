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
