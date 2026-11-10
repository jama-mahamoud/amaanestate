import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bold, Eye, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Upload, X } from 'lucide-react';
import { Article, ArticleStatus, Author, Category, MediaItem, Tag } from '../../types';
import { createTag, uploadMediaFile, upsertArticle } from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import { toast } from 'sonner';

interface ArticleEditorModalProps {
  article: Article | null;
  categories: Category[];
  authors: Author[];
  tags: Tag[];
  media: MediaItem[];
  onClose: () => void;
  onSaved: () => void;
  onMediaAdded: (item: MediaItem) => void;
  onTagAdded: (tag: Tag) => void;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export default function ArticleEditorModal({
  article,
  categories,
  authors,
  tags,
  media,
  onClose,
  onSaved,
  onMediaAdded,
  onTagAdded,
}: ArticleEditorModalProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [content, setContent] = useState(article?.content || '');
  const [categoryId, setCategoryId] = useState(article?.category_id || categories[0]?.id || '');
  const [authorId, setAuthorId] = useState(article?.author_id || authors[0]?.id || '');
  const [status, setStatus] = useState<ArticleStatus>(article?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(Boolean(article?.is_featured));
  const [scheduledFor, setScheduledFor] = useState(
    article?.scheduled_for ? article.scheduled_for.slice(0, 16) : ''
  );
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image || 'hero-pavilion');
  const [galleryImages, setGalleryImages] = useState<string[]>(article?.gallery_images || []);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags?.map((t) => t.id) || []
  );
  const [newTagName, setNewTagName] = useState('');
  const [seoTitle, setSeoTitle] = useState(article?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(article?.seo_description || '');
  const [ogImage, setOgImage] = useState(article?.og_image || '');
  const [readingTime, setReadingTime] = useState<number>(article?.reading_time || 5);

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryInput, setGalleryInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (!article) {
      setReadingTime(estimateReadingTime(content));
    }
  }, [content, article]);

  const insertFormatting = (prefix: string, suffix = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || 'text';
    const next = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleUploadFeatured = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadMediaFile(file, title || file.name);
    setUploading(false);
    if (res.success && res.item) {
      onMediaAdded(res.item);
      setFeaturedImage(res.item.public_url);
      toast.success('Image uploaded and assigned.');
    } else {
      toast.error(res.error || 'Image upload failed.');
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const tag = await createTag(newTagName);
    if (tag) {
      onTagAdded(tag);
      if (!selectedTagIds.includes(tag.id)) {
        setSelectedTagIds((prev) => [...prev, tag.id]);
      }
      setNewTagName('');
    }
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async (e: React.FormEvent, overrideStatus?: ArticleStatus) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !categoryId || !authorId) {
      toast.error('Title, slug, category, and author are required.');
      return;
    }
    const targetStatus = overrideStatus || status;
    if (targetStatus === 'scheduled' && !scheduledFor) {
      toast.error('Please pick a future publication date and time for scheduled articles.');
      return;
    }

    setSaving(true);
    const res = await upsertArticle({
      id: article?.id,
      title: title.trim(),
      slug: slugify(slug),
      excerpt: excerpt.trim(),
      content,
      featured_image: featuredImage.trim() || null,
      gallery_images: galleryImages,
      category_id: categoryId,
      author_id: authorId,
      status: targetStatus,
      is_featured: isFeatured,
      reading_time: Number(readingTime) || estimateReadingTime(content),
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      og_image: ogImage.trim() || featuredImage.trim() || null,
      published_at:
        targetStatus === 'published'
          ? article?.published_at || new Date().toISOString()
          : article?.published_at || null,
      scheduled_for: targetStatus === 'scheduled' ? new Date(scheduledFor).toISOString() : null,
      tagIds: selectedTagIds,
    });
    setSaving(false);

    if (res.success) {
      toast.success(article ? 'Article updated.' : 'Article created.');
      onSaved();
    } else {
      toast.error(res.error || 'Failed to save article.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E0D8] px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-xl font-serif font-semibold text-[#141413]">
              {article ? 'Edit Article' : 'Compose New Article'}
            </h2>
            <p className="text-xs text-[#5C5A55]">
              Full editorial metadata, rich prose formatting, SEO, and scheduling.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="p-2 text-[#5C5A55] hover:text-[#141413] hover:bg-[#EFECE6] rounded cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSave(e)} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Columns: Prose & Rich Editor */}
            <div className="lg:col-span-8 space-y-5 bg-white border border-[#E5E0D8] rounded p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter editorial headline..."
                  className="w-full h-11 px-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-base font-serif font-semibold text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="article-url-slug"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                    Reading Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm tabular-nums text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5C5A55] block">
                  Short Description / Excerpt
                </label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Concise editorial deck summarizing the article..."
                  className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                />
              </div>

              {/* Rich Formatting Toolbar + Write/Preview Toggle */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border border-[#E5E0D8] bg-[#FAF8F5] px-3 py-2 rounded-t">
                  <div className="flex flex-wrap items-center gap-1">
                    <button type="button" onClick={() => insertFormatting('\n## ', '\n')} title="Heading 2" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Heading2 size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('\n### ', '\n')} title="Heading 3" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Heading3 size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('**', '**')} title="Bold" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Bold size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('*', '*')} title="Italic" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Italic size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('\n> ', '\n')} title="Pull Quote" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Quote size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('\n- ', '')} title="Bullet List" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><List size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('\n1. ', '')} title="Numbered List" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><ListOrdered size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('[', '](https://amaanestate.com)')} title="Link" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><Link2 size={15} /></button>
                    <button type="button" onClick={() => insertFormatting('\n![Image caption](', ')\n')} title="Embed Image" className="p-1.5 hover:bg-white rounded text-[#141413] cursor-pointer"><ImagePlus size={15} /></button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>{previewMode ? 'Edit Prose' : 'Live Preview'}</span>
                  </button>
                </div>

                {previewMode ? (
                  <div className="min-h-[340px] p-5 border border-t-0 border-[#E5E0D8] rounded-b bg-white prose prose-stone max-w-none">
                    <ReactMarkdown>{content || '*No content entered yet.*'}</ReactMarkdown>
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    rows={14}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write full article prose (supports Markdown headings, pull quotes, lists, links, and inline images)..."
                    className="w-full p-4 bg-white border border-t-0 border-[#E5E0D8] rounded-b text-sm leading-relaxed text-[#141413] focus:outline-none focus:border-[#1E3A5F]"
                  />
                )}
              </div>

              {/* SEO Metadata */}
              <div className="pt-4 border-t border-[#E5E0D8] space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
                  SEO &amp; Social Sharing Metadata
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">SEO Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Defaults to article title"
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Social Share Image URL</label>
                    <input
                      type="text"
                      value={ogImage}
                      onChange={(e) => setOgImage(e.target.value)}
                      placeholder="Defaults to featured image"
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">SEO Meta Description</label>
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="120-160 characters summary for search engines..."
                    className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                  />
                </div>
              </div>
            </div>

            {/* Right 4 Columns: Publishing, Taxonomy & Media */}
            <div className="lg:col-span-4 space-y-5">
              {/* Publishing Controls */}
              <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#141413]">
                  Publishing Workflow
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                  >
                    <option value="draft">Draft (Hidden)</option>
                    <option value="scheduled">Scheduled (Future Date)</option>
                    <option value="published">Published (Live)</option>
                  </select>
                </div>

                {status === 'scheduled' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Schedule Publication</label>
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Author</label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413]"
                  >
                    {authors.map((auth) => (
                      <option key={auth.id} value={auth.id}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2.5 text-sm text-[#141413] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#1E3A5F]"
                  />
                  <span>Feature on Homepage Lead Slot</span>
                </label>
              </div>

              {/* Featured Image & Upload */}
              <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#141413]">
                  Featured Image
                </h3>
                <div className="aspect-[16/10] overflow-hidden rounded bg-[#EBE6DF]">
                  <img
                    src={resolveEditorialImage(featuredImage)}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFeatured}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] text-xs font-semibold rounded inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{uploading ? 'Uploading...' : 'Upload Image to Storage'}</span>
                </button>

                <select
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  aria-label="Choose from media library"
                  className="w-full h-9 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs text-[#141413]"
                >
                  <option value="">Select from Media Library...</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.public_url}>
                      {m.file_name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="w-full h-9 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs text-[#141413]"
                />
              </div>

              {/* Image Gallery */}
              <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#141413]">
                  Image Gallery
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Image URL or asset key..."
                    className="flex-1 h-9 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs text-[#141413]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (galleryInput.trim()) {
                        setGalleryImages((prev) => [...prev, galleryInput.trim()]);
                        setGalleryInput('');
                      }
                    }}
                    className="px-3 h-9 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {galleryImages.length > 0 && (
                  <div className="space-y-1.5">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-[#FAF8F5] px-2.5 py-1.5 rounded border border-[#E5E0D8]">
                        <span className="truncate max-w-[180px]">{img}</span>
                        <button
                          type="button"
                          onClick={() => setGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-[#991B1B] font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-[#141413]">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleTag(tag.id)}
                        className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-[#FAF8F5] text-[#5C5A55] border-[#D6CEBE]'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag..."
                    className="flex-1 h-8 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 h-8 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold rounded cursor-pointer"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Actions */}
          <div className="sticky bottom-0 bg-white border border-[#E5E0D8] rounded px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5C5A55] hover:text-[#141413] cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSave(e, 'draft')}
                className="px-4 py-2 text-xs font-semibold bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] rounded cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
