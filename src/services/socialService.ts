import { supabase } from '../lib/supabase';

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'youtube' | 'instagram' | 'telegram' | 'tiktok' | 'linkedin' | 'twitter' | 'other';
  name: string;
  url: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_SEED_LINKS: SocialLink[] = [
  {
    id: 'soc-twitter',
    platform: 'twitter',
    name: 'X (Twitter)',
    url: 'https://x.com/amaanestate',
    icon_name: 'twitter',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'soc-linkedin',
    platform: 'linkedin',
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/amaanestate',
    icon_name: 'linkedin',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'soc-instagram',
    platform: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com/amaanestate',
    icon_name: 'instagram',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'soc-youtube',
    platform: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com/@amaanestate',
    icon_name: 'youtube',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'soc-facebook',
    platform: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com/amaanestate',
    icon_name: 'facebook',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'soc-telegram',
    platform: 'telegram',
    name: 'Telegram',
    url: 'https://t.me/amaanestate',
    icon_name: 'telegram',
    display_order: 6,
    is_active: true,
  },
  {
    id: 'soc-tiktok',
    platform: 'tiktok',
    name: 'TikTok',
    url: 'https://tiktok.com/@amaanestate',
    icon_name: 'tiktok',
    display_order: 7,
    is_active: true,
  },
];

const LOCAL_STORAGE_KEY = 'amaan_estate_social_links_v1';

function getLocalStoredLinks(): SocialLink[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[SocialService] Failed to read localStorage:', e);
  }
  return DEFAULT_SEED_LINKS;
}

function saveLocalStoredLinks(links: SocialLink[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(links));
  } catch (e) {
    console.warn('[SocialService] Failed to write localStorage:', e);
  }
}

export async function getActiveSocialLinks(): Promise<SocialLink[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as SocialLink[];
      }
    } catch (e) {
      console.warn('[SocialService] Supabase query exception:', e);
    }
  }

  const local = getLocalStoredLinks();
  return local
    .filter((link) => link.is_active && Boolean(link.url?.trim()))
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getAllSocialLinks(): Promise<SocialLink[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as SocialLink[];
      }
    } catch (e) {
      console.warn('[SocialService] Supabase fetch all exception:', e);
    }
  }

  return getLocalStoredLinks().sort((a, b) => a.display_order - b.display_order);
}

export async function createSocialLink(input: Omit<SocialLink, 'id' | 'created_at' | 'updated_at'>): Promise<SocialLink> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert({
          platform: input.platform,
          name: input.name,
          url: input.url,
          icon_name: input.icon_name || input.platform,
          display_order: input.display_order || 0,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (!error && data) {
        return data as SocialLink;
      }
    } catch (e) {
      console.warn('[SocialService] Supabase create error, falling back to local:', e);
    }
  }

  const current = getLocalStoredLinks();
  const newLink: SocialLink = {
    id: `soc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    platform: input.platform,
    name: input.name,
    url: input.url,
    icon_name: input.icon_name || input.platform,
    display_order: input.display_order || current.length + 1,
    is_active: input.is_active ?? true,
    created_at: new Date().toISOString(),
  };

  const updated = [...current, newLink];
  saveLocalStoredLinks(updated);
  return newLink;
}

export async function updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<SocialLink | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as SocialLink;
      }
    } catch (e) {
      console.warn('[SocialService] Supabase update error:', e);
    }
  }

  const current = getLocalStoredLinks();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...current[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedItem;
  saveLocalStoredLinks(current);
  return updatedItem;
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from('social_links').delete().eq('id', id);
      if (!error) {
        return true;
      }
    } catch (e) {
      console.warn('[SocialService] Supabase delete error:', e);
    }
  }

  const current = getLocalStoredLinks();
  const filtered = current.filter((item) => item.id !== id);
  saveLocalStoredLinks(filtered);
  return true;
}

export async function toggleSocialLinkStatus(id: string, is_active: boolean): Promise<SocialLink | null> {
  return updateSocialLink(id, { is_active });
}

export async function reorderSocialLinks(items: { id: string; display_order: number }[]): Promise<boolean> {
  if (supabase) {
    try {
      for (const item of items) {
        await supabase
          .from('social_links')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
      }
    } catch (e) {
      console.warn('[SocialService] Supabase reorder error:', e);
    }
  }

  const current = getLocalStoredLinks();
  const orderMap = new Map(items.map((i) => [i.id, i.display_order]));
  const updated = current.map((link) => {
    if (orderMap.has(link.id)) {
      return { ...link, display_order: orderMap.get(link.id)! };
    }
    return link;
  });

  saveLocalStoredLinks(updated);
  return true;
}
