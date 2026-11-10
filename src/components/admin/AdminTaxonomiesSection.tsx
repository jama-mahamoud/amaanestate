import React, { useState } from 'react';
import { Edit3, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { Article, Author, Category, MediaItem, Tag } from '../../types';
import {
  createTag,
  deleteAuthor,
  deleteCategory,
  deleteTag,
  updateTag,
  upsertAuthor,
  upsertCategory,
} from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import MediaPickerModal from './MediaPickerModal';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

const CORE_CATEGORY_SLUGS = new Set([
  'investment',
  'architecture',
  'construction',
  'home-living',
  'news',
]);

function toSlug(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface CategoriesSectionProps {
  categories: Category[];
  articles: Article[];
  media: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => void;
}

export function CategoriesSection({
  categories,
  articles,
  media,
  onMediaAdded,
  onRefresh,
}: CategoriesSectionProps) {
  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: categories.length + 1,
    seo_title: '',
    seo_description: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () =>
    setForm({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: categories.length + 1,
      seo_title: '',
      seo_description: '',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = (form.name || '').trim();
    const cleanSlug = toSlug(form.slug || cleanName);
    if (!cleanName || !cleanSlug) {
      toast.error('Category name and slug are required.');
      return;
    }

    const duplicate = categories.find(
      (c) => c.slug.toLowerCase() === cleanSlug && c.id !== form.id
    );
    if (duplicate) {
      toast.error(`Category slug "${cleanSlug}" already exists. Edit the existing category instead.`);
      return;
    }

    setSaving(true);
    const res = await upsertCategory({
      id: form.id,
      name: cleanName,
      slug: cleanSlug,
      description: (form.description || '').trim(),
      image_url: form.image_url?.trim() || null,
      display_order: Number(form.display_order) || 1,
      seo_title: form.seo_title?.trim() || null,
      seo_description: form.seo_description?.trim() || null,
    });
    setSaving(false);

    if (res.success) {
      toast.success(form.id ? 'Category updated.' : 'Category created.');
      resetForm();
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to save category.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <div>
          <h2 className="text-lg font-serif font-semibold text-[#141413]">
            {form.id ? `Edit Category: ${form.name}` : 'Create Editorial Category'}
          </h2>
          <p className="text-xs text-[#5C5A55] mt-1">
            The 5 core publication sections (Investment, Architecture, Construction, Home &amp; Living, News) are protected against duplication.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Category Name</label>
          <input
            type="text"
            required
            value={form.name || ''}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
                slug: form.id ? form.slug : toSlug(e.target.value),
              })
            }
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">URL Slug</label>
            <input
              type="text"
              required
              disabled={Boolean(form.id && CORE_CATEGORY_SLUGS.has(form.slug || ''))}
              value={form.slug || ''}
              onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono disabled:opacity-60"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">Display Order</label>
            <input
              type="number"
              min={1}
              value={form.display_order || 1}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm tabular-nums"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Description</label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Category Cover Image</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.image_url || ''}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Select from Media Library or enter URL"
              className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-3 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <ImageIcon size={13} /> Pick
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">SEO Meta Title</label>
          <input
            type="text"
            value={form.seo_title || ''}
            onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">SEO Meta Description</label>
          <textarea
            rows={2}
            value={form.seo_description || ''}
            onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
            className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : form.id ? 'Update Category' : 'Add Category'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold rounded cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
        <div className="px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-serif font-semibold text-[#141413]">
            Active Editorial Categories ({categories.length})
          </h3>
        </div>
        {categories.map((cat) => {
          const articleCount = articles.filter((a) => a.category_id === cat.id).length;
          const isCore = CORE_CATEGORY_SLUGS.has(cat.slug);
          return (
            <div key={cat.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[#FAF8F5]/60">
              <div className="flex items-start gap-4 min-w-0">
                <img
                  src={resolveEditorialImage(cat.image_url, 'hero-pavilion')}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-12 object-cover rounded bg-[#EBE6DF] shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#141413]">
                    <span className="tabular-nums">{cat.display_order}.</span>
                    <span>{cat.name}</span>
                    <span className="text-xs font-mono font-normal text-[#7A7770]">/{cat.slug}</span>
                    {isCore && (
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C4A27]">
                        Core Section
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5C5A55] line-clamp-2">{cat.description}</p>
                  <div className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                    {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm(cat)}
                  className="p-1.5 text-[#1E3A5F] hover:bg-[#EFECE6] rounded cursor-pointer"
                  title="Edit Category"
                >
                  <Edit3 size={14} />
                </button>
                {!isCore && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MediaPickerModal
        open={pickerOpen}
        title="Select Category Cover Image"
        media={media}
        onClose={() => setPickerOpen(false)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url }) => setForm((prev) => ({ ...prev, image_url: url }))}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Category"
        description={`Delete category "${deleteTarget?.name || ''}"? Categories with assigned articles cannot be deleted.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
          if (res.success) {
            toast.success('Category deleted.');
            onRefresh();
          } else {
            toast.error(res.error || 'Cannot delete category.');
          }
        }}
      />
    </div>
  );
}

interface TagsSectionProps {
  tags: Tag[];
  articles: Article[];
  onRefresh: () => void;
}

export function TagsSection({ tags, articles, onRefresh }: TagsSectionProps) {
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const filtered = tags.filter((t) => {
    const q = search.trim().toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = await createTag(newName);
    if (created) {
      toast.success(`Tag "${created.name}" ready.`);
      setNewName('');
      onRefresh();
    } else {
      toast.error('Failed to create tag.');
    }
  };

  const handleSaveEdit = async (id: string) => {
    const res = await updateTag(id, editingName);
    if (res.success) {
      toast.success('Tag updated.');
      setEditingId(null);
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to update tag.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-[#141413]">Editorial Tags</h1>
          <p className="text-xs text-[#5C5A55]">
            Topic taxonomy linking research reports, architectural case studies, and SEO keywords.
          </p>
        </div>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New topic tag..."
            className="h-10 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm w-56"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} /> Add Tag
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        <div className="p-4 border-b border-[#E5E0D8]">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tags..."
              className="w-full h-9 pl-10 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
              <tr>
                <th className="px-5 py-3">Tag Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Articles Used</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filtered.map((tag) => {
                const count = articles.filter((a) => a.tags?.some((t) => t.id === tag.id)).length;
                const isEditing = editingId === tag.id;
                return (
                  <tr key={tag.id} className="hover:bg-[#FAF8F5]/70">
                    <td className="px-5 py-3 font-medium text-[#141413]">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8 px-2.5 bg-white border border-[#1E3A5F] rounded text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(tag.id)}
                            className="px-2.5 py-1 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-xs text-[#5C5A55] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        tag.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[#7A7770]">/{tag.slug}</td>
                    <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-[#5C5A55]">
                      {count}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditingName(tag.name);
                        }}
                        className="p-1.5 text-[#1E3A5F] hover:bg-[#EFECE6] rounded cursor-pointer"
                        title="Rename Tag"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(tag)}
                        className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        title="Delete Tag"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tag"
        description={`Delete tag "${deleteTarget?.name || ''}"? It will be unlinked from any associated articles.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteTag(deleteTarget.id);
          setDeleteTarget(null);
          if (res.success) {
            toast.success('Tag deleted.');
            onRefresh();
          } else {
            toast.error(res.error || 'Could not delete tag.');
          }
        }}
      />
    </div>
  );
}

interface AuthorsSectionProps {
  authors: Author[];
  articles: Article[];
  media: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => void;
}

export function AuthorsSection({
  authors,
  articles,
  media,
  onMediaAdded,
  onRefresh,
}: AuthorsSectionProps) {
  const [form, setForm] = useState<Partial<Author>>({
    name: '',
    slug: '',
    title: '',
    bio: '',
    avatar_url: 'author-portrait',
    email: '',
    twitter_url: '',
    linkedin_url: '',
    active: true,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () =>
    setForm({
      name: '',
      slug: '',
      title: '',
      bio: '',
      avatar_url: 'author-portrait',
      email: '',
      twitter_url: '',
      linkedin_url: '',
      active: true,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.slug?.trim()) {
      toast.error('Author name and slug are required.');
      return;
    }
    setSaving(true);
    const res = await upsertAuthor({
      id: form.id,
      name: form.name.trim(),
      slug: toSlug(form.slug),
      title: form.title?.trim() || 'Editorial Contributor',
      bio: form.bio?.trim() || '',
      avatar_url: form.avatar_url?.trim() || 'author-portrait',
      email: form.email?.trim() || null,
      twitter_url: form.twitter_url?.trim() || null,
      linkedin_url: form.linkedin_url?.trim() || null,
      active: form.active ?? true,
    });
    setSaving(false);

    if (res.success) {
      toast.success(form.id ? 'Author updated.' : 'Author added.');
      resetForm();
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to save author.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <h2 className="text-lg font-serif font-semibold text-[#141413]">
          {form.id ? `Edit Author: ${form.name}` : 'Add Editorial Author'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">Full Name</label>
            <input
              type="text"
              required
              value={form.name || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: form.id ? form.slug : toSlug(e.target.value),
                })
              }
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">Slug</label>
            <input
              type="text"
              required
              value={form.slug || ''}
              onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })}
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Role / Title</label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Senior Built-Environment Editor"
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Author Portrait</label>
          <div className="flex items-center gap-3">
            <img
              src={resolveEditorialImage(form.avatar_url, 'author-portrait')}
              alt={form.name || 'Author avatar'}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover bg-[#EBE6DF] shrink-0"
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
            >
              Choose / Upload Portrait
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Email</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Biography</label>
          <textarea
            rows={3}
            value={form.bio || ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-[#141413] cursor-pointer">
          <input
            type="checkbox"
            checked={form.active ?? true}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-[#1E3A5F]"
          />
          <span>Active Contributor (visible for article assignment)</span>
        </label>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : form.id ? 'Update Author' : 'Save Author'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 bg-[#EFECE6] text-xs font-semibold rounded cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
        <div className="px-5 py-4">
          <h3 className="text-base font-serif font-semibold text-[#141413]">
            Editorial Authors ({authors.length})
          </h3>
        </div>
        {authors.map((auth) => {
          const articleCount = articles.filter((a) => a.author_id === auth.id).length;
          return (
            <div key={auth.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[#FAF8F5]/60">
              <div className="flex items-start gap-3.5 min-w-0">
                <img
                  src={resolveEditorialImage(auth.avatar_url, 'author-portrait')}
                  alt={auth.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover bg-[#EBE6DF] shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-[#141413]">{auth.name}</span>
                    {!auth.active && (
                      <span className="text-[11px] font-semibold text-[#991B1B]">Inactive</span>
                    )}
                  </div>
                  <div className="text-xs text-[#8C4A27] font-medium">{auth.title}</div>
                  <p className="text-xs text-[#5C5A55] line-clamp-2">{auth.bio}</p>
                  <div className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                    {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm(auth)}
                  className="p-1.5 text-[#1E3A5F] hover:bg-[#EFECE6] rounded cursor-pointer"
                  title="Edit Author"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(auth)}
                  className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                  title="Delete Author"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <MediaPickerModal
        open={pickerOpen}
        title="Select Author Portrait"
        media={media}
        onClose={() => setPickerOpen(false)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url }) => setForm((prev) => ({ ...prev, avatar_url: url }))}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Author"
        description={`Delete author "${deleteTarget?.name || ''}"? Authors currently assigned to articles cannot be deleted until their articles are reassigned.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const res = await deleteAuthor(deleteTarget.id);
          setDeleteTarget(null);
          if (res.success) {
            toast.success('Author deleted.');
            onRefresh();
          } else {
            toast.error(res.error || 'Could not delete author.');
          }
        }}
      />
    </div>
  );
}
