import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  GscAnalyticsResponse,
  GscStatusResponse,
  SearchIntent,
  SeoAuditRun,
  SeoRedirect,
} from '../types';

export type AiSeoActionType =
  | 'analyze_full'
  | 'seo_title'
  | 'meta_description'
  | 'headings'
  | 'internal_links'
  | 'image_alt'
  | 'tags_category'
  | 'faq_suggestions';

export interface AiSeoMissingHeading {
  level: string;
  heading: string;
  rationale: string;
  draftParagraph: string;
}

export interface AiSeoInternalLinkSuggestion {
  url: string;
  anchorText: string;
  reason: string;
}

export interface AiSeoFaqSuggestion {
  question: string;
  answer: string;
}

export interface AiSeoSuggestionsPayload {
  summary?: string;
  suggestedFocusKeyword?: string;
  suggestedSupportingKeywords?: string[];
  suggestedSeoTitles?: string[];
  suggestedMetaDescriptions?: string[];
  suggestedSlug?: string;
  recommendedCategory?: string;
  suggestedTags?: string[];
  missingHeadings?: AiSeoMissingHeading[];
  featuredImageAltSuggestion?: string;
  keywordOveruseNotes?: string[];
  internalLinkSuggestions?: AiSeoInternalLinkSuggestion[];
  deterministicInternalLinks?: Array<{
    type: 'article' | 'property';
    id: string;
    title: string;
    url: string;
    subtitle: string;
    relevanceScore: number;
    reason: string;
    suggestedAnchorText: string;
    alreadyLinked: boolean;
  }>;
  faqSuggestions?: AiSeoFaqSuggestion[];
}

export interface LegacyRedirectBuiltIn {
  source_path: string;
  target_path: string;
  status_code: 301;
  builtIn: true;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isSupabaseConfigured && supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return headers;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders,
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error || `Request failed (${response.status})`) as Error & {
      code?: string;
      status?: number;
      redirectUri?: string;
    };
    err.code = data?.code;
    err.status = response.status;
    err.redirectUri = data?.redirectUri;
    throw err;
  }
  return data as T;
}

export async function runAiSeoOptimization(payload: {
  action: AiSeoActionType;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  focusKeyword: string;
  supportingKeywords: string[];
  searchIntent: SearchIntent;
  targetCountry: string;
  targetAudience: string;
  seoTitle: string;
  seoDescription: string;
}): Promise<{ action: AiSeoActionType; suggestions: AiSeoSuggestionsPayload }> {
  return requestJson('/api/seo/ai/optimize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchSeoRedirects(): Promise<{
  redirects: SeoRedirect[];
  builtInLegacy: LegacyRedirectBuiltIn[];
  schemaPending: boolean;
}> {
  return requestJson('/api/seo/redirects');
}

export async function createSeoRedirect(payload: {
  source_path: string;
  target_path: string;
  status_code: 301 | 302;
  notes?: string;
}): Promise<{ redirect: SeoRedirect; schemaPending: boolean }> {
  return requestJson('/api/seo/redirects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateSeoRedirect(
  id: string,
  updates: Partial<Pick<SeoRedirect, 'is_active' | 'status_code' | 'target_path' | 'notes'>>
): Promise<{ redirect: SeoRedirect }> {
  return requestJson(`/api/seo/redirects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteSeoRedirect(id: string): Promise<{ success: boolean }> {
  return requestJson(`/api/seo/redirects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function runSiteSeoAudit(): Promise<{
  audit: SeoAuditRun;
  schemaPending: boolean;
}> {
  return requestJson('/api/seo/audit/run', {
    method: 'POST',
  });
}

export async function fetchLatestSeoAudit(): Promise<{
  audit: SeoAuditRun | null;
  schemaPending: boolean;
}> {
  return requestJson('/api/seo/audit/latest');
}

export async function fetchGscStatus(): Promise<
  GscStatusResponse & { schemaPending?: boolean }
> {
  return requestJson('/api/seo/gsc/status');
}

export async function fetchGscAuthUrl(): Promise<{ url: string; redirectUri: string }> {
  return requestJson('/api/seo/gsc/auth-url');
}

export async function selectGscSite(siteUrl: string): Promise<{
  success: boolean;
  selectedSiteUrl: string;
}> {
  return requestJson('/api/seo/gsc/select-site', {
    method: 'POST',
    body: JSON.stringify({ siteUrl }),
  });
}

export async function disconnectGsc(): Promise<{ success: boolean }> {
  return requestJson('/api/seo/gsc/disconnect', {
    method: 'POST',
  });
}

export async function fetchGscAnalytics(params: {
  dateRange: '7d' | '28d' | '90d';
  siteUrl?: string;
  country?: string;
  queryFilter?: string;
}): Promise<GscAnalyticsResponse> {
  return requestJson('/api/seo/gsc/analytics', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function inspectGscUrl(inspectionUrl: string): Promise<{
  inspectionResult: Record<string, any>;
}> {
  return requestJson('/api/seo/gsc/inspect', {
    method: 'POST',
    body: JSON.stringify({ inspectionUrl }),
  });
}

export async function fetchGscSitemaps(): Promise<{
  connected: boolean;
  sitemaps: Array<Record<string, any>>;
}> {
  return requestJson('/api/seo/gsc/sitemaps');
}
