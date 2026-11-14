import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  ChevronDown,
  ExternalLink,
  EyeOff,
  FilePlus2,
  FolderTree,
  Globe,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  ShieldCheck,
  Tags as TagsIcon,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import {
  Article,
  Author,
  Category,
  ContactMessage,
  DashboardMetrics,
  MediaItem,
  NewsletterSubscriber,
  Profile,
  Property,
  PropertyEnquiry,
  Role,
  SiteSettings,
  Tag,
} from '../../types';
import {
  getAdminArticles,
  getAdminAuthors,
  getAdminCategories,
  getContactMessages,
  getCurrentAdminProfile,
  getCurrentUserProfile,
  getDashboardMetrics,
  getMediaLibrary,
  getSubscribers,
  getTags,
  getUsersAndRoles,
  signOutAdmin,
} from '../../services/adminService';
import { getSiteSettings } from '../../services/editorialService';
import { getAdminEnquiries, getAdminProperties } from '../../services/propertyService';
import { supabase } from '../../lib/supabase';
import { resolveEditorialImage } from '../../lib/editorialImages';
import {
  clearInternalTrafficMarker,
  enableInternalTrafficMarker,
  INTERNAL_TRAFFIC_EVENT,
  isInternalTrafficMarked,
  syncInternalTrafficWithProfile,
} from '../../lib/internalTraffic';
import { useSEO } from '../../hooks/useSEO';
import BrandLogo from '../../components/layout/BrandLogo';
import AdminOverviewSection from '../../components/admin/AdminOverviewSection';
import AdminArticlesSection from '../../components/admin/AdminArticlesSection';
import ArticleEditorView from '../../components/admin/ArticleEditorView';
import AdminPropertiesSection from '../../components/admin/AdminPropertiesSection';
import AdminEnquiriesSection from '../../components/admin/AdminEnquiriesSection';
import {
  AuthorsSection,
  CategoriesSection,
  TagsSection,
} from '../../components/admin/AdminTaxonomiesSection';
import AdminMediaSection from '../../components/admin/AdminMediaSection';
import {
  MessagesSection,
  SubscribersSection,
} from '../../components/admin/AdminAudienceSection';
import {
  EditorialSettingsSection,
  MyAccountSection,
  SeoSettingsSection,
} from '../../components/admin/AdminSettingsSection';
import SeoDashboardSection from '../../components/admin/SeoDashboardSection';
import ArticlePreviewModal from '../../components/admin/ArticlePreviewModal';
import { toast } from 'sonner';

