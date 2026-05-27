import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  User,
  ExternalLink,
  Trash2,
  Star,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService } from '@/services/moderationService';
import { articleService } from '@/services/articleService';
import { Article, ArticleStatus } from '@/types';
import { toast } from 'sonner';

// SEO & Content Validation Engine
interface ValidationIssue {
  field: string;
  severity: 'error' | 'warning';
  message: string;
}

interface ValidationReport {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  somaliVerified: boolean;
}

const performEditorialAudit = (article: Article): ValidationReport => {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // Title Audit
  if (!article.title || article.title.trim() === '') {
    issues.push({ field: 'Title/Headline', severity: 'error', message: 'The article headline is empty. A valid headline is required.' });
    score -= 25;
  } else if (article.title.trim().length < 15) {
    issues.push({ field: 'Title/Headline', severity: 'warning', message: 'Title is extremely short. Editorial guidelines recommend at least 15 characters.' });
    score -= 10;
  }

  // Slug SEO Audit
  if (!article.slug || article.slug.trim() === '') {
    issues.push({ field: 'SEO Slug', severity: 'error', message: 'SEO URL identification slug is missing. Proper routing requires a slug.' });
    score -= 15;
  }

  // Summary / Meta Description Audit
  if (!article.summary || article.summary.trim() === '') {
    issues.push({ field: 'Summary/Meta Description', severity: 'error', message: 'Executive summary (meta description) is completely blank. Search engines and readers depend on this.' });
    score -= 20;
  } else if (article.summary.trim().length > 250) {
    issues.push({ field: 'Summary/Meta Description', severity: 'warning', message: 'Summary is slightly verbose (exceeds recommended 250 characters).' });
    score -= 5;
  }

  // Hero Image Audit
  if (!article.featuredImage || article.featuredImage.trim() === '') {
    issues.push({ field: 'Featured Image', severity: 'error', message: 'Primary vector hero image asset is missing. A visual anchor is required.' });
    score -= 20;
  }

  // Category subject classification
  if (!article.category || article.category.trim() === '') {
    issues.push({ field: 'Subject Category', severity: 'error', message: 'Editorial database category classifier is unassigned.' });
    score -= 10;
  }

  // Tags Audit
  if (!article.tags || article.tags.length === 0) {
    issues.push({ field: 'Classifier Tags', severity: 'warning', message: 'No metadata tags have been mapped. Discoverability rank will remain limited.' });
    score -= 10;
  }

  // Content word count analysis
  const contentText = article.content ? article.content.replace(/<[^>]*>/g, '').trim() : '';
  const wordCount = contentText.split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 40) {
    issues.push({ field: 'Content Body', severity: 'error', message: `Word count is critical (${wordCount} words). A professional report requires at least 40 words.` });
    score -= 20;
  } else if (wordCount < 150) {
    issues.push({ field: 'Content Body', severity: 'warning', message: `Recommended length for high indexing index is 150+ words (currently ${wordCount} words).` });
    score -= 10;
  }

  // Somali UTF8 integrity check
  const somaliRegex = /[æøåáéíóúûâäöüñ Somali]/i; // Somali/UTF-8 custom character set signature search
  // Somali-specific alphabet markers like "dh", "sh", "kh", and accented vowels
  const somaliCoreWords = /\b(waa|uu|soo|iyo|ku|ah|ee|oo|ka|kuwa|leh|kaas|aan|sii|ilaa)\b/i;
  const somaliVerified = somaliRegex.test(contentText) || somaliCoreWords.test(contentText);

  const hasErrors = issues.some(issue => issue.severity === 'error');
  const finalScore = Math.max(0, score);

  return {
    isValid: !hasErrors,
    score: finalScore,
    issues,
    somaliVerified
  };
};

