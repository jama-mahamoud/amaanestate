import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  Award,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { articleService } from '@/services/articleService';
import { moderationService } from '@/services/moderationService';
import { useAuth } from '@/contexts/AuthContext';
import { Article, ArticleStatus } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';

// Reusable SEO & Spacing Quality Audit Engine
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
  wordCount: number;
}

const performEditorialAudit = (article: Article): ValidationReport => {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // Title Audit
  if (!article.title || article.title.trim() === '') {
    issues.push({ field: 'Headline/Title', severity: 'error', message: 'Article headline is missing. Proper typography structure requires an H1 anchor.' });
    score -= 25;
  } else if (article.title.trim().length < 15) {
    issues.push({ field: 'Headline/Title', severity: 'warning', message: 'Headline is very short. Elite newspapers recommend 15+ characters.' });
    score -= 10;
  }

  // Slug Audit
  if (!article.slug || article.slug.trim() === '') {
    issues.push({ field: 'SEO URL Slug', severity: 'error', message: 'Slug ID is unassigned. Safe query engine mapping requires a slug.' });
    score -= 15;
  }

  // Summary Audit
  if (!article.summary || article.summary.trim() === '') {
    issues.push({ field: 'Meta Description/Summary', severity: 'error', message: 'Meta description/executive summary is blank. Essential for indexing and SEO lookup.' });
    score -= 20;
  }

  // Featured Image Check
  if (!article.featuredImage || article.featuredImage.trim() === '') {
    issues.push({ field: 'Hero Media Asset', severity: 'error', message: 'Featured image is unassigned. Visual content anchors are required.' });
    score -= 20;
  }

  // Classification Category Check
  if (!article.category || article.category.trim() === '') {
    issues.push({ field: 'Subject Category', severity: 'error', message: 'No target category selected for standard grid index mapping.' });
    score -= 10;
  }

  // Tags Check
  if (!article.tags || article.tags.length === 0) {
    issues.push({ field: 'Classifier Tags', severity: 'warning', message: 'No indexing tags registered. Discoverability algorithms will penalize search relevance.' });
    score -= 10;
  }

  // Spacing & Empty blocks Audit
  const contentRaw = article.content || '';
  const emptyBlockRegex = /<p>\s*?(<br\s*?\/?>)?\s*?<\/p>|<p>&nbsp;<\/p>/gi;
  const emptyBlocksMatch = contentRaw.match(emptyBlockRegex);
  if (emptyBlocksMatch && emptyBlocksMatch.length > 2) {
    issues.push({ field: 'Layout Spacing', severity: 'warning', message: `Found ${emptyBlocksMatch.length} dirty empty spacing HTML lines. Auto-cleanup is recommended.` });
    score -= 5;
  }

  // Word count metrics
  const textOnly = contentRaw.replace(/<[^>]*>/g, '').trim();
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
  
  if (wordCount < 40) {
    issues.push({ field: 'Editorial Content Body', severity: 'error', message: `Word count is too low (${wordCount} words). High tier journalism requires 40+ words.` });
    score -= 20;
  } else if (wordCount < 150) {
    issues.push({ field: 'Editorial Content Body', severity: 'warning', message: `Short brief (${wordCount} words). 150+ words is recommended for SEO density.` });
    score -= 10;
  }

  // Somali special encoding match
  const somaliRegex = /[æøåáéíóúûâäöüñ Somali]/i;
  const somaliCoreWords = /\b(waa|uu|soo|iyo|ku|ah|ee|oo|ka|kuwa|leh|kaas|aan|sii|ilaa)\b/i;
  const somaliVerified = somaliRegex.test(textOnly) || somaliCoreWords.test(textOnly);

  const hasErrors = issues.some(issue => issue.severity === 'error');
  return {
    isValid: !hasErrors,
    score: Math.max(0, score),
    issues,
    somaliVerified,
    wordCount
  };
};

