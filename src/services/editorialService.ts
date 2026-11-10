import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Article, Category, SiteSettings } from '../types';
import { hydrateDemoArticle, loadDemoDb, saveDemoDb } from './demoContent';

export interface ArticleQueryOptions {
  categorySlug?: string;
  search?: string;
  tagSlug?: string;
  featured?: boolean;
  sortBy?: 'latest' | 'popular';
  limit?: number;
}

function normalizeArticleRow(row: any): Article {
  const tags = Array.isArray(row.article_tags)
    ? row.article_tags.map((at: any) => at.tags).filter(Boolean)
    : Array.isArray(row.tags)
    ? row.tags
    : [];

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    featured_image: row.featured_image || null,
    gallery_images: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    category_id: row.category_id,
    author_id: row.author_id,
    category: row.categories || row.category || null,
    author: row.authors || row.author || null,
    tags,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    reading_time: Number(row.reading_time) || 5,
    view_count: Number(row.view_count) || 0,
    seo_title: row.seo_title || null,
    seo_description: row.seo_description || null,
    og_image: row.og_image || null,
    published_at: row.published_at || null,
    scheduled_for: row.scheduled_for || null,
    created_by: row.created_by || null,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  };
}

export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      console.error('Supabase getCategories error:', error);
      return [];
    }
    return data || [];
  }

  const db = loadDemoDb();
  return [...db.categories].sort((a, b) => a.display_order - b.display_order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('Supabase getCategoryBySlug error:', error);
      return null;
    }
    return data || null;
  }

  const db = loadDemoDb();
  return db.categories.find((c) => c.slug === slug) || null;
}

