import React, { useRef, useState } from 'react';
import { Check, Copy, Edit3, Link2, Search, Trash2, Upload } from 'lucide-react';
import { MediaItem } from '../../types';
import {
  deleteMediaItem,
  registerExternalMediaUrl,
  updateMediaItem,
  uploadMediaFile,
} from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

interface AdminMediaSectionProps {
  media: MediaItem[];
  onRefresh: () => void;
}

export default function AdminMediaSection({ media, onRefresh }: AdminMediaSectionProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [activePanel, setActivePanel] = useState<'upload' | 'external'>('upload');
  const [search, setSearch] = useState('');

  // Upload form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploading, setUploading] = useState(false);

  // External URL form
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalAlt, setExternalAlt] = useState('');
  const [externalCaption, setExternalCaption] = useState('');
  const [previewState, setPreviewState] = useState<'idle' | 'valid' | 'error'>('idle');
  const [savingExternal, setSavingExternal] = useState(false);

  // Edit metadata state
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);

  const filtered = media.filter((m) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      m.file_name.toLowerCase().includes(q) ||
      (m.alt_text || '').toLowerCase().includes(q) ||
      m.public_url.toLowerCase().includes(q)
    );
  });

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadMediaFile(file, uploadAlt, uploadTitle);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (res.success) {
      toast.success('Image uploaded to Supabase Storage (editorial-media).');
      setUploadTitle('');
      setUploadAlt('');
      onRefresh();
    } else {
      toast.error(res.error || 'Upload failed.');
    }
  };

  const handleExternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewState !== 'valid') {
      toast.error('Verify that the URL loads a valid image preview before saving.');
      return;
    }
    setSavingExternal(true);
    const res = await registerExternalMediaUrl({
      url: externalUrl,
      title: externalTitle,
      altText: externalAlt,
      caption: externalCaption,
    });
    setSavingExternal(false);
    if (res.success) {
      toast.success('External image URL saved to Media Library.');
      setExternalUrl('');
      setExternalTitle('');
      setExternalAlt('');
      setExternalCaption('');
      setPreviewState('idle');
      onRefresh();
    } else {
      toast.error(res.error || 'Could not register external image URL.');
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const res = await updateMediaItem(editingItem.id, {
      file_name: editTitle.trim() || editingItem.file_name,
      alt_text: editAlt.trim(),
    });
    if (res.success) {
      toast.success('Media metadata updated.');
      setEditingItem(null);
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to update metadata.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intake Panel: Upload vs External Image URL */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#141413]">Editorial Media Library</h1>
            <p className="text-xs text-[#5C5A55]">
              Upload JPG, PNG, WebP, or AVIF assets to Supabase Storage or register verified external image URLs.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActivePanel('upload')}
              className={`px-3.5 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activePanel === 'upload'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-[#FAF8F5] border border-[#D6CEBE] text-[#141413]'
              }`}
            >
              <Upload size={13} /> Upload from Computer
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('external')}
              className={`px-3.5 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activePanel === 'external'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-[#FAF8F5] border border-[#D6CEBE] text-[#141413]'
              }`}
            >
              <Link2 size={13} /> External Image URL
            </button>
          </div>
        </div>

        <div className="p-6">
          {activePanel === 'upload' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-6 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Image Title (Optional)</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Mogadishu Port Logistics Yard"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Image Alt Text</label>
                  <input
                    type="text"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="Concise description for SEO and screen readers"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
              </div>

              <div className="lg:col-span-6">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleUploadChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-8 px-4 border-2 border-dashed border-[#D6CEBE] hover:border-[#1E3A5F] rounded bg-[#FAF8F5] flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={22} className="text-[#1E3A5F]" />
                  <span className="text-sm font-semibold text-[#141413]">
                    {uploading ? 'Uploading to editorial-media...' : 'Select Image File to Upload'}
                  </span>
                  <span className="text-xs text-[#7A7770]">
                    JPG, PNG, WebP, AVIF · Max 5 MB · Saved to Supabase Storage
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleExternalSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Direct Image URL (HTTPS)</label>
                  <input
                    type="url"
                    required
                    value={externalUrl}
                    onChange={(e) => {
                      setExternalUrl(e.target.value);
                      setPreviewState(e.target.value.trim().startsWith('http') ? 'idle' : 'error');
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Image Title</label>
                    <input
                      type="text"
                      value={externalTitle}
                      onChange={(e) => setExternalTitle(e.target.value)}
                      placeholder="Architectural Plate Title"
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#5C5A55] block">Alt Text</label>
                    <input
                      type="text"
                      value={externalAlt}
                      onChange={(e) => setExternalAlt(e.target.value)}
                      placeholder="Descriptive alt text"
                      className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Caption / Credit (Optional)</label>
                  <input
                    type="text"
                    value={externalCaption}
                    onChange={(e) => setExternalCaption(e.target.value)}
                    placeholder="Photographer or architectural credit"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingExternal || previewState !== 'valid'}
                  className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-50 text-white text-xs font-semibold rounded cursor-pointer"
                >
                  {savingExternal ? 'Saving URL...' : 'Save External Image to Library'}
                </button>
              </div>

              <div className="lg:col-span-5 border border-[#E5E0D8] rounded overflow-hidden bg-[#FAF8F5]">
                <div className="aspect-[16/10] bg-[#EBE6DF] flex items-center justify-center overflow-hidden">
                  {externalUrl.trim().startsWith('http') ? (
                    <img
                      src={externalUrl.trim()}
                      alt={externalAlt || 'Live external preview'}
                      referrerPolicy="no-referrer"
                      onLoad={() => setPreviewState('valid')}
                      onError={() => setPreviewState('error')}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[#7A7770]">Paste an HTTPS image URL to validate preview</span>
                  )}
                </div>
                <div className="px-3 py-2 text-xs">
                  {previewState === 'valid' && (
                    <span className="text-[#14532D] font-semibold inline-flex items-center gap-1">
                      <Check size={13} /> Image verified and ready to save
                    </span>
                  )}
                  {previewState === 'error' && (
                    <span className="text-[#991B1B] font-semibold">
                      Unable to load image preview from this URL.
                    </span>
                  )}
                  {previewState === 'idle' && externalUrl.trim().startsWith('http') && (
                    <span className="text-[#5C5A55]">Checking image URL...</span>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E5E0D8] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by title, alt text, or URL..."
            className="w-full h-9 pl-10 pr-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
          />
        </div>
        <div className="text-xs text-[#5C5A55] tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'asset' : 'assets'} in library
        </div>
      </div>

      {/* Inline Metadata Editor */}
      {editingItem && (
        <form onSubmit={handleSaveMetadata} className="bg-white border border-[#1E3A5F] rounded p-5 space-y-4">
          <div className="text-sm font-serif font-semibold text-[#141413]">
            Edit Image Metadata: {editingItem.file_name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C5A55] block">Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C5A55] block">Alt Text &amp; Caption</label>
              <input
                type="text"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer">
              Save Metadata
            </button>
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 bg-[#EFECE6] text-xs font-semibold rounded cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded p-12 text-center text-sm text-[#5C5A55]">
          No media assets found. Upload an image above or register an external HTTPS image URL.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const isExternal = item.storage_path.startsWith('external/');
            return (
              <div key={item.id} className="bg-white border border-[#E5E0D8] rounded overflow-hidden flex flex-col">
                <div className="aspect-[16/10] bg-[#EBE6DF] overflow-hidden">
                  <img
                    src={resolveEditorialImage(item.public_url)}
                    alt={item.alt_text || item.file_name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[#141413] truncate">{item.file_name}</div>
                    <div className="text-xs text-[#5C5A55] truncate">
                      {item.alt_text || 'No alt text recorded'}
                    </div>
                    <div className="text-[11px] font-mono text-[#7A7770] tabular-nums">
                      {isExternal ? 'External URL' : `${Math.max(1, Math.round(item.size_bytes / 1024))} KB`} ·{' '}
                      {item.created_at.split('T')[0]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E0D8]">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.public_url);
                        toast.success('Image URL copied.');
                      }}
                      className="text-xs font-semibold text-[#1E3A5F] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} /> Copy URL
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setEditTitle(item.file_name);
                          setEditAlt(item.alt_text || '');
                        }}
                        className="p-1 text-[#5C5A55] hover:text-[#141413] cursor-pointer"
                        title="Edit Metadata"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Media Asset"
        description={`Remove "${deleteTarget?.file_name || ''}" from the Media Library? Any article still referencing its URL will lose this asset.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await deleteMediaItem(deleteTarget);
          setDeleteTarget(null);
          if (ok) {
            toast.success('Media asset removed.');
            onRefresh();
          } else {
            toast.error('Failed to remove media asset.');
          }
        }}
      />
    </div>
  );
}
