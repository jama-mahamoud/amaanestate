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
  gallery_images: string[];
  category_id: string;
  author_id: string;
  category?: Category | null;
  author?: Author | null;
  tags?: Tag[];
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
}
