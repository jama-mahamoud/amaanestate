export type ListingStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'DELETED' | 'ARCHIVED';

export type UserRole = 'admin' | 'editor' | 'normal_user';

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
export type ArticleType = 'update' | 'market_report' | 'announcement' | 'new_project' | 'short_insight';

export interface GalleryImage {
  url: string;
  caption: string;
  linkUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  type: ArticleType;
  language: 'en' | 'so';
  featuredImage?: GalleryImage;
  gallery: GalleryImage[];
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
  visibility?: 'public' | 'private';
  status: ArticleStatus;
  published: boolean; // Deprecated, will be removed in future
  views: number;
  priority?: number;
  homepageSection?: string;
  
  createdAt: any;
  updatedAt?: any;
}

export interface ExpertProfile {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  isVerified: boolean;
  bio: string;
  isFeatured?: boolean;
}

// Global Legacy Support Types for Moderation & Trust modules
export type ListingCategory = string;
export type Listing = any;
export type ProfessionalService = any;
export type Agency = any;

// End of types

