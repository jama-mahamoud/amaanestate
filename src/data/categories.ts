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
  { id: 'software-tools', label: 'Software & Tools', iconName: 'Laptop', icon: Laptop },
  { id: 'tech-gear', label: 'Tech Gear', iconName: 'Tv', icon: Tv },
  { id: 'expert-reviews', label: 'Expert Reviews', iconName: 'Book', icon: Book },
  { id: 'deals-offers', label: 'Reviews', iconName: 'ShoppingCart', icon: ShoppingCart },
  { id: 'ai-solutions', label: 'AI Solutions', iconName: 'Sparkles', icon: Sparkles },
  { id: 'web-services', label: 'Web Services', iconName: 'Globe', icon: Globe },
  { id: 'business-productivity', label: 'Business Productivity', iconName: 'Briefcase', icon: Briefcase },
  { id: 'marketing-seo', label: 'Marketing & SEO', iconName: 'Megaphone', icon: Megaphone },
  { id: 'ecommerce', label: 'E-commerce', iconName: 'ShoppingCart', icon: ShoppingCart },
  { id: 'education', label: 'Education', iconName: 'GraduationCap', icon: GraduationCap },
  { id: 'security', label: 'Security & Privacy', iconName: 'Shield', icon: Shield },
  { id: 'developer-tools', label: 'Developer Tools', iconName: 'Code', icon: Code },
  { id: 'cloud-hosting', label: 'Cloud & Hosting', iconName: 'Cloud', icon: Cloud },
];

export const CATEGORY_MIGRATION_MAP: Record<string, string> = {
  'real-estate': 'software-tools',
  'finance': 'deals-offers',
  'tech': 'software-tools',
  'market': 'deals-offers',
  'learning': 'education',
  'technology-software': 'software-tools',
  'electronics-gadgets': 'tech-gear',
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
