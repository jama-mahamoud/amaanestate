import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import {
  Article,
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
  Tag,
} from '../../types';
import {
  deleteArticle,
  deleteCategory,
  deleteContactMessage,
  deleteMediaItem,
  deleteSubscriber,
  getAdminArticles,
  getAdminAuthors,
  getAdminCategories,
  getContactMessages,
  getCurrentAdminProfile,
  getDashboardMetrics,
  getMediaLibrary,
  getSubscribers,
  getTags,
  getUsersAndRoles,
  signOutAdmin,
  updateContactMessage,
  updateSiteSettings,
  updateSubscriberStatus,
  updateUserRole,
  uploadMediaFile,
  upsertArticle,
  upsertAuthor,
  upsertCategory,
} from '../../services/adminService';
import { getSiteSettings } from '../../services/editorialService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { resolveEditorialImage } from '../../lib/editorialImages';
import { useSEO } from '../../hooks/useSEO';
import ArticleEditorModal from '../../components/admin/ArticleEditorModal';
import { toast } from 'sonner';

type AdminTab =
  | 'overview'
  | 'articles'
  | 'categories'
  | 'authors'
  | 'media'
  | 'newsletter'
  | 'messages'
  | 'settings'
  | 'users';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalCategories: 0,
    totalSubscribers: 0,
    unreadMessages: 0,
    totalMessages: 0,
  });

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Article filters & editor modal
  const [articleSearch, setArticleSearch] = useState('');
  const [articleStatusFilter, setArticleStatusFilter] = useState<string>('all');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  // Category form state
  const [catForm, setCatForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    seo_title: '',
    seo_description: '',
  });

  // Author form state
  const [authorForm, setAuthorForm] = useState<Partial<Author>>({
    name: '',
    slug: '',
    title: '',
    bio: '',
    avatar_url: 'author-portrait',
    email: '',
    active: true,
  });

  useSEO({
    title: 'Editorial Admin Dashboard',
    description: 'AMAAN ESTATE editorial content management and administration workspace.',
  });

  const loadAllData = async () => {
    const [m, arts, cats, auths, tgs, med, subs, msgs, setts, usersData] = await Promise.all([
      getDashboardMetrics(),
      getAdminArticles(),
      getAdminCategories(),
      getAdminAuthors(),
      getTags(),
      getMediaLibrary(),
      getSubscribers(),
      getContactMessages(),
      getSiteSettings(),
      getUsersAndRoles(),
    ]);
    setMetrics(m);
    setArticles(arts);
    setCategories(cats);
    setAuthors(auths);
    setTags(tgs);
    setMedia(med);
    setSubscribers(subs);
    setMessages(msgs);
    setSiteSettings(setts);
    setUsers(usersData.profiles);
    setRoles(usersData.roles);
  };

  useEffect(() => {
    async function init() {
      const prof = await getCurrentAdminProfile();
      if (!prof) {
        navigate('/admin/login', { replace: true });
        return;
      }
      setProfile(prof);
      setCheckingAuth(false);
      await loadAllData();
    }
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate('/admin/login', { replace: true });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-[#5C5A55]">
        Verifying editorial session...
      </div>
    );
  }

  const filteredArticles = articles.filter((a) => {
    const matchesStatus = articleStatusFilter === 'all' || a.status === articleStatusFilter;
    const matchesCategory = articleCategoryFilter === 'all' || a.category_id === articleCategoryFilter;
    const q = articleSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.author?.name.toLowerCase().includes(q);
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleQuickToggleStatus = async (art: Article) => {
    const nextStatus = art.status === 'published' ? 'draft' : 'published';
    const res = await upsertArticle({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      featured_image: art.featured_image,
      gallery_images: art.gallery_images,
      category_id: art.category_id,
      author_id: art.author_id,
      status: nextStatus,
      is_featured: art.is_featured,
      reading_time: art.reading_time,
      seo_title: art.seo_title,
      seo_description: art.seo_description,
      og_image: art.og_image,
      published_at: nextStatus === 'published' ? art.published_at || new Date().toISOString() : art.published_at,
      tagIds: art.tags?.map((t) => t.id) || [],
    });
    if (res.success) {
      toast.success(`Article moved to ${nextStatus}.`);
      loadAllData();
    }
  };

  const handleQuickToggleFeatured = async (art: Article) => {
    const res = await upsertArticle({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      featured_image: art.featured_image,
      gallery_images: art.gallery_images,
      category_id: art.category_id,
      author_id: art.author_id,
      status: art.status,
      is_featured: !art.is_featured,
      reading_time: art.reading_time,
      seo_title: art.seo_title,
      seo_description: art.seo_description,
      og_image: art.og_image,
      published_at: art.published_at,
      tagIds: art.tags?.map((t) => t.id) || [],
    });
    if (res.success) {
      toast.success(!art.is_featured ? 'Article featured.' : 'Removed from featured.');
      loadAllData();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const ok = await deleteArticle(id);
    if (ok) {
      toast.success('Article deleted.');
      loadAllData();
    } else {
      toast.error('Unable to delete article.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name?.trim() || !catForm.slug?.trim()) {
      toast.error('Category name and slug are required.');
      return;
    }
    const res = await upsertCategory({
      id: catForm.id,
      name: catForm.name.trim(),
      slug: catForm.slug.trim().toLowerCase(),
      description: catForm.description || '',
      image_url: catForm.image_url || null,
      display_order: Number(catForm.display_order) || 1,
      seo_title: catForm.seo_title || null,
      seo_description: catForm.seo_description || null,
    });
    if (res.success) {
      toast.success(catForm.id ? 'Category updated.' : 'Category created.');
      setCatForm({ name: '', slug: '', description: '', image_url: '', display_order: categories.length + 1, seo_title: '', seo_description: '' });
      loadAllData();
    } else {
      toast.error(res.error || 'Failed to save category.');
    }
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorForm.name?.trim() || !authorForm.slug?.trim()) {
      toast.error('Author name and slug are required.');
      return;
    }
    const res = await upsertAuthor({
      id: authorForm.id,
      name: authorForm.name.trim(),
      slug: authorForm.slug.trim().toLowerCase(),
      title: authorForm.title || 'Contributor',
      bio: authorForm.bio || '',
      avatar_url: authorForm.avatar_url || 'author-portrait',
      email: authorForm.email || null,
      active: authorForm.active ?? true,
    });
    if (res.success) {
      toast.success(authorForm.id ? 'Author updated.' : 'Author added.');
      setAuthorForm({ name: '', slug: '', title: '', bio: '', avatar_url: 'author-portrait', email: '', active: true });
      loadAllData();
    } else {
      toast.error(res.error || 'Failed to save author.');
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadMediaFile(file, file.name);
    if (res.success) {
      toast.success('Media uploaded.');
      loadAllData();
    } else {
      toast.error(res.error || 'Upload failed.');
    }
  };

  const handleExportSubscribersCsv = () => {
    const header = 'email,status,source,created_at\n';
    const rows = subscribers
      .map((s) => `"${s.email}","${s.status}","${s.source}","${s.created_at}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'amaan-estate-subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    const res = await updateSiteSettings(siteSettings);
    if (res.success) {
      toast.success('Site & SEO settings saved.');
      loadAllData();
    } else {
      toast.error(res.error || 'Failed to save settings.');
    }
  };

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'articles', label: 'Articles', icon: <BookOpen size={16} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={16} /> },
    { id: 'authors', label: 'Authors', icon: <Users size={16} /> },
    { id: 'media', label: 'Media Library', icon: <ImageIcon size={16} /> },
    { id: 'newsletter', label: 'Newsletter', icon: <Mail size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
    { id: 'settings', label: 'SEO & Settings', icon: <Settings size={16} /> },
    { id: 'users', label: 'Users & Roles', icon: <Shield size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#E5E0D8] flex flex-col justify-between shrink-0">
        <div>
          <div className="px-6 py-5 border-b border-[#E5E0D8]">
            <Link to="/" className="font-serif text-xl font-bold text-[#141413] block">
              AMAAN ESTATE
            </Link>
            <p className="text-xs text-[#5C5A55] mt-0.5">
              {isSupabaseConfigured ? 'Supabase Live Workspace' : 'Demonstration Mode'}
            </p>
          </div>

          <nav aria-label="Admin sections" className="p-3 flex lg:flex-col gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-[#1E3A5F] text-white'
                    : 'text-[#5C5A55] hover:bg-[#EFECE6] hover:text-[#141413]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-[#E5E0D8] space-y-3">
          <div className="text-xs">
            <div className="font-semibold text-[#141413] truncate">{profile?.full_name || profile?.email}</div>
            <div className="text-[#5C5A55] capitalize">{profile?.role?.name || 'admin'}</div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E5E0D8] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-medium text-[#5C5A55]">
            Editorial Admin <span className="mx-1.5">/</span>{' '}
            <strong className="text-[#141413] capitalize">{activeTab.replace('-', ' ')}</strong>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3.5 py-2 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <ExternalLink size={13} />
              <span>View Publication</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setEditingArticle(null);
                setEditorOpen(true);
              }}
              className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus size={14} />
              <span>New Article</span>
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl w-full">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { label: 'Total Articles', value: metrics.totalArticles },
                  { label: 'Published', value: metrics.publishedArticles },
                  { label: 'Drafts', value: metrics.draftArticles },
                  { label: 'Scheduled', value: metrics.scheduledArticles },
                  { label: 'Categories', value: metrics.totalCategories },
                  { label: 'Subscribers', value: metrics.totalSubscribers },
                  { label: 'Unread Msgs', value: metrics.unreadMessages },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-[#E5E0D8] rounded p-4 space-y-1">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
                      {stat.label}
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#141413] tabular-nums">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Publishing Activity */}
              <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
                  <h2 className="text-lg font-serif font-semibold text-[#141413]">
                    Recent Publishing Activity
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                  >
                    Manage All Articles &rarr;
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-xs uppercase tracking-wider text-[#5C5A55]">
                      <tr>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Views</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {articles.slice(0, 8).map((art) => (
                        <tr key={art.id} className="hover:bg-[#FAF8F5]/70">
                          <td className="px-5 py-3 font-medium text-[#141413] max-w-md truncate">
                            {art.title}
                          </td>
                          <td className="px-4 py-3 text-xs text-[#5C5A55]">
                            {art.category?.name || 'Uncategorized'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs font-semibold capitalize ${
                                art.status === 'published'
                                  ? 'text-[#14532D]'
                                  : art.status === 'scheduled'
                                  ? 'text-[#9A3412]'
                                  : 'text-[#5C5A55]'
                              }`}
                            >
                              {art.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-[#5C5A55]">
                            {art.view_count}
                          </td>
                          <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingArticle(art);
                                setEditorOpen(true);
                              }}
                              className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickToggleStatus(art)}
                              className="text-xs font-semibold text-[#8C4A27] hover:underline cursor-pointer"
                            >
                              {art.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ARTICLES MANAGEMENT */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="bg-white border border-[#E5E0D8] rounded p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <input
                  type="search"
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Search articles by title, slug, or author..."
                  className="h-10 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm flex-1"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={articleStatusFilter}
                    onChange={(e) => setArticleStatusFilter(e.target.value)}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                  <select
                    value={articleCategoryFilter}
                    onChange={(e) => setArticleCategoryFilter(e.target.value)}
                    className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white border border-[#E5E0D8] rounded overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-xs uppercase tracking-wider text-[#5C5A55]">
                    <tr>
                      <th className="px-5 py-3">Article</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Featured</th>
                      <th className="px-4 py-3 text-right">Views</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-[#FAF8F5]/60">
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-medium text-[#141413] truncate">{art.title}</div>
                          <div className="text-xs font-mono text-[#7A7770] truncate">/{art.slug}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5C5A55] whitespace-nowrap">
                          {art.category?.name}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-[#5C5A55] whitespace-nowrap">
                          {art.author?.name}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold capitalize ${
                              art.status === 'published'
                                ? 'text-[#14532D]'
                                : art.status === 'scheduled'
                                ? 'text-[#9A3412]'
                                : 'text-[#5C5A55]'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleFeatured(art)}
                            title="Toggle featured"
                            className={`p-1.5 rounded cursor-pointer ${
                              art.is_featured ? 'text-[#8C4A27]' : 'text-[#B5B0A6] hover:text-[#141413]'
                            }`}
                          >
                            <Star size={15} fill={art.is_featured ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-[#5C5A55]">
                          {art.view_count}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingArticle(art);
                                setEditorOpen(true);
                              }}
                              className="p-1.5 text-[#1E3A5F] hover:bg-[#EFECE6] rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickToggleStatus(art)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#EFECE6] hover:bg-[#E5E0D8] rounded cursor-pointer"
                            >
                              {art.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form onSubmit={handleSaveCategory} className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141413]">
                  {catForm.id ? 'Edit Category' : 'Create Category'}
                </h2>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Name</label>
                  <input
                    type="text"
                    required
                    value={catForm.name || ''}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Slug</label>
                    <input
                      type="text"
                      required
                      value={catForm.slug || ''}
                      onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Display Order</label>
                    <input
                      type="number"
                      value={catForm.display_order || 1}
                      onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm tabular-nums"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Description</label>
                  <textarea
                    rows={3}
                    value={catForm.description || ''}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Category Cover Image URL</label>
                  <input
                    type="text"
                    value={catForm.image_url || ''}
                    onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">SEO Title</label>
                  <input
                    type="text"
                    value={catForm.seo_title || ''}
                    onChange={(e) => setCatForm({ ...catForm, seo_title: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                  >
                    {catForm.id ? 'Update Category' : 'Add Category'}
                  </button>
                  {catForm.id && (
                    <button
                      type="button"
                      onClick={() => setCatForm({ name: '', slug: '', description: '', image_url: '', display_order: categories.length + 1 })}
                      className="px-4 py-2 bg-[#EFECE6] text-xs font-semibold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={resolveEditorialImage(cat.image_url, 'hero-pavilion')}
                        alt={cat.name}
                        className="w-16 h-12 object-cover rounded bg-[#EBE6DF] shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-sm text-[#141413]">
                          {cat.display_order}. {cat.name}{' '}
                          <span className="text-xs font-mono text-[#7A7770]">/{cat.slug}</span>
                        </div>
                        <p className="text-xs text-[#5C5A55] mt-1 line-clamp-2">{cat.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCatForm(cat)}
                        className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await deleteCategory(cat.id);
                          if (res.success) {
                            toast.success('Category deleted.');
                            loadAllData();
                          } else {
                            toast.error(res.error || 'Cannot delete category.');
                          }
                        }}
                        className="text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUTHORS MANAGEMENT */}
          {activeTab === 'authors' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <form onSubmit={handleSaveAuthor} className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
                <h2 className="text-lg font-serif font-semibold text-[#141413]">
                  {authorForm.id ? 'Edit Author' : 'Add Editorial Author'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Name</label>
                    <input
                      type="text"
                      required
                      value={authorForm.name || ''}
                      onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Slug</label>
                    <input
                      type="text"
                      required
                      value={authorForm.slug || ''}
                      onChange={(e) => setAuthorForm({ ...authorForm, slug: e.target.value })}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Title / Role</label>
                  <input
                    type="text"
                    value={authorForm.title || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, title: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Email</label>
                  <input
                    type="email"
                    value={authorForm.email || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, email: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Biography</label>
                  <textarea
                    rows={3}
                    value={authorForm.bio || ''}
                    onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                  >
                    {authorForm.id ? 'Update Author' : 'Save Author'}
                  </button>
                  {authorForm.id && (
                    <button
                      type="button"
                      onClick={() => setAuthorForm({ name: '', slug: '', title: '', bio: '', avatar_url: 'author-portrait', email: '', active: true })}
                      className="px-4 py-2 bg-[#EFECE6] text-xs font-semibold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
                {authors.map((auth) => (
                  <div key={auth.id} className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={resolveEditorialImage(auth.avatar_url, 'author-portrait')}
                        alt={auth.name}
                        className="w-11 h-11 rounded-full object-cover bg-[#EBE6DF] shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-sm text-[#141413]">{auth.name}</div>
                        <div className="text-xs text-[#8C4A27] font-medium">{auth.title}</div>
                        <p className="text-xs text-[#5C5A55] mt-1">{auth.bio}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthorForm(auth)}
                      className="text-xs font-semibold text-[#1E3A5F] hover:underline shrink-0 cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5E0D8] rounded p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-semibold text-[#141413]">
                    Editorial Media &amp; Supabase Storage
                  </h2>
                  <p className="text-xs text-[#5C5A55]">
                    Upload high-resolution photography to the <code className="font-mono">editorial-media</code> bucket.
                  </p>
                </div>
                <label className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer">
                  <Upload size={14} />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <div key={item.id} className="bg-white border border-[#E5E0D8] rounded overflow-hidden flex flex-col">
                    <div className="aspect-[16/10] bg-[#EBE6DF] overflow-hidden">
                      <img
                        src={resolveEditorialImage(item.public_url)}
                        alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-sm font-semibold text-[#141413] truncate">{item.file_name}</div>
                        <div className="text-xs font-mono text-[#7A7770] tabular-nums">
                          {Math.round(item.size_bytes / 1024)} KB · {item.mime_type}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.public_url);
                            toast.success('Media URL copied.');
                          }}
                          className="text-xs font-semibold text-[#1E3A5F] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={12} /> Copy URL
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteMediaItem(item);
                            toast.success('Media removed.');
                            loadAllData();
                          }}
                          className="text-xs font-semibold text-[#991B1B] cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'newsletter' && (
            <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-serif font-semibold text-[#141413]">Newsletter Subscribers</h2>
                  <p className="text-xs text-[#5C5A55] tabular-nums">
                    {subscribers.filter((s) => s.status === 'subscribed').length} active subscribers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportSubscribersCsv}
                  className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-xs uppercase tracking-wider text-[#5C5A55]">
                    <tr>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-5 py-3 font-medium">{sub.email}</td>
                        <td className="px-4 py-3 text-xs text-[#5C5A55]">{sub.source}</td>
                        <td className="px-4 py-3 text-xs font-semibold capitalize">
                          <span className={sub.status === 'subscribed' ? 'text-[#14532D]' : 'text-[#5C5A55]'}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono tabular-nums text-[#5C5A55]">
                          {sub.created_at.split('T')[0]}
                        </td>
                        <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={async () => {
                              await updateSubscriberStatus(
                                sub.id,
                                sub.status === 'subscribed' ? 'unsubscribed' : 'subscribed'
                              );
                              loadAllData();
                            }}
                            className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                          >
                            {sub.status === 'subscribed' ? 'Unsubscribe' : 'Reactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteSubscriber(sub.id);
                              loadAllData();
                            }}
                            className="text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTACT MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
              {messages.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#5C5A55]">No contact submissions yet.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-[#141413]">{msg.subject}</h3>
                        <p className="text-xs text-[#5C5A55]">
                          From <strong className="text-[#141413]">{msg.name}</strong> ({msg.email}) ·{' '}
                          <span className="font-mono tabular-nums">{msg.created_at.split('T')[0]}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={msg.status}
                          onChange={async (e) => {
                            await updateContactMessage(msg.id, {
                              status: e.target.value as ContactMessageStatus,
                            });
                            loadAllData();
                          }}
                          className="h-8 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteContactMessage(msg.id);
                            loadAllData();
                          }}
                          className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-[#292825] bg-[#FAF8F5] p-3.5 rounded border border-[#E5E0D8]">
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SEO & SITE SETTINGS */}
          {activeTab === 'settings' && siteSettings && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-6 max-w-3xl">
              <h2 className="text-xl font-serif font-semibold text-[#141413]">
                Publication, SEO &amp; AdSense Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Site Name</label>
                  <input
                    type="text"
                    value={siteSettings.site_name}
                    onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Primary Domain</label>
                  <input
                    type="text"
                    value={siteSettings.domain}
                    onChange={(e) => setSiteSettings({ ...siteSettings, domain: e.target.value })}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Tagline</label>
                <input
                  type="text"
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Default SEO Title</label>
                <input
                  type="text"
                  value={siteSettings.default_seo_title}
                  onChange={(e) => setSiteSettings({ ...siteSettings, default_seo_title: e.target.value })}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Default SEO Description</label>
                <textarea
                  rows={2}
                  value={siteSettings.default_seo_description}
                  onChange={(e) => setSiteSettings({ ...siteSettings, default_seo_description: e.target.value })}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E0D8] space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  Google AdSense Integration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">AdSense Publisher Client ID</label>
                    <input
                      type="text"
                      value={siteSettings.adsense_client_id || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, adsense_client_id: e.target.value })}
                      placeholder="ca-pub-xxxxxxxxxxxxxxxx"
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 text-sm pt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.adsense_enabled}
                      onChange={(e) => setSiteSettings({ ...siteSettings, adsense_enabled: e.target.checked })}
                      className="w-4 h-4 accent-[#1E3A5F]"
                    />
                    <span>Enable AdSense Display Slots</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={14} /> Save Settings
              </button>
            </form>
          )}

          {/* USERS & ROLES */}
          {activeTab === 'users' && (
            <div className="bg-white border border-[#E5E0D8] rounded overflow-x-auto">
              <div className="px-5 py-4 border-b border-[#E5E0D8]">
                <h2 className="text-lg font-serif font-semibold text-[#141413]">Users &amp; Role Permissions</h2>
                <p className="text-xs text-[#5C5A55]">
                  Assign role-based permissions enforced by PostgreSQL Row Level Security.
                </p>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-xs uppercase tracking-wider text-[#5C5A55]">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Assigned Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8]">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-5 py-3 font-medium">{u.full_name || 'Unnamed Account'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-[#5C5A55]">{u.email}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role_id || ''}
                          onChange={async (e) => {
                            const res = await updateUserRole(u.id, e.target.value);
                            if (res.success) {
                              toast.success('Role updated.');
                              loadAllData();
                            } else {
                              toast.error(res.error || 'Failed to update role.');
                            }
                          }}
                          className="h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold capitalize"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Article Composer Modal */}
      {editorOpen && (
        <ArticleEditorModal
          article={editingArticle}
          categories={categories}
          authors={authors}
          tags={tags}
          media={media}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            loadAllData();
          }}
          onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
          onTagAdded={(tag) => setTags((prev) => [...prev, tag])}
        />
      )}
    </div>
  );
}
