/**
 * AmaanEstate - Core Domain TypeScript Models
 * Undergoing upgrading and transformation for a professional real estate platform.
 */

// Property Core Sub-Types
export type PropertyType = 
  | 'house' 
  | 'apartment' 
  | 'villa' 
  | 'land' 
  | 'shop' 
  | 'office' 
  | 'warehouse' 
  | 'commercial' 
  | 'other';

export type ListingType = 'sale' | 'rent';

export type PropertyStatus = 
  | 'available' 
  | 'pending' 
  | 'sold' 
  | 'rented' 
  | 'draft' 
  | 'archived';

// Location Geo-Hierarchy model
export interface LocationInfo {
  region: string;
  city: string;
  district?: string;
  neighborhood?: string;
}

// Property Model definition
export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  currency: 'ETB' | 'USD';
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // Sq meters
  location: LocationInfo;
  address?: string;
  images: string[];
  features?: string[];
  amenities?: string[];
  agentId: string;
  status: PropertyStatus;
  featured?: boolean;
  availability?: string;
  createdAt: string; // ISO String (UTC)
  updatedAt?: string; // ISO String (UTC)
}

// Agent Model definition
export interface Agent {
  id: string;
  name: string;
  profileImage?: string;
  phone?: string;
  email: string;
  bio?: string;
  location?: string;
  specialization?: string[];
  active: boolean;
  createdAt: string; // ISO String
  updatedAt?: string; // ISO String
}

// Viewing Appointment Model
export type ViewingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Viewing {
  id: string;
  propertyId: string;
  userId: string;
  agentId: string;
  requestedDate: string; // YYYY-MM-DD
  requestedTime: string; // HH:MM
  status: ViewingStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Favorite Saved Property Model
export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

// Lead / Inquiry Model
export type LeadSource = 'website' | 'property_inquiry' | 'ai' | 'viewing' | 'contact';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';

export interface Lead {
  id: string;
  userId?: string;
  propertyId?: string;
  agentId?: string;
  source: LeadSource;
  message?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// User Profile Model
export type UserRole = 'user' | 'agent' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

// In-App Notification Model
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

// Chat System Messages
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: any[]; // For future Gemini tools / function calls
}

// AI Chat Conversation Model
export interface AIConversation {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt?: string;
}

// --- Backward Compatibility Types & Aliases ---
export type PropertyListing = Property;
export type UserAccount = User;
export type ListingIntent = 'for_sale' | 'for_rent';
export type VerificationStatus = 'pending' | 'verified' | 'unverified';
