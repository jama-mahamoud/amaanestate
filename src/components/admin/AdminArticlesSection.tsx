import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Eye, Plus, Search, Star, Trash2 } from 'lucide-react';
import { Article, Category } from '../../types';
import { deleteArticle, upsertArticle } from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

interface AdminArticlesSectionProps {
  articles: Article[];
  categories: Category[];
  onCreateArticle: () => void;
  onEditArticle: (article: Article) => void;
  onPreviewArticle: (article: Article) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 10;

export default function AdminArticlesSection({
  articles,
  categories,
  onCreateArticle,
  onEditArticle,
  onPreviewArticle,
  onRefresh,
}: AdminArticlesSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || a.category_id === categoryFilter;
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.author?.name || '').toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSetStatus = async (art: Article, nextStatus: 'published' | 'draft') => {
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
      published_at:
        nextStatus === 'published' ? art.published_at || new Date().toISOString() : art.published_at,
      scheduled_for: art.scheduled_for,
      tagIds: art.tags?.map((t) => t.id) || [],
    });

    if (res.success) {
      toast.success(nextStatus === 'published' ? 'Article published.' : 'Article moved to draft.');
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to update status.');
    }
  };

  const handleToggleFeatured = async (art: Article) => {
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
      scheduled_for: art.scheduled_for,
      tagIds: art.tags?.map((t) => t.id) || [],
    });

    if (res.success) {
      toast.success(!art.is_featured ? 'Marked as featured story.' : 'Removed from featured.');
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to update featured flag.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteArticle(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (ok) {
      toast.success('Article deleted permanently.');
      onRefresh();
    } else {
      toast.error('Unable to delete article.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Filters */}
      <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#141413]">Editorial Articles</h1>
            <p className="text-xs text-[#5C5A55] tabular-nums">
              {filtered.length} matching {filtered.length === 1 ? 'article' : 'articles'} ·{' '}
              {articles.filter((a) => a.status === 'published').length} published live
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateArticle}
            className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={14} />
            <span>Create New Article</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by headline, slug, or author..."
              className="w-full h-10 pl-10 pr-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'published' | 'draft' | 'scheduled');
              setPage(1);
            }}
            className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        {pageItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-[#5C5A55]">
              {articles.length === 0
                ? 'No articles have been created in Supabase yet.'
                : 'No articles match the active search or filters.'}
            </p>
            <button
              type="button"
              onClick={onCreateArticle}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Write First Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
                <tr>
                  <th className="px-5 py-3">Article</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E0D8]">
                {pageItems.map((art) => (
                  <tr key={art.id} className="hover:bg-[#FAF8F5]/70">
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-11 rounded bg-[#EBE6DF] overflow-hidden shrink-0">
                          {art.featured_image ? (
                            <img
                              src={resolveEditorialImage(art.featured_image)}
                              alt={art.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(art)}
                              title={art.is_featured ? 'Featured story' : 'Mark as featured'}
                              className={`shrink-0 cursor-pointer ${
                                art.is_featured ? 'text-[#8C4A27]' : 'text-[#CFC8BC] hover:text-[#141413]'
                              }`}
                            >
                              <Star size={13} fill={art.is_featured ? 'currentColor' : 'none'} />
                            </button>
                            <span className="font-medium text-[#141413] truncate">{art.title}</span>
                          </div>
                          <div className="text-xs font-mono text-[#7A7770] truncate">/articles/{art.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#5C5A55] whitespace-nowrap">
                      {art.category?.name || 'Uncategorized'}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-[#5C5A55] whitespace-nowrap">
                      {art.author?.name || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold capitalize ${
                          art.status === 'published'
                            ? 'text-[#14532D]'
                            : art.status === 'scheduled'
                            ? 'text-[#8C4A27]'
                            : 'text-[#5C5A55]'
                        }`}
                      >
                        {art.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono tabular-nums text-[#5C5A55] whitespace-nowrap">
                      {art.published_at ? art.published_at.split('T')[0] : '—'}
                    </td>

                    <td className="px-4 py-3.5 text-right text-xs font-mono tabular-nums text-[#141413]">
                      {Number(art.view_count || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5 text-xs font-mono tabular-nums text-[#7A7770] whitespace-nowrap">
                      {(art.updated_at || art.created_at).split('T')[0]}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditArticle(art)}
                          title="Edit"
                          className="p-1.5 text-[#1E3A5F] hover:bg-[#EFECE6] rounded cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPreviewArticle(art)}
                          title="Preview"
                          className="p-1.5 text-[#5C5A55] hover:bg-[#EFECE6] rounded cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatus(art, art.status === 'published' ? 'draft' : 'published')}
                          className="px-2.5 py-1 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
                        >
                          {art.status === 'published' ? 'Move to Draft' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(art)}
                          title="Delete"
                          className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#5C5A55]">
            <span className="tabular-nums">
              Page {safePage} of {totalPages} ({filtered.length} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1.5 bg-white border border-[#D6CEBE] rounded disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1.5 bg-white border border-[#D6CEBE] rounded disabled:opacity-40 inline-flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Editorial Article"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title || ''}"? This action removes the article and its tag links from Supabase.`}
        confirmLabel="Delete Article"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
