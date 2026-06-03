export type ListingCategory = 'property' | 'rental' | 'land' | 'vehicle';
export type ListingStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'DELETED' | 'ARCHIVED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
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
  createdBy?: string;
  createdByRole?: string;
  status: ListingStatus;
  visibility?: 'public' | 'private';
  isFeatured?: boolean;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  legalChecked?: boolean;
  ownershipVerified?: boolean;
  legalListingId?: string;
  legalOwnershipCertificateUrl?: string;
  legalTitleDeedUrl?: string;
  sellerNationalIdUrl?: string;
  associatedBrokerId?: string;
  extAgentName?: string;
  extAgencyName?: string;
  extPhone?: string;
  extWhatsapp?: string;
  extLocation?: string;
  extProfileImageUrl?: string;
  legalReferenceNumber?: string;
  governmentRegistryNumber?: string;
  images: string[];
  features?: Record<string, any>;
  metadata?: Record<string, any>;
  latitude?: number;
  longitude?: number;
  district?: string;
  landmark?: string;
  region?: string;
  country?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  nearbyPlacesString?: string;
  createdAt: any;
  updatedAt?: any;
  trustScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  moderationComment?: string;
}

export interface Property extends Listing {
  category: 'property';
  beds?: number;
  baths?: number;
  size?: string;
  complianceYear?: string;
  verification?: {
    titleType?: string;
    legalStatus?: string;
    taxStatus?: string;
    verificationNotes?: string;
  };
  nearbyPlaces?: Array<{ name: string; distance: string; description: string }>;
  features?: {
    furnished?: boolean;
    parking?: boolean;
    parkingSpaces?: number;
    waterAccess?: boolean;
    electricityNearby?: boolean;
    securitySystem?: boolean;
    cornerPlot?: boolean;
    roadAccess?: boolean;
    fenced?: boolean;
    floorsCount?: number;
    powerCapacity?: string;
    plotType?: string;
    terrain?: string;
    zoningType?: string;
    landUse?: string;
    phone?: string;
    wifi?: boolean;
    balcony?: boolean;
    garden?: boolean;
    airConditioning?: boolean;
    water?: boolean;
    electricity?: boolean;
    security?: boolean;
    garage?: boolean;
    size?: string;
    complianceYear?: string;
    beds?: number;
    baths?: number;
  };
  financing?: {
    minDownPayment?: number;
    suggestedInterestRate?: number;
    mortgageDurationDefault?: number;
  };
  conciergeExtras?: {
    agentResponseTime?: string;
    whatsAppContact?: string;
    viewingNotes?: string;
  };
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

export type UserRole = 'admin' | 'editor' | 'agent' | 'broker' | 'agency' | 'verified_professional' | 'normal_user';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: any; // Using any for Firestore Timestamp compatibility or date string
  photoURL: string | null;
  isVerified: boolean;
  phone?: string;
  city?: string;
  bio?: string;
}

export type ArticleStatus = 'draft' | 'pending' | 'approved' | 'published';

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
  
  // Layout Controls
  layoutType?: 'single' | 'two-column' | 'featured' | 'magazine';
  sidebarPlacement?: 'left' | 'right' | 'none';
  
  // Design Controls
  backgroundColor?: string;
  cardStyle?: 'default' | 'glass' | 'plain' | 'premium';
  borderRadius?: number;
  shadowIntensity?: 'none' | 'soft' | 'heavy';
  padding?: number;
  
  // SEO & Performance
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  seoScore?: number;
  socialImage?: string;
  
  // Advanced Settings
  authorId: string;
  showAuthor?: boolean;
  readingTime?: number;
  publishSchedule?: any;
  isFeatured?: boolean;
  status: ArticleStatus;
  published: boolean; // Deprecated, will be removed in future
  views: number;
  priority?: number;
  homepageSection?: string;
  
  createdAt: any;
  updatedAt?: any;
}

export interface Broker {
  id: string;
  userId: string;
  type?: 'individual' | 'agency';
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  region: string;
  city: string;
  officeAddress: string;
  companyName?: string;
  businessLicenseNumber?: string;
  licenseNumber?: string;
  numberOfAgents?: number;
  companyDescription?: string;
  website?: string;
  socialMedia?: string;
  yearEstablished?: string;
  activeListingsCount?: number;
  bio?: string;

  governmentIdUrl: string;
  businessLicenseUrl: string;
  brokerCertificateUrl?: string; // Optional for agency
  profilePhotoUrl?: string; // Optional for agency
  taxRegistrationUrl?: string;
  officeProofUrl?: string;

  yearsOfExperience: number;
  areasOfOperation: string[];
  propertySpecialization: string[];
  languagesSpoken: string[];

  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isVerified: boolean;
  visibility?: boolean;
  createdAt: any;
  updatedAt?: any;
}

export interface Agency {
  id: string;
  agencyId: string;
  agencyName: string;
  ownerId: string;
  email: string;
  phone: string;
  license: string;
  logo: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verified: boolean;
  isVerified?: boolean; // duplicate for cross-compatibility
  visibility: boolean;
  city?: string;
  region?: string;
  createdAt: any;
  updatedAt?: any;
  trustScore?: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
  location: string;
  size?: string;
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CandidateProfile {
  id: string; // matches userId
  displayName: string;
  photoURL?: string;
  bio?: string;
  skills: string[];
  education: Array<{
    school: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    description: string;
    startDate: string;
    endDate: string;
    current?: boolean;
  }>;
  languages: string[];
  certifications: string[];
  portfolioLinks: string[];
  resumeUrl?: string; // pdf etc.
  createdAt: any;
  updatedAt?: any;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  category: string;
  location: string;
  description: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  employmentType: 'full-time' | 'part-time' | 'remote' | 'contract' | 'freelance';
  workplaceType: 'on-site' | 'hybrid' | 'remote';
  isUrgent?: boolean;
  isFeatured?: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';
  ownerId: string;
  deadline?: any;
  benefits?: string;
  featuredImage?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  candidateId: string; // ownerId
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: any;
  updatedAt?: any;
}