export default function ArticleModeratedList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'approved' | 'published'>('all');
  const [expandedScorers, setExpandedScorers] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Subscribe to all articles in real time, and we'll perform fast, lag-free client-side filtering below
    const unsubscribe = moderationService.subscribeToArticles(
      (data) => {
        setArticles(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredArticles = useMemo(() => {
    if (statusFilter === 'all') return articles;
    return articles.filter(a => {
      const artStatus = a.status || (a.published ? 'published' : 'draft');
      return artStatus === statusFilter;
    });
  }, [articles, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: ArticleStatus) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    // Validate if setting to 'approved' or 'published'
    if (newStatus === 'approved' || newStatus === 'published') {
      const audit = performEditorialAudit(article);
      if (!audit.isValid) {
        toast.error(`Publishing Denied: Fix content issues first! Click "Editorial Report" for details.`);
        setExpandedScorers(prev => ({ ...prev, [id]: true }));
        return;
      }
    }

    setActioningId(id);
    try {
      const success = await articleService.updateArticle(id, { 
        status: newStatus,
        published: newStatus === 'published' // Compatibility wrapper
      });
      
      if (success) {
        toast.success(`Success: Article Moved to ${newStatus.toUpperCase()}`);
        setArticles(prev => prev.map(a => a.id === id ? { 
          ...a, 
          status: newStatus, 
          published: newStatus === 'published' 
        } : a));
      } else {
        toast.error('Moderation error: Failed to cascade status change.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unexpected connection error during approval workflow.');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    setActioningId(id);
    const success = await articleService.updateArticle(id, { isFeatured: !isFeatured });
    if (success) {
      toast.success(isFeatured ? 'Article removed from featured highlights' : 'Article marked as featured insight');
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isFeatured: !isFeatured } : a));
    } else {
      toast.error('Failed to update dashboard priority highlight.');
    }
    setActioningId(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      'AM-909 ADMINISTRATIVE DELETION FLAG:\nAre you sure you want to permanently delete this intelligence report? This cannot be undone.'
    );
    if (!confirmed) return;
    
    setActioningId(id);
    const success = await articleService.deleteArticle(id);
    if (success) {
      toast.success('Successfully expunged article from index.');
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      toast.error('Critical authorization error: Failed to execute deletion pipeline.');
    }
    setActioningId(null);
  };

  const toggleScorer = (id: string) => {
    setExpandedScorers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderStatusBadge = (status: string | undefined) => {
    const s = status || 'draft';
    switch (s) {
      case 'published':
        return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] font-black uppercase tracking-widest">Published</span>;
      case 'approved':
        return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case 'pending':
        return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[9px] font-black uppercase tracking-widest">Pending Review</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/15 text-[9px] font-black uppercase tracking-widest">Draft Archive</span>;
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-luxury-gold mb-6" size={40} />
        <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.4em]">Querying Content Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Editorial Navigation Filters */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex flex-wrap gap-2.5">
          {([
            { id: 'all', label: 'All briefs' },
            { id: 'draft', label: 'Drafts' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'approved', label: 'Approved Only' },
            { id: 'published', label: 'Live Stream' }
          ] as const).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === filter.id 
                ? 'bg-luxury-gold text-black border-luxury-gold shadow-lg shadow-luxury-gold/5' 
                : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
              } border`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="text-[10px] uppercase tracking-widest font-black text-white/30">
          Sync Status: <span className="text-emerald-400">● Realtime Live</span>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 glass-card rounded-[3.5rem] border-dashed border-white/5 bg-white/[0.01]">
          <FileText className="text-white/10 mb-6" size={56} />
          <h3 className="text-2xl font-display font-medium text-white/60">Intelligence Feed Empty</h3>
          <p className="text-white/30 text-xs mt-2 uppercase tracking-widest">No articles found matching status filter</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredArticles.map((article) => {
            const audit = performEditorialAudit(article);
            const isScorerOpen = !!expandedScorers[article.id];
            const currentStatus = article.status || (article.published ? 'published' : 'draft');

            return (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card bg-white/[0.01] hover:bg-white/[0.02] transition-all p-10 rounded-[3.5rem] border border-white/5 flex flex-col gap-10 relative overflow-hidden"
              >
                {/* Visual Aura Highlight based on status */}
                {article.isFeatured && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
                )}

                {/* Main Grid: Card Header details */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
                  {/* Article Hero Media Column */}
                  <div className="w-full lg:w-60 aspect-[16/10] rounded-3xl overflow-hidden relative border border-white/10 shrink-0">
                    <img 
                      src={article.featuredImage || '/placeholder-news.jpg'} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4">
                      {renderStatusBadge(article.status)}
                    </div>
                    {article.isFeatured && (
                      <div className="absolute bottom-4 left-4 p-2 bg-luxury-gold rounded-xl text-black shadow-lg">
                        <Star size={12} fill="currentColor" />
                      </div>
                    )}
                  </div>

                  {/* Core Title and Meta information Column */}
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#C5A059]">{article.category}</span>
                      <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">{article.language.toUpperCase()}</span>
                      
                      {/* SEO Metric Badges */}
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black ${audit.isValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        SEO: {audit.score}%
                      </span>
                    </div>

                    <h4 className="text-2xl font-display font-medium tracking-tight text-white line-clamp-2 leading-[1.3]">{article.title}</h4>
                    
                    <div className="flex flex-wrap items-center gap-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-luxury-gold/60" /> 
                        {article.createdAt?.toDate ? article.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently Drafted'}
                      </div>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-luxury-gold/60" /> 
                        LIU User: {article.authorId ? article.authorId.substring(0, 8) : 'SysAdmin'}
                      </div>
                    </div>

                    <p className="text-white/50 text-sm line-clamp-2 leading-relaxed max-w-3xl">
                      {article.summary || "No executive summary mapped. Expand the Editorial Report panel to audit SEO status keys."}
                    </p>

                    {/* Operational controls bottom-strip */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button 
                        onClick={() => handleToggleFeature(article.id, !!article.isFeatured)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                          article.isFeatured 
                          ? 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Star size={11} fill={article.isFeatured ? 'currentColor' : 'none'} /> 
                        {article.isFeatured ? 'Featured Story' : 'Mark Featured'}
                      </button>

                      <button 
                        onClick={() => toggleScorer(article.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                          isScorerOpen 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : !audit.isValid 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {audit.isValid ? <CheckCircle2 size={11} className="text-emerald-400" /> : <AlertTriangle size={11} className="text-amber-400 animate-pulse" />}
                        SEO & Content Audit ({audit.score}%)
                        {isScorerOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      <a href={`/news/${article.slug || article.id}`} target="_blank" rel="noopener noreferrer" className="outline-none">
                        <Button variant="ghost" className="h-9 rounded-xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold text-[9px] uppercase font-black tracking-widest">
                          <Eye size={12} className="mr-2" /> Live Preview <ExternalLink size={10} className="ml-1 opacity-50" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Collapsible SEO Validator panel */}
                <AnimatePresence>
                  {isScorerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 border-t border-white/5 mt-4 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Core Scorecard Grid */}
                          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                              <Sparkles size={12} className="text-luxury-gold" /> Editorial Vitality
                            </h5>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-display font-medium text-white">{audit.score}</span>
                              <span className="text-xs text-white/30">/ 100</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${audit.isValid ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                style={{ width: `${audit.score}%` }} 
                              />
                            </div>
                          </div>

                          {/* Somali Language Compatibility Check */}
                          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                              <BookOpen size={12} className="text-luxury-gold" /> Linguistic Integrity
                            </h5>
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${audit.somaliVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                <Award size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Somali UTF-8 Match</p>
                                <p className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">
                                  {audit.somaliVerified ? 'Verified Somali Markers' : 'Default Unicode Stream'}
                                </p>
                              </div>
                            </div>
                            <p className="text-[11px] text-white/40 leading-relaxed font-light">
                              Correctly renders custom Somali symbols and text spacing without browser-level overflow leaks.
                            </p>
                          </div>

                          {/* Verification Threshold Gauge */}
                          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                              <Info size={12} className="text-luxury-gold" /> Publishing Threshold
                            </h5>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${audit.isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'}`}>
                                {audit.isValid ? <Check size={14} /> : <XCircle size={14} />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{audit.isValid ? 'Cleared & Approved' : 'Action Required'}</p>
                                <p className="text-[9px] uppercase tracking-wider text-white/30 mt-0.5">
                                  {audit.isValid ? 'All core SEO indicators OK' : 'Validation errors blocking publish'}
                                </p>
                              </div>
                            </div>
                            <p className="text-[11px] text-white/40 leading-relaxed font-light">
                              Before shifting state to Approved or Published, all missing content, headline, descriptions, and hero banner items must be resolved.
                            </p>
                          </div>
                        </div>

                        {/* Checklist of Issues */}
                        {audit.issues.length > 0 && (
                          <div className="p-6 rounded-3xl bg-luxury-gold/5 border border-luxury-gold/10 space-y-3">
                            <h6 className="text-[10px] font-black uppercase tracking-widest text-luxury-gold">Editorial Checklist Warnings:</h6>
                            <ul className="space-y-2">
                              {audit.issues.map((issue, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs">
                                  {issue.severity === 'error' ? (
                                    <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                  )}
                                  <span className="text-white/60">
                                    <strong className="text-white font-semibold">{issue.field}:</strong> {issue.message}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sequential Transitional Status Flow Bar Indicator */}
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] ml-1">Workflow Trail</span>
                  
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Background line connector */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0 hidden sm:block" />

                    {([
                      { id: 'draft', label: '1. Draft' },
                      { id: 'pending', label: '2. Pending Review' },
                      { id: 'approved', label: '3. Approved' },
                      { id: 'published', label: '4. Published' }
                    ] as const).map((step, idx) => {
                      const isActive = currentStatus === step.id;
                      const isComplete = (idx === 0) || 
                        (currentStatus === 'pending' && idx <= 1) ||
                        (currentStatus === 'approved' && idx <= 2) ||
                        (currentStatus === 'published');
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => {
                            if (currentStatus === step.id) return;
                            const steps = ['draft', 'pending', 'approved', 'published'] as const;
                            const targetIdx = steps.indexOf(step.id);
                            if (targetIdx > 1 && !audit.isValid) {
                              toast.error('Publish Restricted. Resolve all SEO & content validation errors first.');
                              setExpandedScorers(prev => ({ ...prev, [article.id]: true }));
                              return;
                            }
                            handleUpdateStatus(article.id, step.id);
                          }}
                          disabled={actioningId === article.id}
                          className={`z-10 py-5 rounded-2xl border text-center transition-all ${
                            isActive 
                              ? 'bg-luxury-gold text-black border-luxury-gold font-black shadow-xl shadow-luxury-gold/5' 
                              : isComplete 
                                ? 'bg-[#C5A059]/10 text-luxury-gold border-[#C5A059]/30 font-bold'
                                : 'bg-white/[0.02] text-white/30 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <p className="text-[10px] uppercase font-black tracking-widest">{step.label}</p>
                          <p className="text-[8px] opacity-60 mt-0.5 font-sans font-light hidden xl:block">
                            {isActive ? 'Current Phase' : isComplete ? 'Completed' : 'Locked'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expunge / Deletion administrative console panel */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                      onClick={() => handleDelete(article.id)}
                      disabled={actioningId === article.id}
                      variant="ghost"
                      className="w-full sm:w-auto text-white/25 hover:text-rose-500 hover:bg-rose-500/5 h-12 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={14} className="mr-2 text-rose-500/60" /> Expunge Record
                    </Button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
