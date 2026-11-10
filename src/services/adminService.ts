import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Article,
  ArticleStatus,
  Author,
  Category,
  ContactMessage,
  ContactMessageStatus,
  DashboardMetrics,
  MediaItem,
  NewsletterSubscriber,
  Profile,
  Role,
  SiteSettings,
  SubscriberStatus,
  Tag,
} from '../types';
import { hydrateDemoArticle, loadDemoDb, saveDemoDb } from './demoContent';

const DEMO_ADMIN_SESSION_KEY = 'amaan_estate_demo_admin_session';

export interface AdminAuthResult {
  success: boolean;
  profile?: Profile;
  error?: string;
}

export async function getCurrentAdminProfile(): Promise<Profile | null> {
  if (isSupabaseConfigured && supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles (*)')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return null;
    const roleObj = data.roles || null;
    const roleName = roleObj?.name;
    if (!['admin', 'editor', 'author'].includes(roleName)) {
      return null;
    }
    return {
      ...data,
      role: roleObj,
    } as Profile;
  }

  if (typeof window !== 'undefined' && window.localStorage.getItem(DEMO_ADMIN_SESSION_KEY) === 'active') {
    const db = loadDemoDb();
    return db.profiles[0] || null;
  }
  return null;
}

export async function signInAdmin(email: string, password: string): Promise<AdminAuthResult> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid credentials.' };
    }

    const profile = await getCurrentAdminProfile();
    if (!profile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Your account does not have editorial or administrator permissions.',
      };
    }
    return { success: true, profile };
  }

  return {
    success: false,
    error: 'Supabase environment variables are not configured. Use Demonstration Preview Mode below or configure .env.',
  };
}

export function enterDemoAdminMode(): Profile {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DEMO_ADMIN_SESSION_KEY, 'active');
  }
  const db = loadDemoDb();
  return db.profiles[0];
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
  }
}

export async function getAdminArticles(): Promise<Article[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('articles')
      .select(
        `
        *,
        categories (*),
        authors (*),
        article_tags (
          tags (*)
        )
      `
      )
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('getAdminArticles error:', error);
      return [];
    }
    return (data || []).map((row: any) => ({
      ...row,
      category: row.categories || null,
      author: row.authors || null,
      tags: Array.isArray(row.article_tags)
        ? row.article_tags.map((t: any) => t.tags).filter(Boolean)
        : [],
      gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    }));
  }

  const db = loadDemoDb();
  return [...db.articles]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .map((a) => hydrateDemoArticle(db, a));
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [articles, categories, subscribers, messages] = await Promise.all([
    getAdminArticles(),
    getAdminCategories(),
    getSubscribers(),
    getContactMessages(),
  ]);

  return {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a) => a.status === 'published').length,
    draftArticles: articles.filter((a) => a.status === 'draft').length,
    scheduledArticles: articles.filter((a) => a.status === 'scheduled').length,
    totalCategories: categories.length,
    totalSubscribers: subscribers.filter((s) => s.status === 'subscribed').length,
    unreadMessages: messages.filter((m) => m.status === 'unread').length,
    totalMessages: messages.length,
  };
}

export interface UpsertArticlePayload {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  gallery_images: string[];
  category_id: string;
  author_id: string;
  status: ArticleStatus;
  is_featured: boolean;
  reading_time: number;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image?: string | null;
  published_at?: string | null;
  scheduled_for?: string | null;
  tagIds?: string[];
}

