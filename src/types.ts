export type RoleName = 'admin' | 'editor' | 'author' | 'reader';

export interface Role {
  id: string;
  name: RoleName;
  description?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  role_id?: string | null;
  role?: Role | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string | null;
  display_order: number;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Author {
  id: string;
  profile_id?: string | null;
  name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url?: string | null;
  email?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type ArticleStatus = 'draft' | 'scheduled' | 'published';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  featured_image_caption?: string | null;
  gallery_images: string[];
  category_id: string;
  author_id: string;
  category?: Category | null;
  author?: Author | null;
  tags?: Tag[];
  keywords?: string[];
  status: ArticleStatus;
  is_featured: boolean;
  reading_time: number;
  view_count: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  published_at?: string | null;
  scheduled_for?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  alt_text?: string;
  uploaded_by?: string | null;
  created_at: string;
}

export type SubscriberStatus = 'subscribed' | 'unsubscribed';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string;
  confirmed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export type ContactMessageStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  tagline: string;
  domain: string;
  default_seo_title: string;
  default_seo_description: string;
  default_og_image?: string | null;
  editorial_email: string;
  social_links: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  adsense_client_id?: string;
  adsense_enabled: boolean;
  updated_at?: string;
}

export interface DashboardMetrics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalCategories: number;
  totalAuthors: number;
  totalSubscribers: number;
  totalViews: number;
  unreadMessages: number;
  totalMessages: number;
  totalProperties?: number;
  saleProperties?: number;
  rentProperties?: number;
  newEnquiries?: number;
}

export type TransactionType = 'sale' | 'rent';

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'townhouse'
  | 'condominium'
  | 'land'
  | 'other';

export type ListingStatus =
  | 'available'
  | 'pending'
  | 'under_contract'
  | 'sold'
  | 'rented'
  | 'off_market';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export type RentalPeriod = 'month' | 'year' | 'week';

export type AreaUnit = 'sqft' | 'sqm' | 'acres';

export interface ListingSource {
  id: string;
  source_name: string;
  source_type: 'manual' | 'listhub' | 'feed' | 'api';
  feed_url?: string | null;
  is_active: boolean;
  sync_frequency?: string | null;
  last_synced_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  alt_text?: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  listing_status: ListingStatus;
  publication_status: PublicationStatus;
  price: number;
  currency: string;
  rental_period?: RentalPeriod | null;
  available_from?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_value?: number | null;
  area_unit: AreaUnit;
  address_line?: string | null;
  city: string;
  state_region?: string | null;
  country: string;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  features: string[];
  is_featured: boolean;
  agent_name?: string | null;
  agent_email?: string | null;
  agent_phone?: string | null;
  brokerage_name?: string | null;
  source_id?: string | null;
  source_name: string;
  source_listing_id?: string | null;
  source_url?: string | null;
  published_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  images?: PropertyImage[];
  is_sample?: boolean;
}

export type EnquiryStatus = 'new' | 'contacted' | 'closed' | 'archived';

export interface PropertyEnquiry {
  id: string;
  property_id: string;
  property?: Pick<Property, 'id' | 'title' | 'slug' | 'transaction_type' | 'city' | 'country'> | null;
  full_name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: EnquiryStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PropertyFilterOptions {
  transaction_type: TransactionType;
  property_type?: string;
  location?: string;
  min_price?: string | number;
  max_price?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  listing_status?: string;
  rental_period?: string;
  availability_date?: string;
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  schemaPending?: boolean;
}

export interface PropertyLocationStat {
  city: string;
  country: string;
  totalCount: number;
  saleCount: number;
  rentCount: number;
}

