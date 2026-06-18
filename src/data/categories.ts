import React from 'react';
import { 
  Building2, 
  Coins, 
  Laptop, 
  Sparkles, 
  Globe, 
  Briefcase, 
  Megaphone, 
  ShoppingCart, 
  GraduationCap, 
  Utensils, 
  Hammer, 
  Tv, 
  Printer, 
  Heart, 
  Smile, 
  Dumbbell, 
  Car, 
  Plane, 
  Shirt, 
  Book, 
  Film, 
  Shield, 
  Cloud, 
  Code, 
  TrendingUp, 
  UserCheck, 
  ShoppingBag,
  LucideIcon
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  iconName: string;
  icon: LucideIcon;
}

export const CATEGORY_LIST: CategoryItem[] = [
  { id: 'real-estate', label: 'Real Estate', iconName: 'Building2', icon: Building2 },
  { id: 'finance-banking', label: 'Finance & Banking', iconName: 'Coins', icon: Coins },
  { id: 'technology-software', label: 'Technology & Software', iconName: 'Laptop', icon: Laptop },
  { id: 'ai-tools', label: 'AI Tools', iconName: 'Sparkles', icon: Sparkles },
  { id: 'web-hosting', label: 'Web Hosting & Domains', iconName: 'Globe', icon: Globe },
  { id: 'business-productivity', label: 'Business & Productivity', iconName: 'Briefcase', icon: Briefcase },
  { id: 'marketing-seo', label: 'Marketing & SEO', iconName: 'Megaphone', icon: Megaphone },
  { id: 'ecommerce', label: 'E-commerce', iconName: 'ShoppingCart', icon: ShoppingCart },
  { id: 'education-learning', label: 'Education & Online Learning', iconName: 'GraduationCap', icon: GraduationCap },
  { id: 'home-kitchen', label: 'Home & Kitchen', iconName: 'Utensils', icon: Utensils },
  { id: 'home-improvement', label: 'Home Improvement', iconName: 'Hammer', icon: Hammer },
  { id: 'electronics-gadgets', label: 'Electronics & Gadgets', iconName: 'Tv', icon: Tv },
  { id: 'office-equipment', label: 'Office Equipment', iconName: 'Printer', icon: Printer },
  { id: 'health-wellness', label: 'Health & Wellness', iconName: 'Heart', icon: Heart },
  { id: 'beauty-personal-care', label: 'Beauty & Personal Care', iconName: 'Smile', icon: Smile },
  { id: 'sports-fitness', label: 'Sports & Fitness', iconName: 'Dumbbell', icon: Dumbbell },
  { id: 'automotive', label: 'Automotive', iconName: 'Car', icon: Car },
  { id: 'travel', label: 'Travel', iconName: 'Plane', icon: Plane },
  { id: 'fashion-apparel', label: 'Fashion & Apparel', iconName: 'Shirt', icon: Shirt },
  { id: 'books-media', label: 'Books & Media', iconName: 'Book', icon: Book },
  { id: 'entertainment', label: 'Entertainment', iconName: 'Film', icon: Film },
  { id: 'security-privacy', label: 'Security & Privacy', iconName: 'Shield', icon: Shield },
  { id: 'cloud-services', label: 'Cloud Services', iconName: 'Cloud', icon: Cloud },
  { id: 'developer-tools', label: 'Developer Tools', iconName: 'Code', icon: Code },
  { id: 'market', label: 'Market Partners', iconName: 'TrendingUp', icon: TrendingUp },
  { id: 'executive-development', label: 'Executive Development', iconName: 'UserCheck', icon: UserCheck },
  { id: 'general-consumer', label: 'General Consumer Products', iconName: 'ShoppingBag', icon: ShoppingBag },
];

export const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  'real-estate': 'real-estate',
  'finance': 'finance-banking',
  'tech': 'technology-software',
  'market': 'market',
  'learning': 'executive-development',
};

/**
 * Maps legacy/unsupported category values to the new taxonomy IDs.
 */
export function normalizeCategory(cat: string): string {
  if (!cat) return 'general-consumer';
  const cleanCat = cat.toLowerCase().trim();
  
  if (CATEGORY_MIGRATION_MAP[cleanCat]) {
    return CATEGORY_MIGRATION_MAP[cleanCat];
  }
  
  const exists = CATEGORY_LIST.some(c => c.id === cleanCat);
  if (exists) return cleanCat;
  
  return 'general-consumer';
}

/**
 * Returns the human-friendly label for a category.
 */
export function getCategoryLabel(cat: string): string {
  const normalized = normalizeCategory(cat);
  const found = CATEGORY_LIST.find(c => c.id === normalized);
  return found ? found.label : normalized.replace('-', ' ');
}

/**
 * Returns the React LucideIcon class for a category.
 */
export function getCategoryIcon(cat: string): LucideIcon {
  const normalized = normalizeCategory(cat);
  const found = CATEGORY_LIST.find(c => c.id === normalized);
  return found ? found.icon : ShoppingBag;
}