export async function upsertArticle(payload: UpsertArticlePayload): Promise<{ success: boolean; article?: Article; error?: string }> {
  const { tagIds = [], id, ...fields } = payload;

  const computedPublishedAt =
    fields.status === 'published'
      ? fields.published_at || new Date().toISOString()
      : fields.published_at || null;

  if (isSupabaseConfigured && supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const record = {
      ...fields,
      published_at: computedPublishedAt,
      scheduled_for: fields.status === 'scheduled' ? fields.scheduled_for || null : null,
      ...(id ? {} : { created_by: user?.id || null }),
    };

    const query = id
      ? supabase.from('articles').update(record).eq('id', id).select().single()
      : supabase.from('articles').insert(record).select().single();

    const { data, error } = await query;
    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to save article.' };
    }

    // Sync article_tags
    const { error: deleteTagsError } = await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', data.id);
    if (deleteTagsError) {
      return { success: false, error: deleteTagsError.message };
    }
    if (tagIds.length > 0) {
      const { error: insertTagsError } = await supabase.from('article_tags').insert(
        tagIds.map((tag_id) => ({ article_id: data.id, tag_id }))
      );
      if (insertTagsError) {
        return { success: false, error: insertTagsError.message };
      }
    }

    return { success: true, article: data as Article };
  }

  const db = loadDemoDb();
  const now = new Date().toISOString();
  const resolvedTags = db.tags.filter((t) => tagIds.includes(t.id));

  if (id) {
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx === -1) return { success: false, error: 'Article not found.' };
    db.articles[idx] = {
      ...db.articles[idx],
      ...fields,
      published_at: computedPublishedAt,
      scheduled_for: fields.status === 'scheduled' ? fields.scheduled_for || null : null,
      tags: resolvedTags,
      updated_at: now,
    };
    saveDemoDb(db);
    return { success: true, article: hydrateDemoArticle(db, db.articles[idx]) };
  }

  const created: Article = {
    id: `art-${Date.now()}`,
    ...fields,
    view_count: 0,
    published_at: computedPublishedAt,
    scheduled_for: fields.status === 'scheduled' ? fields.scheduled_for || null : null,
    tags: resolvedTags,
    created_at: now,
    updated_at: now,
  };
  db.articles.unshift(created);
  saveDemoDb(db);
  return { success: true, article: hydrateDemoArticle(db, created) };
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('articles').delete().eq('id', id);
    return !error;
  }
  const db = loadDemoDb();
  db.articles = db.articles.filter((a) => a.id !== id);
  saveDemoDb(db);
  return true;
}

export async function getAdminCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    if (error) console.error('getAdminCategories error:', error);
    return data || [];
  }
  return [...loadDemoDb().categories].sort((a, b) => a.display_order - b.display_order);
}

export async function upsertCategory(payload: Partial<Category> & { name: string; slug: string }): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { id, ...fields } = payload;
    const { error } = id
      ? await supabase.from('categories').update(fields).eq('id', id)
      : await supabase.from('categories').insert(fields);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  const db = loadDemoDb();
  if (payload.id) {
    const idx = db.categories.findIndex((c) => c.id === payload.id);
    if (idx !== -1) {
      db.categories[idx] = { ...db.categories[idx], ...payload, updated_at: new Date().toISOString() };
    }
  } else {
    db.categories.push({
      id: `cat-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      description: payload.description || '',
      image_url: payload.image_url || null,
      display_order: payload.display_order ?? db.categories.length + 1,
      seo_title: payload.seo_title || null,
      seo_description: payload.seo_description || null,
      created_at: new Date().toISOString(),
    });
  }
  saveDemoDb(db);
  return { success: true };
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
  const db = loadDemoDb();
  if (db.articles.some((a) => a.category_id === id)) {
    return { success: false, error: 'Cannot delete a category that still contains articles.' };
  }
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDemoDb(db);
  return { success: true };
}

export async function getAdminAuthors(): Promise<Author[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('authors').select('*').order('name', { ascending: true });
    if (error) console.error('getAdminAuthors error:', error);
    return data || [];
  }
  return [...loadDemoDb().authors];
}

export async function upsertAuthor(payload: Partial<Author> & { name: string; slug: string }): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { id, ...fields } = payload;
    const { error } = id
      ? await supabase.from('authors').update(fields).eq('id', id)
      : await supabase.from('authors').insert(fields);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
  const db = loadDemoDb();
  if (payload.id) {
    const idx = db.authors.findIndex((a) => a.id === payload.id);
    if (idx !== -1) {
      db.authors[idx] = { ...db.authors[idx], ...payload, updated_at: new Date().toISOString() };
    }
  } else {
    db.authors.push({
      id: `auth-${Date.now()}`,
      name: payload.name,
      slug: payload.slug,
      title: payload.title || 'Contributor',
      bio: payload.bio || '',
      avatar_url: payload.avatar_url || null,
      email: payload.email || null,
      twitter_url: payload.twitter_url || null,
      linkedin_url: payload.linkedin_url || null,
      active: payload.active ?? true,
      created_at: new Date().toISOString(),
    });
  }
  saveDemoDb(db);
  return { success: true };
}

export async function getTags(): Promise<Tag[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true });
    if (error) console.error('getTags error:', error);
    return data || [];
  }
  return [...loadDemoDb().tags];
}

export async function createTag(name: string): Promise<Tag | null> {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (!slug) return null;

  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase.from('tags').select('*').eq('slug', slug).maybeSingle();
    if (existing) return existing as Tag;
    const { data, error } = await supabase.from('tags').insert({ name: name.trim(), slug }).select().single();
    if (error) {
      console.error('createTag error:', error);
      return null;
    }
    return data || null;
  }

  const db = loadDemoDb();
  const existing = db.tags.find((t) => t.slug === slug);
  if (existing) return existing;
  const created: Tag = { id: `tag-${Date.now()}`, name: name.trim(), slug, created_at: new Date().toISOString() };
  db.tags.push(created);
  saveDemoDb(db);
  return created;
}

export async function getMediaLibrary(): Promise<MediaItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (error) console.error('getMediaLibrary error:', error);
    return data || [];
  }
  return [...loadDemoDb().media];
}

export async function uploadMediaFile(file: File, altText = ''): Promise<{ success: boolean; item?: MediaItem; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `articles/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from('editorial-media')
      .upload(storagePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('editorial-media').getPublicUrl(storagePath);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: mediaRow, error: dbError } = await supabase
      .from('media')
      .insert({
        file_name: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: file.type || 'image/jpeg',
        size_bytes: file.size,
        alt_text: altText,
        uploaded_by: user?.id || null,
      })
      .select()
      .single();

    if (dbError || !mediaRow) {
      return { success: false, error: dbError?.message || 'Uploaded to storage, but failed to record media metadata.' };
    }

    return { success: true, item: mediaRow as MediaItem };
  }

  // Demonstration local file reader fallback
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const db = loadDemoDb();
  const created: MediaItem = {
    id: `med-${Date.now()}`,
    file_name: file.name,
    storage_path: `demo/${Date.now()}-${file.name}`,
    public_url: dataUrl,
    mime_type: file.type || 'image/jpeg',
    size_bytes: file.size,
    alt_text: altText,
    created_at: new Date().toISOString(),
  };
  db.media.unshift(created);
  saveDemoDb(db);
  return { success: true, item: created };
}

export async function deleteMediaItem(item: MediaItem): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    await supabase.storage.from('editorial-media').remove([item.storage_path]);
    const { error } = await supabase.from('media').delete().eq('id', item.id);
    return !error;
  }
  const db = loadDemoDb();
  db.media = db.media.filter((m) => m.id !== item.id);
  saveDemoDb(db);
  return true;
}