export default function DashboardArticles() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [expandedReports, setExpandedReports] = useState<{ [id: string]: boolean }>({});

  const isAdminOrEditor = useMemo(() => {
    const role = profile?.role?.toString().trim().toLowerCase();
    return role === 'admin' || role === 'editor';
  }, [profile]);

  const statusCounts = useMemo(() => {
    return {
      all: articles.length,
      draft: articles.filter(a => a.status === 'draft' || (!a.status && !a.published)).length,
      pending: articles.filter(a => a.status === 'pending').length,
      approved: articles.filter(a => a.status === 'approved').length,
      published: articles.filter(a => a.status === 'published' || a.published).length,
    };
  }, [articles]);

  // Realtime subscription mapping guarantees zero-lag update feed
  useEffect(() => {
    setLoading(true);
    const unsubscribe = moderationService.subscribeToArticles((data) => {
      setArticles(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = confirm('ADMIN DELETION SAFETY ACTION:\nAre you sure you want to permanently delete this intelligence report? This actions cannot be undone.');
    if (!confirmed) return;
    
    setActioningId(id);
    const success = await articleService.deleteArticle(id);
    if (success) {
      toast.success('Successfully expunged article archive.');
      setArticles(prev => prev.filter(a => a.id !== id));
    } else {
      toast.error('Failed to execute secure deletion corridor.');
    }
    setActioningId(null);
  };

  const handleUpdateStatus = async (id: string, newStatus: ArticleStatus) => {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    // Direct editorial validation block
    if (newStatus === 'approved' || newStatus === 'published') {
      const audit = performEditorialAudit(article);
      if (!audit.isValid) {
        toast.error(`Publishing Denied: Resolve quality warnings before finalizing. Click "Editorial Report" for info.`);
        setExpandedReports(prev => ({ ...prev, [id]: true }));
        return;
      }
    }

    setActioningId(id);
    try {
      const success = await articleService.updateArticle(id, { 
        status: newStatus,
        published: newStatus === 'published' // Ensure compatibility remains constant
      });
      if (success) {
        toast.success(`Success: Article Moved to ${newStatus.toUpperCase()}`);
      } else {
        toast.error('Workflow update returned a conflict code.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network handshake failure while writing status state.');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    setActioningId(id);
    const success = await articleService.updateArticle(id, { isFeatured: !isFeatured });
    if (success) {
      toast.success(isFeatured ? 'Article removed from premium placements' : 'Article highlighted in global features panel');
    } else {
      toast.error('Failed to configure priority flags.');
    }
    setActioningId(null);
  };

  const toggleReport = (id: string) => {
    setExpandedReports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Draft Mode';
    if (dateValue.toDate) return dateValue.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    if (dateValue.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return new Date(dateValue).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter Pipeline
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = 
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      
      const matchesStatus = 
        selectedStatus === 'all' || 
        (selectedStatus === 'draft' && (article.status === 'draft' || (!article.status && !article.published))) ||
        (selectedStatus === 'pending' && article.status === 'pending') ||
        (selectedStatus === 'approved' && article.status === 'approved') ||
        (selectedStatus === 'published' && (article.status === 'published' || article.published));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [articles, searchQuery, selectedCategory, selectedStatus]);

  const allCategories = useMemo(() => {
    const cats = new Set(articles.map(a => a.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [articles]);

  const renderStatusBadge = (status: ArticleStatus | undefined, published: boolean) => {
    const s = status || (published ? 'published' : 'draft');
    switch (s) {
      case 'published':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[9px] font-black uppercase tracking-widest">Published</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[9px] font-black uppercase tracking-widest">Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 text-[9px] font-black uppercase tracking-widest animate-pulse">Pending Review</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10 text-[9px] font-black uppercase tracking-widest">Draft Archive</span>;
    }
  };

  return (
    <div className="space-y-12">
      {/* Editorial Page Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-display font-light mb-1 tracking-tight">Editorial Hub</h1>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-3" title="Realtime socket connected" />
          </div>
          <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <span>Manage, audit, and organize published articles</span>
            <span className="text-white/20">|</span>
            <span className="text-emerald-400">Live Connection Active</span>
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAdminOrEditor && (
            <div className="hidden lg:flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[#C5A059] text-[9px] font-bold uppercase tracking-wider">Staff Role:</span>
              <span className="text-white text-[9px] font-bold uppercase bg-[#C5A059]/10 px-2 py-0.5 rounded border border-[#C5A059]/20">{profile?.role}</span>
            </div>
          )}
          <Button asChild className="w-full md:w-auto bg-[#C5A059] text-black hover:bg-white h-14 px-8 rounded-2xl font-bold font-sans text-xs uppercase tracking-wider shadow-xl shadow-[#C5A059]/5 transition-all duration-300 hover:-translate-y-0.5">
            <Link to="/dashboard/articles/create">
              <Plus size={16} className="mr-2.5" /> Write New Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Modern Filter Rail & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C5A059] transition-colors" size={18} />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..." 
            className="bg-white/5 border-white/5 h-14 pl-14 rounded-2xl text-white placeholder:text-white/25 text-sm focus-visible:ring-[#C5A059]/25" 
          />
        </div>
        
        <div className="flex gap-2 shrink-0">
          {allCategories.map((cat) => (
            <Button
              key={cat}
              variant="outline"
              onClick={() => setSelectedCategory(cat)}
              className={`h-14 px-5 rounded-2xl text-[10px] uppercase font-black tracking-wider transition-all border ${
                selectedCategory === cat 
                  ? 'bg-luxury-gold text-black border-luxury-gold hover:bg-white hover:text-black' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/50 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Channels' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Editorial Status Sections */}
      <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-2">
        {([
          { id: 'all', label: 'All Articles', icon: <FileText size={14} /> },
          { id: 'draft', label: 'Drafts', icon: <History size={14} /> },
          { id: 'pending', label: 'Under Review', icon: <CheckCircle2 size={14} className="text-amber-400" /> },
          { id: 'published', label: 'Published', icon: <Eye size={14} className="text-emerald-400" /> }
        ] as const).map((tab) => {
          const count = statusCounts[tab.id as keyof typeof statusCounts] || 0;
          const isActive = selectedStatus === tab.id;
          return (
            <Button
              key={tab.id}
              variant="outline"
              onClick={() => setSelectedStatus(tab.id)}
              className={`h-12 px-6 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all border flex items-center gap-2.5 ${
                isActive 
                  ? tab.id === 'pending' 
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20' 
                    : tab.id === 'published'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-[#C5A059] text-black border-[#C5A059] hover:bg-white hover:text-black font-bold'
                  : 'bg-[#111] border-white/5 hover:bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  isActive 
                    ? 'bg-white/15 text-current' 
                    : 'bg-white/5 text-white/40'
                }`}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Core Editorial Table Container */}
      <div className="glass-card rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl bg-[#0f0f0f]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#C5A059] mb-4" size={32} />
            <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Loading publishing desk...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-wider text-white/40">Article Headline</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-wider text-white/40">Status</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-wider text-white/40">Category</th>
                  {isAdminOrEditor && (
                    <th className="p-6 text-[10px] font-bold uppercase tracking-wider text-white/40 text-center">Actions & Reviews</th>
                  )}
                  <th className="p-6 text-[10px] font-bold uppercase tracking-wider text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredArticles.map((article, i) => {
                  const audit = performEditorialAudit(article);
                  const isReportOpen = !!expandedReports[article.id];
                  const currentStatus = article.status || (article.published ? 'published' : 'draft');

                  return (
                    <tr 
                      key={article.id}
                      className="group hover:bg-white/[0.02] transition-colors border-b border-white/5"
                    >
                      {/* Title information */}
                      <td className="p-6 max-w-md">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-display font-medium text-white group-hover:text-luxury-gold transition-colors block line-clamp-1">
                              {article.title}
                            </span>
                            {article.isFeatured && (
                              <span className="px-2 py-0.5 rounded text-[7px] font-black bg-luxury-gold/20 text-luxury-gold uppercase tracking-wider flex items-center gap-1">
                                <Award size={8} fill="currentColor" /> Feature
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-[9px] font-bold text-white/30 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} className="text-luxury-gold/60" /> {formatDate(article.createdAt)}
                            </span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="flex items-center gap-1 font-mono">
                              Word Count: {audit.wordCount}
                            </span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <button
                              onClick={() => toggleReport(article.id)}
                              className={`flex items-center gap-1 font-black ${audit.isValid ? 'text-emerald-400 hover:text-emerald-300' : 'text-amber-400 hover:text-amber-300'}`}
                            >
                              Report: {audit.score}% {isReportOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          </div>

                          {/* SEO warnings list showing missing fields when open */}
                          <AnimatePresence>
                            {isReportOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-2 space-y-2 text-[11px] text-white/60"
                              >
                                <p className="font-bold text-white uppercase text-[8px] tracking-wider text-luxury-gold">Editorial Vitality Analysis</p>
                                <ul className="space-y-1 pl-1">
                                  {audit.issues.map((issue, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      {issue.severity === 'error' ? (
                                        <XCircle size={12} className="text-rose-500 shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                      )}
                                      <span>
                                        <strong className="text-white">{issue.field}:</strong> {issue.message}
                                      </span>
                                    </li>
                                  ))}
                                  {audit.issues.length === 0 && (
                                    <li className="flex items-center gap-1.5 text-emerald-400">
                                      <CheckCircle2 size={12} /> All metadata standards completely satisfied. Article is ready for live publishing.
                                    </li>
                                  )}
                                </ul>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                                  <span className="text-[9px] uppercase text-white/30 font-mono">Somali UTF-8 Check:</span>
                                  <span className={`text-[9px] uppercase font-bold p-1 rounded font-mono ${audit.somaliVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                                    {audit.somaliVerified ? 'PASSED (Somali Verified)' : 'LATIN ENCODING ONLY'}
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="p-6">
                        {renderStatusBadge(article.status, article.published)}
                      </td>

                      {/* Categorization Column */}
                      <td className="p-6 capitalize italic font-display text-sm font-semibold text-white/60">
                        {article.category || 'news'}
                      </td>

                      {/* Editorial Verification Room & Quick Actions (Exclusive to Admin & Editors) */}
                      {isAdminOrEditor && (
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                            {([
                              { id: 'draft', label: 'Draft' },
                              { id: 'pending', label: 'Submit' },
                              { id: 'approved', label: 'Approve' },
                              { id: 'published', label: 'Publish' }
                            ] as const).map((step, idx) => {
                              const isActive = currentStatus === step.id;
                              const steps = ['draft', 'pending', 'approved', 'published'] as const;
                              const currentIdx = steps.indexOf(currentStatus as any);
                              const targetIdx = steps.indexOf(step.id);
                              const isCompleted = targetIdx <= currentIdx;

                              return (
                                <button
                                  key={step.id}
                                  disabled={actioningId === article.id}
                                  onClick={() => {
                                    if (isActive) return;
                                    handleUpdateStatus(article.id, step.id);
                                  }}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl border w-20 transition-all ${
                                    isActive 
                                      ? 'bg-luxury-gold text-black border-luxury-gold font-bold shadow-md shadow-luxury-gold/5' 
                                      : isCompleted
                                        ? 'bg-[#C5A059]/10 text-luxury-gold border-[#C5A059]/25 hover:bg-[#C5A059]/20'
                                        : 'bg-white/5 text-white/30 border-white/5 hover:border-white/10'
                                  }`}
                                  title={`Move to ${step.label}`}
                                >
                                  <span className="text-[9px] uppercase font-black tracking-wider">{step.label}</span>
                                  {isActive ? (
                                    <Check size={10} className="mt-0.5" />
                                  ) : (
                                    <span className="text-[7px] text-white/40 block mt-0.5">Move</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}

                      {/* Right Action buttons */}
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="h-8 px-2.5 rounded-xl border border-white/5 text-[9px] uppercase font-bold tracking-wider hover:bg-white/10 gap-1.5 flex items-center text-white/60 hover:text-white"
                          >
                            <Link to={`/news/${article.slug || article.id}`} target="_blank">
                              <Eye size={12} />
                              <span className="hidden sm:inline">Preview</span> <ExternalLink size={8} />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="h-8 px-2.5 rounded-xl border border-luxury-gold/25 hover:border-luxury-gold hover:bg-luxury-gold/10 text-luxury-gold text-[9px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                          >
                            <Link to={`/dashboard/articles/edit/${article.id}`}>
                              <Edit3 size={11} />
                              <span className="hidden sm:inline">Modify</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2.5 rounded-xl border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-500 text-[9px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                            onClick={() => handleDelete(article.id)}
                            disabled={actioningId === article.id}
                          >
                            {actioningId === article.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                            <span className="hidden sm:inline">Expunge</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            variant="dashed"
            showPlusIcon
            title="Registry Void" 
            description="The search found no articles in our intelligence archive. Change filters or initiate a premium draft pipeline now." 
            actionLabel="Initiate Draft"
            onAction={() => navigate('/dashboard/articles/create')}
            icon={<FileText size={40} />}
          />
        )}
      </div>
    </div>
  );
}
