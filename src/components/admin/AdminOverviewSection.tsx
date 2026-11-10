import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BookOpen, Edit3, Eye, Plus } from 'lucide-react';
import { Article, Category, ContactMessage, DashboardMetrics } from '../../types';

interface AdminOverviewSectionProps {
  metrics: DashboardMetrics;
  articles: Article[];
  categories: Category[];
  messages: ContactMessage[];
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
  onPreviewArticle: (article: Article) => void;
  onOpenTab: (tab: 'articles' | 'messages') => void;
}

export default function AdminOverviewSection({
  metrics,
  articles,
  categories,
  messages,
  onCreateArticle,
  onEditArticle,
  onPreviewArticle,
  onOpenTab,
}: AdminOverviewSectionProps) {
  const statCards = [
    { label: 'Total Articles', value: metrics.totalArticles },
    { label: 'Published Articles', value: metrics.publishedArticles },
    { label: 'Draft Articles', value: metrics.draftArticles },
    { label: 'Scheduled Articles', value: metrics.scheduledArticles },
    { label: 'Total Categories', value: metrics.totalCategories },
    { label: 'Total Authors', value: metrics.totalAuthors },
    { label: 'Newsletter Subscribers', value: metrics.totalSubscribers },
    { label: 'Total Article Views', value: metrics.totalViews },
  ];

  const categoryChartData = categories.map((cat) => {
    const catArticles = articles.filter((a) => a.category_id === cat.id);
    return {
      name: cat.name,
      articles: catArticles.length,
      views: catArticles.reduce((sum, a) => sum + (Number(a.view_count) || 0), 0),
    };
  });

  const statusChartData = [
    { name: 'Published', count: metrics.publishedArticles, color: '#1E3A5F' },
    { name: 'Draft', count: metrics.draftArticles, color: '#8C4A27' },
    { name: 'Scheduled', count: metrics.scheduledArticles, color: '#5C5A55' },
  ];

  const recentlyPublished = [...articles]
    .filter((a) => a.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    )
    .slice(0, 5);

  const recentlyUpdated = [...articles]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime()
    )
    .slice(0, 5);

  const mostViewed = [...articles]
    .sort((a, b) => (Number(b.view_count) || 0) - (Number(a.view_count) || 0))
    .slice(0, 5);

  const recentMessages = messages.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Editorial Operations
          </p>
          <h1 className="text-2xl font-serif font-semibold text-[#141413]">
            AMAAN ESTATE Publishing Overview
          </h1>
          <p className="text-sm text-[#5C5A55]">
            Live metrics, editorial pipeline status, and audience engagement from Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateArticle}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Quick Create Article</span>
        </button>
      </div>

      {/* 8 Real Supabase Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E5E0D8] rounded p-5 space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5C5A55]">
              {stat.label}
            </div>
            <div className="text-3xl font-serif font-semibold text-[#141413] tabular-nums">
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Real Data Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#E5E0D8] pb-3">
            <div>
              <h2 className="text-base font-serif font-semibold text-[#141413]">
                Coverage &amp; Readership by Editorial Category
              </h2>
              <p className="text-xs text-[#5C5A55]">Articles published and cumulative views per section</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5C5A55' }} axisLine={{ stroke: '#E5E0D8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5C5A55' }} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E0D8',
                    fontSize: '12px',
                    borderRadius: '4px',
                  }}
                />
                <Bar dataKey="articles" name="Articles" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
                <Bar dataKey="views" name="Total Views" fill="#8C4A27" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
          <div className="border-b border-[#E5E0D8] pb-3">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Publishing Pipeline</h2>
            <p className="text-xs text-[#5C5A55]">Distribution across workflow statuses</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5C5A55' }} axisLine={{ stroke: '#E5E0D8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5C5A55' }} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E0D8',
                    fontSize: '12px',
                    borderRadius: '4px',
                  }}
                />
                <Bar dataKey="count" name="Articles" radius={[3, 3, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Published */}
        <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Recently Published Articles</h2>
            <button
              type="button"
              onClick={() => onOpenTab('articles')}
              className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
            >
              View All &rarr;
            </button>
          </div>
          {recentlyPublished.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <BookOpen size={22} className="mx-auto text-[#7A7770]" />
              <p className="text-sm text-[#5C5A55]">No published articles in Supabase yet.</p>
              <button
                type="button"
                onClick={onCreateArticle}
                className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
              >
                Create &amp; Publish First Article
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {recentlyPublished.map((art) => (
                <div key={art.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF8F5]">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#141413] truncate">{art.title}</div>
                    <div className="text-xs text-[#5C5A55] flex items-center gap-2">
                      <span>{art.category?.name || 'Uncategorized'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {(art.published_at || art.created_at).split('T')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPreviewArticle(art)}
                      className="p-1.5 text-[#5C5A55] hover:text-[#141413] cursor-pointer"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditArticle(art)}
                      className="p-1.5 text-[#1E3A5F] hover:text-[#141413] cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Updated */}
        <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Recently Updated Articles</h2>
            <button
              type="button"
              onClick={() => onOpenTab('articles')}
              className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
            >
              Manage &rarr;
            </button>
          </div>
          {recentlyUpdated.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5C5A55]">No article activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {recentlyUpdated.map((art) => (
                <div key={art.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#FAF8F5]">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#141413] truncate">{art.title}</div>
                    <div className="text-xs text-[#5C5A55] flex items-center gap-2">
                      <span className="capitalize font-medium">{art.status}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Updated {(art.updated_at || art.created_at).split('T')[0]}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditArticle(art)}
                    className="text-xs font-semibold text-[#1E3A5F] hover:underline shrink-0 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed Articles */}
        <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8]">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Most Viewed Articles</h2>
          </div>
          {mostViewed.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5C5A55]">No readership telemetry yet.</div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {mostViewed.map((art, index) => (
                <div key={art.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono tabular-nums text-[#8C4A27] w-5 shrink-0">
                      0{index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#141413] truncate">{art.title}</div>
                      <div className="text-xs text-[#5C5A55]">{art.category?.name}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono tabular-nums font-semibold text-[#141413] shrink-0">
                    {Number(art.view_count || 0).toLocaleString()} views
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contact Messages */}
        <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <h2 className="text-base font-serif font-semibold text-[#141413]">
              Recent Contact Messages ({metrics.unreadMessages} unread)
            </h2>
            <button
              type="button"
              onClick={() => onOpenTab('messages')}
              className="text-xs font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
            >
              Inbox &rarr;
            </button>
          </div>
          {recentMessages.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#5C5A55]">No contact messages received yet.</div>
          ) : (
            <div className="divide-y divide-[#E5E0D8]">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="px-5 py-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#141413] truncate">{msg.subject}</span>
                    <span
                      className={`text-xs font-semibold capitalize shrink-0 ${
                        msg.status === 'unread' ? 'text-[#8C4A27]' : 'text-[#5C5A55]'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C5A55] truncate">
                    {msg.name} ({msg.email}) · {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