export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (error) console.error('getSubscribers error:', error);
    return data || [];
  }
  return [...loadDemoDb().subscribers];
}

export async function updateSubscriberStatus(id: string, status: SubscriberStatus): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('newsletter_subscribers').update({ status }).eq('id', id);
    return !error;
  }
  const db = loadDemoDb();
  const item = db.subscribers.find((s) => s.id === id);
  if (item) {
    item.status = status;
    item.updated_at = new Date().toISOString();
    saveDemoDb(db);
  }
  return true;
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    return !error;
  }
  const db = loadDemoDb();
  db.subscribers = db.subscribers.filter((s) => s.id !== id);
  saveDemoDb(db);
  return true;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) console.error('getContactMessages error:', error);
    return data || [];
  }
  return [...loadDemoDb().messages];
}

export async function updateContactMessage(
  id: string,
  updates: { status?: ContactMessageStatus; admin_notes?: string }
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_messages').update(updates).eq('id', id);
    return !error;
  }
  const db = loadDemoDb();
  const msg = db.messages.find((m) => m.id === id);
  if (msg) {
    Object.assign(msg, updates, { updated_at: new Date().toISOString() });
    saveDemoDb(db);
  }
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    return !error;
  }
  const db = loadDemoDb();
  db.messages = db.messages.filter((m) => m.id !== id);
  saveDemoDb(db);
  return true;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('site_settings').upsert({ ...settings, id: 1 }, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
  const db = loadDemoDb();
  db.siteSettings = { ...db.siteSettings, ...settings, updated_at: new Date().toISOString() };
  saveDemoDb(db);
  return { success: true };
}

export async function getUsersAndRoles(): Promise<{ profiles: Profile[]; roles: Role[] }> {
  if (isSupabaseConfigured && supabase) {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*, roles (*)').order('created_at', { ascending: false }),
      supabase.from('roles').select('*').order('name', { ascending: true }),
    ]);
    if (profilesRes.error) console.error('getUsersAndRoles profiles error:', profilesRes.error);
    if (rolesRes.error) console.error('getUsersAndRoles roles error:', rolesRes.error);
    return {
      profiles: (profilesRes.data || []).map((p: any) => ({ ...p, role: p.roles || null })),
      roles: rolesRes.data || [],
    };
  }
  const db = loadDemoDb();
  return { profiles: db.profiles, roles: db.roles };
}

export async function updateUserRole(profileId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', profileId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
  const db = loadDemoDb();
  const profile = db.profiles.find((p) => p.id === profileId);
  const role = db.roles.find((r) => r.id === roleId) || null;
  if (profile) {
    profile.role_id = roleId;
    profile.role = role;
    saveDemoDb(db);
  }
  return { success: true };
}