type AdminTab =
  | 'overview'
  | 'articles'
  | 'create-article'
  | 'properties'
  | 'enquiries'
  | 'categories'
  | 'tags'
  | 'authors'
  | 'media'
  | 'subscribers'
  | 'messages'
  | 'seo-dashboard'
  | 'seo-settings'
  | 'editorial-settings'
  | 'account';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initialSection =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('section') === 'account'
      ? 'account'
      : 'overview';
  const [activeTab, setActiveTab] = useState<AdminTab>(initialSection);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [internalMarkerActive, setInternalMarkerActive] = useState(() => isInternalTrafficMarked());

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    scheduledArticles: 0,
    totalCategories: 0,
    totalAuthors: 0,
    totalSubscribers: 0,
    totalViews: 0,
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyEnquiries, setPropertyEnquiries] = useState<PropertyEnquiry[]>([]);
  const [marketplaceSchemaPending, setMarketplaceSchemaPending] = useState(false);

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editorInstanceKey, setEditorInstanceKey] = useState(0);
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  useSEO({
    title: 'Editorial CMS Dashboard',
    description: 'AMAAN ESTATE editorial content and property marketplace workspace.',
    noIndex: true,
  });

  const loadAllData = useCallback(async () => {
    setLoadError(null);
    try {
      const [m, arts, cats, auths, tgs, med, subs, msgs, setts, usersData, propsRes, enqRes] =
        await Promise.all([
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
          getAdminProperties().catch(() => ({ properties: [], schemaPending: true })),
          getAdminEnquiries().catch(() => ({ enquiries: [], schemaPending: true })),
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
      setProperties(propsRes.properties);
      setPropertyEnquiries(enqRes.enquiries);
      setMarketplaceSchemaPending(propsRes.schemaPending || enqRes.schemaPending);
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to synchronize editorial data from Supabase.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function verifySession() {
      const userProf = await getCurrentUserProfile();
      if (!active) return;
      if (!userProf) {
        navigate('/login', { replace: true });
        return;
      }
      const roleName = userProf.role?.name;
      if (roleName !== 'admin' && roleName !== 'editor') {
        toast.error('Access denied. Administrator or Editor permissions are required.');
        navigate('/account', { replace: true });
        return;
      }
      setProfile(userProf);
      syncInternalTrafficWithProfile(userProf);
      setInternalMarkerActive(isInternalTrafficMarked());
      setCheckingAuth(false);
      await loadAllData();
    }
    verifySession();

    const syncMarkerState = () => setInternalMarkerActive(isInternalTrafficMarked());
    window.addEventListener(INTERNAL_TRAFFIC_EVENT, syncMarkerState);

    const authListener = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        setActiveTab('account');
      }
    });

    return () => {
      active = false;
      window.removeEventListener(INTERNAL_TRAFFIC_EVENT, syncMarkerState);
      authListener?.data.subscription.unsubscribe();
    };
  }, [navigate, loadAllData]);

  const handleToggleInternalTraffic = () => {
    setAccountMenuOpen(false);
    if (internalMarkerActive) {
      clearInternalTrafficMarker();
      setInternalMarkerActive(false);
      toast.success('Internal traffic marker cleared. Open a public route (e.g. /) or reload to test as a normal visitor.');
    } else {
      enableInternalTrafficMarker({ force: true });
      setInternalMarkerActive(true);
      toast.success('This browser is now marked as internal traffic (traffic_type = "internal").');
    }
  };

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await signOutAdmin();
    navigate('/login', { replace: true });
  };

  const openCreateArticle = () => {
    setEditingArticle(null);
    setEditorInstanceKey((k) => k + 1);
    setActiveTab('create-article');
    setMobileMenuOpen(false);
  };

  const openEditArticle = (art: Article) => {
    setEditingArticle(art);
    setEditorInstanceKey((k) => k + 1);
    setActiveTab('create-article');
    setMobileMenuOpen(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-sm text-[#5C5A55]">
        Verifying editorial session and role permissions...
      </div>
    );
  }

  const isAdmin = profile?.role?.name === 'admin';

  const newEnquiriesCount = propertyEnquiries.filter((e) => e.status === 'new').length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'properties', label: 'Properties', icon: <Building2 size={16} />, count: properties.length || undefined },
    {
      id: 'enquiries',
      label: 'Property Enquiries',
      icon: <Inbox size={16} />,
      count: newEnquiriesCount > 0 ? newEnquiriesCount : undefined,
    },
    { id: 'articles', label: 'Articles', icon: <BookOpen size={16} /> },
    { id: 'create-article', label: 'Create New Article', icon: <FilePlus2 size={16} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={16} /> },
    { id: 'tags', label: 'Tags', icon: <TagsIcon size={16} /> },
    { id: 'authors', label: 'Authors', icon: <Users size={16} /> },
    { id: 'media', label: 'Media Library', icon: <ImageIcon size={16} /> },
    { id: 'subscribers', label: 'Newsletter Subscribers', icon: <Mail size={16} /> },
    {
      id: 'messages',
      label: 'Contact Messages',
      icon: <MessageSquare size={16} />,
      count: metrics.unreadMessages > 0 ? metrics.unreadMessages : undefined,
    },
    { id: 'seo-dashboard', label: 'SEO Intelligence', icon: <LineChart size={16} /> },
    ...(isAdmin
      ? [
          { id: 'seo-settings' as AdminTab, label: 'SEO & Website Settings', icon: <Globe size={16} /> },
          { id: 'editorial-settings' as AdminTab, label: 'Editorial Settings', icon: <Settings size={16} /> },
        ]
      : []),
    { id: 'account', label: 'My Account', icon: <UserCircle size={16} /> },
  ];

  const activeNavLabel =
    activeTab === 'create-article' && editingArticle
      ? 'Edit Article'
      : navItems.find((item) => item.id === activeTab)?.label || 'Overview';

  const handleSelectNav = (id: AdminTab) => {
    if (id === 'create-article') {
      openCreateArticle();
      return;
    }
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const renderSidebarNav = (collapsed: boolean) => (
    <nav aria-label="Editorial CMS navigation" className="p-2.5 space-y-1 flex-1 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={collapsed ? item.label : undefined}
            onClick={() => handleSelectNav(item.id)}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center px-2' : 'justify-between px-3'
            } py-2.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4A4843] hover:bg-[#EFECE6] hover:text-[#141413]'
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </span>
            {!collapsed && item.count !== undefined && (
              <span
                className={`text-[11px] font-mono tabular-nums ${
                  isActive ? 'text-white/90' : 'text-[#8C4A27]'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] flex">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-[#E5E0D8] shrink-0 transition-all duration-200 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className={`px-4 py-5 border-b border-[#E5E0D8] flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <Link to="/" className="inline-block">
                <BrandLogo variant="admin" />
              </Link>
              <p className="text-[11px] uppercase tracking-widest text-[#8C4A27] font-semibold mt-1">
                Editorial CMS
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 text-[#5C5A55] hover:text-[#141413] hover:bg-[#EFECE6] rounded cursor-pointer"
          >
            {sidebarCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {renderSidebarNav(sidebarCollapsed)}

        <div className="p-3 border-t border-[#E5E0D8]">
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="w-full flex items-center justify-center py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-[#141413] cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-white border-r border-[#E5E0D8] flex flex-col z-10 h-full">
            <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
              <div>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="inline-block">
                  <BrandLogo variant="admin" />
                </Link>
                <div className="text-[11px] uppercase tracking-widest text-[#8C4A27] font-semibold mt-1">
                  Editorial CMS
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 text-[#5C5A55] hover:text-[#141413] rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {renderSidebarNav(false)}
            <div className="p-4 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#EFECE6] rounded text-xs font-semibold text-[#141413] cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-[#E5E0D8] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation drawer"
              className="lg:hidden p-2 text-[#141413] hover:bg-[#EFECE6] rounded cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div className="text-xs sm:text-sm text-[#5C5A55] truncate">
              <span className="hidden sm:inline">AMAAN ESTATE CMS / </span>
              <strong className="text-[#141413] font-semibold">{activeNavLabel}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-3 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] items-center gap-1.5 whitespace-nowrap"
            >
              <ExternalLink size={13} />
              <span>View Site</span>
            </Link>

            {activeTab !== 'create-article' && (
              <button
                type="button"
                onClick={openCreateArticle}
                className="px-3.5 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New Article</span>
                <span className="sm:hidden">New</span>
              </button>
            )}

            {/* Account Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((o) => !o)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded hover:bg-[#FAF8F5] border border-transparent hover:border-[#E5E0D8] cursor-pointer"
              >
                <img
                  src={resolveEditorialImage(profile?.avatar_url, 'author-portrait')}
                  alt={profile?.full_name || profile?.email || 'Admin'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover bg-[#EBE6DF]"
                />
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-semibold text-[#141413] max-w-[140px] truncate">
                    {profile?.full_name || profile?.email}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#8C4A27] font-semibold">
                    {profile?.role?.name || 'admin'}
                  </div>
                </div>
                <ChevronDown size={13} className="text-[#5C5A55]" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E0D8] rounded shadow-lg py-1.5 z-40">
                  <div className="px-4 py-2 border-b border-[#E5E0D8]">
                    <div className="text-xs font-semibold text-[#141413] truncate">
                      {profile?.full_name || 'Editorial Administrator'}
                    </div>
                    <div className="text-[11px] font-mono text-[#7A7770] truncate">
                      {profile?.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      setActiveTab('account');
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#141413] hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <UserCircle size={14} /> My Account &amp; Password
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleInternalTraffic}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#141413] hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer border-t border-[#F0ECE4]"
                  >
                    {internalMarkerActive ? (
                      <>
                        <EyeOff size={14} className="text-[#8C4A27] shrink-0" />
                        <span>Clear Internal Marker (Public Test)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} className="text-[#1E3A5F] shrink-0" />
                        <span>Mark Browser as Internal Traffic</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#991B1B] hover:bg-[#FEF2F2] flex items-center gap-2 cursor-pointer border-t border-[#F0ECE4]"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {loadError && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] rounded px-4 py-3 text-xs flex items-center justify-between gap-4">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={loadAllData}
                className="font-semibold underline cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {loadingData ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-[#E5E0D8] rounded p-5 h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <AdminOverviewSection
                  metrics={metrics}
                  articles={articles}
                  categories={categories}
                  messages={messages}
                  onCreateArticle={openCreateArticle}
                  onEditArticle={openEditArticle}
                  onPreviewArticle={(art) => setPreviewArticle(art)}
                  onOpenTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'articles' && (
                <AdminArticlesSection
                  articles={articles}
                  categories={categories}
                  onCreateArticle={openCreateArticle}
                  onEditArticle={openEditArticle}
                  onPreviewArticle={(art) => setPreviewArticle(art)}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'properties' && (
                <AdminPropertiesSection
                  properties={properties}
                  schemaPending={marketplaceSchemaPending}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'enquiries' && (
                <AdminEnquiriesSection
                  enquiries={propertyEnquiries}
                  schemaPending={marketplaceSchemaPending}
                  canDelete={isAdmin}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'create-article' && (
                <ArticleEditorView
                  key={editorInstanceKey}
                  article={editingArticle}
                  allArticles={articles}
                  properties={properties}
                  categories={categories}
                  authors={authors}
                  tags={tags}
                  media={media}
                  onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
                  onTagAdded={(tag) =>
                    setTags((prev) =>
                      prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]
                    )
                  }
                  onBack={() => setActiveTab('articles')}
                  onSaved={async () => {
                    await loadAllData();
                    setActiveTab('articles');
                  }}
                />
              )}

              {activeTab === 'categories' && (
                <CategoriesSection
                  categories={categories}
                  articles={articles}
                  media={media}
                  onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'tags' && (
                <TagsSection tags={tags} articles={articles} onRefresh={loadAllData} />
              )}

              {activeTab === 'authors' && (
                <AuthorsSection
                  authors={authors}
                  articles={articles}
                  media={media}
                  onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'media' && (
                <AdminMediaSection media={media} onRefresh={loadAllData} />
              )}

              {activeTab === 'subscribers' && (
                <SubscribersSection
                  subscribers={subscribers}
                  canDelete={isAdmin}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'messages' && (
                <MessagesSection
                  messages={messages}
                  canDelete={isAdmin}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'seo-dashboard' && (
                <SeoDashboardSection
                  articles={articles}
                  properties={properties}
                  categories={categories}
                  onEditArticle={openEditArticle}
                />
              )}

              {activeTab === 'seo-settings' && isAdmin && (
                <SeoSettingsSection
                  siteSettings={siteSettings}
                  media={media}
                  onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'editorial-settings' && isAdmin && (
                <EditorialSettingsSection
                  siteSettings={siteSettings}
                  users={users}
                  roles={roles}
                  currentProfile={profile}
                  onRefresh={loadAllData}
                />
              )}

              {activeTab === 'account' && (
                <MyAccountSection
                  profile={profile}
                  media={media}
                  onMediaAdded={(item) => setMedia((prev) => [item, ...prev])}
                  onRefresh={async () => {
                    const updated = await getCurrentAdminProfile();
                    if (updated) setProfile(updated);
                    await loadAllData();
                  }}
                  onSignOut={handleSignOut}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Article Preview Modal */}
      {previewArticle && (
        <ArticlePreviewModal
          open={Boolean(previewArticle)}
          onClose={() => setPreviewArticle(null)}
          article={{
            ...previewArticle,
            featured_image_alt:
              media.find((m) => m.public_url === previewArticle.featured_image)?.alt_text || '',
          }}
        />
      )}
    </div>
  );
}
