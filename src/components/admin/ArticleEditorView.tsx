import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bold,
  Calendar,
  ExternalLink,
  Eye,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Save,
  Send,
  Star,
  Table,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { Article, ArticleStatus, Author, Category, MediaItem, Tag } from '../../types';
import { createTag, updateMediaItem, upsertArticle } from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import EditorialMarkdown from '../editorial/EditorialMarkdown';
import MediaPickerModal from './MediaPickerModal';
import ArticlePreviewModal from './ArticlePreviewModal';
import { toast } from 'sonner';

interface ArticleEditorViewProps {
  article: Article | null;
  categories: Category[];
  authors: Author[];
  tags: Tag[];
  media: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
  onTagAdded: (tag: Tag) => void;
  onBack: () => void;
  onSaved: (saved: Article) => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function normalizeYouTubeOrVimeo(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com)\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

export default function ArticleEditorView({
  article,
  categories,
  authors,
  tags,
  media,
  onMediaAdded,
  onTagAdded,
  onBack,
  onSaved,
}: ArticleEditorViewProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const initialCategoryId = article?.category_id || categories[0]?.id || '';
  const initialAuthorId = article?.author_id || authors.find((a) => a.active)?.id || authors[0]?.id || '';
  const initialFeaturedMedia = media.find((m) => m.public_url === article?.featured_image);

  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [slugLocked, setSlugLocked] = useState(Boolean(article?.id));
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [content, setContent] = useState(article?.content || '');
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [authorId, setAuthorId] = useState(initialAuthorId);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(article?.tags?.map((t) => t.id) || []);
  const [newTagInput, setNewTagInput] = useState('');

  const [featuredImage, setFeaturedImage] = useState(article?.featured_image || '');
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(initialFeaturedMedia?.id || null);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialFeaturedMedia?.alt_text || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(article?.gallery_images || []);

  const [status, setStatus] = useState<ArticleStatus>(article?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(Boolean(article?.is_featured));
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocalValue(article?.published_at));
  const [scheduledFor, setScheduledFor] = useState(toDatetimeLocalValue(article?.scheduled_for));
  const [readingTimeOverride, setReadingTimeOverride] = useState<number | null>(
    article?.reading_time || null
  );

  const [seoTitle, setSeoTitle] = useState(article?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(article?.seo_description || '');
  const [seoKeywords, setSeoKeywords] = useState(
    (article?.tags || []).map((t) => t.name).join(', ')
  );
  const [ogImage, setOgImage] = useState(article?.og_image || '');

  const [viewMode, setViewMode] = useState<'write' | 'split' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Media picker targets
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    'featured' | 'gallery' | 'inline' | 'og' | null
  >(null);

  // Inline popovers (no window.prompt)
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkHref, setLinkHref] = useState('');

  const [showVideoPopover, setShowVideoPopover] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  const [showTablePopover, setShowTablePopover] = useState(false);
  const [tableCols, setTableCols] = useState(3);
  const [tableRows, setTableRows] = useState(3);

  const wordCount = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [content]);

  const computedReadingTime = useMemo(
    () => Math.max(1, Math.ceil(wordCount / 200)),
    [wordCount]
  );

  const effectiveReadingTime = readingTimeOverride && readingTimeOverride > 0
    ? readingTimeOverride
    : computedReadingTime;