export async function getPublishedArticles(options: ArticleQueryOptions = {}): Promise<Article[]> {
  const { categorySlug, search, tagSlug, featured, sortBy = 'latest', limit } = options;

  if (isSupabaseConfigured && supabase) {
    const nowIso = new Date().toISOString();
    const categorySelect =
      categorySlug && categorySlug !== 'all' ? 'categories!inner (*)' : 'categories (*)';

    let query = supabase
      .from('articles')
      .select(
        `
        *,
        ${categorySelect},
        authors (*),
        article_tags (
          tags (*)
        )
      `
      )
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${nowIso}`);

    if (categorySlug && categorySlug !== 'all') {
      query = query.eq('categories.slug', categorySlug);
    }

    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }

    if (search && search.trim()) {
      const safeTerm = search.trim().replace(/[(),%]/g, ' ').replace(/\s+/g, ' ').trim();
      if (safeTerm) {
        query = query.or(
          `title.ilike.%${safeTerm}%,excerpt.ilike.%${safeTerm}%,content.ilike.%${safeTerm}%`
        );
      }
    }

    if (sortBy === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false, nullsFirst: false });
    }

    if (limit && !tagSlug) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getPublishedArticles error:', error);
      return [];
    }

    let results = (data || []).map(normalizeArticleRow);

    if (tagSlug) {
      results = results.filter((a) => a.tags?.some((t) => t.slug === tagSlug));
    }

    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  // Demonstration fallback when Supabase credentials are not yet configured
  const db = loadDemoDb();
  const now = Date.now();
  let results = db.articles
    .filter((a) => a.status === 'published' && (!a.published_at || new Date(a.published_at).getTime() <= now))
    .map((a) => hydrateDemoArticle(db, a));

  if (categorySlug && categorySlug !== 'all') {
    results = results.filter((a) => a.category?.slug === categorySlug);
  }
  if (featured !== undefined) {
    results = results.filter((a) => a.is_featured === featured);
  }
  if (tagSlug) {
    results = results.filter((a) => a.tags?.some((t) => t.slug === tagSlug));
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category?.name.toLowerCase().includes(q) ||
        a.author?.name.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'popular') {
    results.sort((a, b) => b.view_count - a.view_count);
  } else {
    results.sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    );
  }

  return limit ? results.slice(0, limit) : results;
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  if (isSupabaseConfigured && supabase) {
    const nowIso = new Date().toISOString();
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
      .eq('slug', slug)
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .maybeSingle();

    if (error) {
      console.error('Supabase getPublishedArticleBySlug error:', error);
      return null;
    }

    if (!data) return null;

    // Non-blocking view increment via SQL RPC
    Promise.resolve(supabase.rpc('increment_article_view', { article_slug: slug })).catch(() => {});

    return normalizeArticleRow(data);
  }

  const db = loadDemoDb();
  const found = db.articles.find((a) => a.slug === slug && a.status === 'published');
  if (!found) return null;

  found.view_count = (found.view_count || 0) + 1;
  saveDemoDb(db);
  return hydrateDemoArticle(db, found);
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const all = await getPublishedArticles({ sortBy: 'latest' });
  const sameCategory = all.filter(
    (a) => a.id !== article.id && a.category_id === article.category_id
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = all.filter((a) => a.id !== article.id && a.category_id !== article.category_id);
  return [...sameCategory, ...others].slice(0, limit);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (!error && data) {
      return data as SiteSettings;
    }
  }
  return loadDemoDb().siteSettings;
}

export async function subscribeNewsletter(
  email: string,
  source = 'website'
): Promise<{ success: boolean; message: string }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('subscribe_newsletter', {
      subscriber_email: normalized,
      subscribe_source: source,
    });
    if (error) {
      console.error('Supabase subscribeNewsletter error:', error);
      return { success: false, message: 'Unable to complete subscription right now.' };
    }
    if (data === 'already_subscribed') {
      return { success: true, message: 'You are already subscribed to AMAAN ESTATE briefings.' };
    }
    if (data === 'invalid_email') {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    return { success: true, message: 'Subscription confirmed. Welcome to AMAAN ESTATE.' };
  }

  const db = loadDemoDb();
  const existing = db.subscribers.find((s) => s.email.toLowerCase() === normalized);
  if (existing) {
    existing.status = 'subscribed';
    existing.updated_at = new Date().toISOString();
    saveDemoDb(db);
    return { success: true, message: 'Subscription confirmed. Welcome to AMAAN ESTATE.' };
  }
  db.subscribers.unshift({
    id: `sub-${Date.now()}`,
    email: normalized,
    status: 'subscribed',
    source,
    confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
  saveDemoDb(db);
  return { success: true, message: 'Subscription confirmed. Welcome to AMAAN ESTATE.' };
}

export async function unsubscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('unsubscribe_newsletter', {
      subscriber_email: normalized,
    });
    if (error) {
      return { success: false, message: 'Unable to process your request.' };
    }
    if (!data) {
      return { success: false, message: 'No active subscription found for that email address.' };
    }
    return { success: true, message: 'You have been unsubscribed from future editorial mailings.' };
  }

  const db = loadDemoDb();
  const existing = db.subscribers.find((s) => s.email.toLowerCase() === normalized);
  if (!existing) {
    return { success: false, message: 'No subscription found for that email address.' };
  }
  existing.status = 'unsubscribed';
  existing.updated_at = new Date().toISOString();
  saveDemoDb(db);
  return { success: true, message: 'You have been unsubscribed from future editorial mailings.' };
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('contact_messages').insert({
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      subject: payload.subject.trim() || 'General Inquiry',
      message: payload.message.trim(),
    });
    if (error) {
      console.error('Supabase submitContactMessage error:', error);
      return { success: false, error: 'Unable to deliver your message. Please verify your inputs.' };
    }
    return { success: true };
  }

  const db = loadDemoDb();
  db.messages.unshift({
    id: `msg-${Date.now()}`,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    subject: payload.subject.trim() || 'General Inquiry',
    message: payload.message.trim(),
    status: 'unread',
    admin_notes: '',
    created_at: new Date().toISOString(),
  });
  saveDemoDb(db);
  return { success: true };
}