  const activeCategory = categories.find((c) => c.id === categoryId) || null;
  const activeAuthor = authors.find((a) => a.id === authorId) || null;
  const selectedTagObjects = tags.filter((t) => selectedTagIds.includes(t.id));

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugLocked) {
      setSlug(slugify(val));
    }
  };

  const insertAtCursor = (before: string, after = '', placeholder = '') => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : '\n'}${before}${placeholder}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const updated = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(updated);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleInsertTable = () => {
    const cols = Math.max(2, Math.min(6, tableCols));
    const rows = Math.max(1, Math.min(10, tableRows));
    const header = `| ${Array.from({ length: cols }, (_, i) => `Column ${i + 1}`).join(' | ')} |`;
    const divider = `| ${Array.from({ length: cols }, () => '---').join(' | ')} |`;
    const body = Array.from(
      { length: rows },
      (_, r) => `| ${Array.from({ length: cols }, (__, c) => `Row ${r + 1}.${c + 1}`).join(' | ')} |`
    ).join('\n');
    insertAtCursor(`\n${header}\n${divider}\n${body}\n`, '', '');
    setShowTablePopover(false);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkHref.trim()) return;
    const label = linkText.trim() || linkHref.trim();
    insertAtCursor(`[${label}](${linkHref.trim()})`, '', '');
    setLinkText('');
    setLinkHref('');
    setShowLinkPopover(false);
  };

  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = normalizeYouTubeOrVimeo(videoUrl);
    if (!valid) {
      toast.error('Please enter a valid YouTube or Vimeo URL.');
      return;
    }
    const captionLine = videoCaption.trim() ? `\n*${videoCaption.trim()}*\n` : '';
    insertAtCursor(`\n[video](${valid})${captionLine}\n`, '', '');
    setVideoUrl('');
    setVideoCaption('');
    setShowVideoPopover(false);
  };

  const handleAddInlineTag = async () => {
    const cleaned = newTagInput.trim();
    if (!cleaned) return;
    const created = await createTag(cleaned);
    if (created) {
      onTagAdded(created);
      if (!selectedTagIds.includes(created.id)) {
        const nextIds = [...selectedTagIds, created.id];
        setSelectedTagIds(nextIds);
        const existingKeywords = seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        if (!existingKeywords.some((k) => k.toLowerCase() === created.name.toLowerCase())) {
          setSeoKeywords([...existingKeywords, created.name].join(', '));
        }
      }
      setNewTagInput('');
      toast.success(`Tag "${created.name}" attached.`);
    } else {
      toast.error('Could not create tag.');
    }
  };

  const handleSyncKeywordsToTags = async () => {
    const names = seoKeywords
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const nextIds = new Set(selectedTagIds);
    for (const name of names) {
      const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        nextIds.add(existing.id);
      } else {
        const created = await createTag(name);
        if (created) {
          onTagAdded(created);
          nextIds.add(created.id);
        }
      }
    }
    setSelectedTagIds(Array.from(nextIds));
    toast.success('SEO keywords synced with article tags.');
  };

  const handleSave = async (targetStatus: ArticleStatus) => {
    if (!title.trim()) {
      toast.error('Article title is required.');
      return;
    }
    const finalSlug = slugify(slug || title);
    if (!finalSlug) {
      toast.error('A valid URL slug is required.');
      return;
    }
    if (!categoryId) {
      toast.error('Please select one of the editorial categories.');
      return;
    }
    if (!authorId) {
      toast.error('Please select an editorial author.');
      return;
    }
    if (!content.trim()) {
      toast.error('Main article content cannot be empty.');
      return;
    }
    if (targetStatus === 'scheduled' && !scheduledFor) {
      toast.error('Please choose a scheduled date and time.');
      return;
    }

    setSaving(true);

    // Sync featured image alt text into public.media if linked to a media row
    if (featuredImageId && featuredImageAlt.trim()) {
      await updateMediaItem(featuredImageId, { alt_text: featuredImageAlt.trim() });
    }

    const res = await upsertArticle({
      id: article?.id,
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      featured_image: featuredImage.trim() || null,
      gallery_images: galleryImages,
      category_id: categoryId,
      author_id: authorId,
      status: targetStatus,
      is_featured: isFeatured,
      reading_time: effectiveReadingTime,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      og_image: ogImage.trim() || featuredImage.trim() || null,
      published_at:
        targetStatus === 'published'
          ? publishedAt
            ? new Date(publishedAt).toISOString()
            : article?.published_at || new Date().toISOString()
          : publishedAt
          ? new Date(publishedAt).toISOString()
          : null,
      scheduled_for:
        targetStatus === 'scheduled' && scheduledFor
          ? new Date(scheduledFor).toISOString()
          : null,
      tagIds: selectedTagIds,
    });

    setSaving(false);

    if (res.success && res.article) {
      setStatus(targetStatus);
      toast.success(
        targetStatus === 'published'
          ? 'Article published live to AMAAN ESTATE.'
          : targetStatus === 'scheduled'
          ? 'Article scheduled for publication.'
          : 'Draft saved successfully.'
      );
      onSaved(res.article);
    } else {
      toast.error(res.error || 'Failed to save article.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Action Bar */}
      <div className="bg-white border border-[#E5E0D8] rounded px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E5E0D8] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft size={14} />
            <span>Back to Articles</span>
          </button>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
              {article ? 'Edit Article' : 'Create New Article'} ·{' '}
              <span className="capitalize text-[#141413]">{status}</span>
            </div>
            <div className="text-sm font-medium text-[#5C5A55] truncate">
              {title.trim() || 'Untitled Editorial Story'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {article?.status === 'published' && slug && (
            <a
              href={`/articles/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <ExternalLink size={13} />
              <span>View Live</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <Save size={14} />
            <span>Save Draft</span>
          </button>
          {status === 'scheduled' && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('scheduled')}
              className="px-4 py-2 bg-[#8C4A27] hover:bg-[#733B1E] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Calendar size={14} />
              <span>Save Schedule</span>
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-5 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <Send size={14} />
            <span>{saving ? 'Saving...' : status === 'published' ? 'Update Published' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Title, Slug, Excerpt, Rich Content Workspace, Gallery, SEO */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Article Headline</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Capital Flows into Coastal Logistics Corridors in 2026"
                className="w-full h-12 px-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-lg font-serif font-semibold text-[#141413]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#5C5A55]">URL Slug</label>
                {slugLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      setSlugLocked(false);
                      setSlug(slugify(title));
                    }}
                    className="text-[11px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                  >
                    Regenerate from Title
                  </button>
                )}
              </div>
              <div className="flex items-center bg-[#FAF8F5] border border-[#D6CEBE] rounded overflow-hidden">
                <span className="px-3 text-xs font-mono text-[#7A7770] border-r border-[#D6CEBE] h-10 flex items-center bg-[#EFECE6]/50">
                  /articles/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="article-url-slug"
                  className="flex-1 h-10 px-3 bg-transparent text-xs font-mono text-[#141413] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#5C5A55]">Short Description / Excerpt</label>
                <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                  {excerpt.length} chars
                </span>
              </div>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Two-sentence editorial deck summarizing the research findings and market thesis..."
                className="w-full p-3.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm text-[#141413] leading-relaxed"
              />
            </div>
          </div>

          {/* Rich Content Editor */}
          <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
            <div className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n## ', '', 'Section Heading')}
                  title="Heading 2"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Heading2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n### ', '', 'Subheading')}
                  title="Heading 3"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Heading3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n\n', '', 'New paragraph.')}
                  title="Paragraph"
                  className="px-2 py-1.5 hover:bg-[#EFECE6] rounded text-xs font-semibold text-[#141413] cursor-pointer"
                >
                  P
                </button>
                <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => insertAtCursor('**', '**', 'bold text')}
                  title="Bold"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('*', '*', 'italic text')}
                  title="Italic"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n> ', '', 'Editorial pull-quote or key research takeaway.')}
                  title="Blockquote"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n- ', '', 'List item')}
                  title="Bullet List"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor('\n1. ', '', 'Numbered item')}
                  title="Numbered List"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <ListOrdered size={15} />
                </button>
                <span className="w-px h-5 bg-[#D6CEBE] mx-1" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkPopover((v) => !v);
                    setShowTablePopover(false);
                    setShowVideoPopover(false);
                  }}
                  title="Insert Link"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Link2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTablePopover((v) => !v);
                    setShowLinkPopover(false);
                    setShowVideoPopover(false);
                  }}
                  title="Insert Data Table"
                  className="p-2 hover:bg-[#EFECE6] rounded text-[#141413] cursor-pointer"
                >
                  <Table size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget('inline')}
                  title="Insert Image from Library / Upload / URL"
                  className="px-2.5 py-1.5 hover:bg-[#EFECE6] rounded text-xs font-semibold text-[#1E3A5F] inline-flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon size={14} />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVideoPopover((v) => !v);
                    setShowTablePopover(false);
                    setShowLinkPopover(false);
                  }}
                  title="Embed YouTube or Vimeo Video"
                  className="px-2.5 py-1.5 hover:bg-[#EFECE6] rounded text-xs font-semibold text-[#8C4A27] inline-flex items-center gap-1 cursor-pointer"
                >
                  <Video size={14} />
                  <span>Video</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#D6CEBE] rounded p-0.5">
                {(['write', 'split', 'preview'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setViewMode(m)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold capitalize cursor-pointer ${
                      viewMode === m ? 'bg-[#1E3A5F] text-white' : 'text-[#5C5A55] hover:text-[#141413]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Insertion Popovers */}
            {showLinkPopover && (
              <form
                onSubmit={handleInsertLink}
                className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-wrap items-end gap-3"
              >
                <div className="space-y-1 flex-1 min-w-[160px]">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">Link Text</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Read the market briefing"
                    className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">URL</label>
                  <input
                    type="url"
                    required
                    value={linkHref}
                    onChange={(e) => setLinkHref(e.target.value)}
                    placeholder="https://amaanestate.com/..."
                    className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                  />
                </div>
                <button type="submit" className="h-9 px-3.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer">
                  Insert Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkPopover(false)}
                  className="h-9 px-2.5 text-xs text-[#5C5A55] cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}

            {showTablePopover && (
              <div className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">Columns</label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    className="w-20 h-9 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">Body Rows</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="w-20 h-9 px-2.5 bg-white border border-[#D6CEBE] rounded text-xs tabular-nums"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="h-9 px-3.5 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                >
                  Insert Table
                </button>
                <button
                  type="button"
                  onClick={() => setShowTablePopover(false)}
                  className="h-9 px-2.5 text-xs text-[#5C5A55] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {showVideoPopover && (
              <form
                onSubmit={handleInsertVideo}
                className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-wrap items-end gap-3"
              >
                <div className="space-y-1 flex-1 min-w-[220px]">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">
                    YouTube or Vimeo URL
                  </label>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs font-mono"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-[180px]">
                  <label className="text-[11px] font-semibold text-[#5C5A55] block">Caption (Optional)</label>
                  <input
                    type="text"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                    placeholder="Architectural walkthrough"
                    className="w-full h-9 px-3 bg-white border border-[#D6CEBE] rounded text-xs"
                  />
                </div>
                <button type="submit" className="h-9 px-3.5 bg-[#8C4A27] text-white text-xs font-semibold rounded cursor-pointer">
                  Embed Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoPopover(false)}
                  className="h-9 px-2.5 text-xs text-[#5C5A55] cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Write / Split / Preview Body */}
            <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E0D8]' : 'grid-cols-1'}`}>
              {viewMode !== 'preview' && (
                <div className="p-4">
                  <textarea
                    ref={textareaRef}
                    rows={20}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write long-form architectural essays, investment research, tables, embedded videos, and visual case studies..."
                    className="w-full min-h-[460px] p-2 bg-white text-sm font-mono text-[#141413] leading-relaxed outline-none resize-y"
                  />
                </div>
              )}
              {viewMode !== 'write' && (
                <div className="p-6 bg-[#FAF8F5] min-h-[460px] max-h-[680px] overflow-y-auto">
                  <EditorialMarkdown content={content || '*Start typing to preview formatted article prose, tables, captions, and embeds.*'} />
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-[#FAF8F5] border-t border-[#E5E0D8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5A55]">
              <span className="font-mono tabular-nums">
                {wordCount.toLocaleString()} words · {effectiveReadingTime} min read
              </span>
              <span>Supports Markdown headings, GFM tables, image captions &amp; YouTube/Vimeo embeds</span>
            </div>
          </div>

          {/* Additional Gallery Images */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-serif font-semibold text-[#141413]">Additional Gallery Images</h2>
                <p className="text-xs text-[#5C5A55]">Attach architectural plates or supplementary figures to the bottom of the story.</p>
              </div>
              <button
                type="button"
                onClick={() => setMediaPickerTarget('gallery')}
                className="px-3.5 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Add Gallery Image</span>
              </button>
            </div>

            {galleryImages.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#D6CEBE] rounded text-xs text-[#5C5A55]">
                No additional gallery images attached.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={`${imgUrl}-${idx}`} className="border border-[#E5E0D8] rounded overflow-hidden bg-[#FAF8F5]">
                    <div className="aspect-[16/10] bg-[#EBE6DF] overflow-hidden">
                      <img
                        src={resolveEditorialImage(imgUrl)}
                        alt={`Gallery plate ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-2.5 py-2 flex items-center justify-between text-xs">
                      <span className="font-mono text-[#5C5A55]">Plate {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-[#991B1B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO & SERP Preview */}
          <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Search Engine Optimization</h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5A55]">SEO Meta Title</label>
                  <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                    {(seoTitle || title).length}/60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || 'Defaults to article headline'}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5A55]">SEO Meta Description</label>
                  <span className="text-[11px] font-mono tabular-nums text-[#7A7770]">
                    {(seoDescription || excerpt).length}/160 recommended
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || 'Defaults to short description'}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5C5A55]">
                    SEO Keywords (Synced to Article Tags)
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncKeywordsToTags}
                    className="text-[11px] font-semibold text-[#1E3A5F] hover:underline cursor-pointer"
                  >
                    Sync Keywords to Tags
                  </button>
                </div>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="Urban Economics, Capital Markets, Timber Architecture"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">OpenGraph Social Image Override</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="Defaults to Featured Cover Image"
                    className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget('og')}
                    className="px-3.5 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer whitespace-nowrap"
                  >
                    Choose Image
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-[#E5E0D8] rounded space-y-1">
              <div className="text-[11px] uppercase tracking-widest font-semibold text-[#8C4A27]">
                Google Search Snippet Preview
              </div>
              <div className="text-sm font-semibold text-[#1E3A5F]">
                {seoTitle || title || 'AMAAN ESTATE — Real Estate Intelligence'}
              </div>
              <div className="text-xs font-mono text-[#14532D]">
                https://amaanestate.com/articles/{slug || 'article-slug'}
              </div>
              <p className="text-xs text-[#5C5A55]">
                {seoDescription || excerpt || 'Add a concise editorial deck or SEO description above.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Publishing, Taxonomy, Cover Image */}
        <div className="xl:col-span-4 space-y-6">
          {/* Publishing Controls */}
          <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Publication &amp; Classification</h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Category (Required)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium text-[#141413]"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium text-[#141413]"
              >
                <option value="">Select Author...</option>
                {authors.map((auth) => (
                  <option key={auth.id} value={auth.id}>
                    {auth.name} ({auth.title})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-medium text-[#141413]"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Publication Date</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
              />
            </div>

            {status === 'scheduled' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#8C4A27] block">Scheduled Publish At</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#8C4A27] rounded text-xs font-mono"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Reading Time (minutes)</label>
              <input
                type="number"
                min={1}
                value={readingTimeOverride ?? computedReadingTime}
                onChange={(e) => setReadingTimeOverride(Number(e.target.value) || null)}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm tabular-nums"
              />
            </div>

            <label className="flex items-center justify-between pt-2 border-t border-[#E5E0D8] cursor-pointer">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#141413]">
                <Star size={14} className={isFeatured ? 'text-[#8C4A27]' : 'text-[#7A7770]'} fill={isFeatured ? 'currentColor' : 'none'} />
                <span>Featured Homepage Story</span>
              </span>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#1E3A5F]"
              />
            </label>
          </div>

          {/* Featured Cover Image */}
          <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-serif font-semibold text-[#141413]">Featured Cover Image</h2>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedImage('');
                    setFeaturedImageId(null);
                    setFeaturedImageAlt('');
                  }}
                  className="text-xs font-semibold text-[#991B1B] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {featuredImage ? (
              <div className="aspect-[16/10] rounded overflow-hidden bg-[#EBE6DF] border border-[#E5E0D8]">
                <img
                  src={resolveEditorialImage(featuredImage)}
                  alt={featuredImageAlt || title || 'Featured cover'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] rounded border border-dashed border-[#D6CEBE] bg-[#FAF8F5] flex items-center justify-center text-xs text-[#5C5A55]">
                No cover image selected
              </div>
            )}

            <button
              type="button"
              onClick={() => setMediaPickerTarget('featured')}
              className="w-full py-2.5 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold text-[#141413] cursor-pointer"
            >
              {featuredImage ? 'Replace Cover Image' : 'Select / Upload Cover Image'}
            </button>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">Cover Image Alt Text</label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Descriptive alt text for SEO & accessibility"
                className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
              />
            </div>
          </div>

          {/* Tags Selection */}
          <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
            <h2 className="text-base font-serif font-semibold text-[#141413]">Editorial Tags</h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInlineTag();
                  }
                }}
                placeholder="Create or attach tag..."
                className="flex-1 h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
              />
              <button
                type="button"
                onClick={handleAddInlineTag}
                className="px-3 h-9 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer whitespace-nowrap"
              >
                Add
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
              {tags.map((t) => {
                const checked = selectedTagIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    <span className={checked ? 'font-semibold text-[#141413]' : 'text-[#5C5A55]'}>
                      {t.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedTagIds((prev) =>
                          checked ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                        )
                      }
                      className="accent-[#1E3A5F]"
                    />
                  </label>
                );
              })}
            </div>

            {selectedTagObjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTagObjects.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTagIds((prev) => prev.filter((id) => id !== t.id))}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFECE6] rounded text-[11px] font-medium text-[#141413] cursor-pointer"
                  >
                    <span>{t.name}</span>
                    <X size={11} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaPickerTarget !== null}
        title={
          mediaPickerTarget === 'featured'
            ? 'Select Featured Cover Image'
            : mediaPickerTarget === 'gallery'
            ? 'Add Image to Article Gallery'
            : mediaPickerTarget === 'og'
            ? 'Select OpenGraph Social Image'
            : 'Insert Image into Article Body'
        }
        media={media}
        allowCaption={mediaPickerTarget === 'inline'}
        onClose={() => setMediaPickerTarget(null)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url, altText, caption, item }) => {
          if (mediaPickerTarget === 'featured') {
            setFeaturedImage(url);
            setFeaturedImageId(item?.id || null);
            if (altText) setFeaturedImageAlt(altText);
          } else if (mediaPickerTarget === 'gallery') {
            setGalleryImages((prev) => [...prev, url]);
          } else if (mediaPickerTarget === 'og') {
            setOgImage(url);
          } else if (mediaPickerTarget === 'inline') {
            const safeAlt = (altText || 'Editorial plate').replace(/\]/g, '');
            const safeCaption = (caption || '').replace(/"/g, "'");
            const md = safeCaption
              ? `\n![${safeAlt}](${url} "${safeCaption}")\n`
              : `\n![${safeAlt}](${url})\n`;
            insertAtCursor(md, '', '');
          }
        }}
      />

      {/* Full Draft / Published Preview Modal */}
      <ArticlePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={{
          title,
          slug,
          excerpt,
          content,
          featured_image: featuredImage,
          featured_image_alt: featuredImageAlt,
          gallery_images: galleryImages,
          category: activeCategory,
          author: activeAuthor,
          tags: selectedTagObjects,
          status,
          reading_time: effectiveReadingTime,
          published_at: publishedAt ? new Date(publishedAt).toISOString() : article?.published_at,
          scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : article?.scheduled_for,
          seo_title: seoTitle,
          seo_description: seoDescription,
        }}
      />
    </div>
  );
}
