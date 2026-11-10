import React, { useRef, useState } from 'react';
import { Check, Link2, Search, Upload, X } from 'lucide-react';
import { MediaItem } from '../../types';
import { registerExternalMediaUrl, uploadMediaFile } from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import { toast } from 'sonner';

interface MediaPickerModalProps {
  open: boolean;
  title?: string;
  media: MediaItem[];
  onClose: () => void;
  onSelect: (selection: { url: string; altText: string; caption?: string; item?: MediaItem }) => void;
  onMediaAdded: (item: MediaItem) => void;
  allowCaption?: boolean;
}

export default function MediaPickerModal({
  open,
  title = 'Select or Upload Image',
  media,
  onClose,
  onSelect,
  onMediaAdded,
  allowCaption = false,
}: MediaPickerModalProps) {
  const [mode, setMode] = useState<'library' | 'upload' | 'external'>('library');
  const [search, setSearch] = useState('');

  // Upload state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // External URL state
  const [externalUrl, setExternalUrl] = useState('');
  const [externalTitle, setExternalTitle] = useState('');
  const [externalAlt, setExternalAlt] = useState('');
  const [externalCaption, setExternalCaption] = useState('');
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'valid' | 'error'>('idle');
  const [savingExternal, setSavingExternal] = useState(false);

  if (!open) return null;

  const filteredMedia = media.filter((m) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      m.file_name.toLowerCase().includes(q) ||
      (m.alt_text || '').toLowerCase().includes(q)
    );
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadMediaFile(
      file,
      [uploadAlt.trim(), uploadCaption.trim()].filter(Boolean).join(' — ') || file.name,
      uploadTitle.trim() || file.name
    );
    setUploading(false);
    if (res.success && res.item) {
      onMediaAdded(res.item);
      toast.success('Image uploaded to editorial-media.');
      onSelect({
        url: res.item.public_url,
        altText: uploadAlt.trim() || res.item.alt_text || res.item.file_name,
        caption: uploadCaption.trim(),
        item: res.item,
      });
      onClose();
    } else {
      toast.error(res.error || 'Upload failed.');
    }
  };

  const handleSaveExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewStatus !== 'valid') {
      toast.error('Please verify that the image URL loads a valid image preview before saving.');
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
    if (res.success && res.item) {
      onMediaAdded(res.item);
      toast.success('External image URL saved to Media Library.');
      onSelect({
        url: res.item.public_url,
        altText: externalAlt.trim() || res.item.file_name,
        caption: externalCaption.trim(),
        item: res.item,
      });
      onClose();
    } else {
      toast.error(res.error || 'Unable to save external URL.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white border border-[#E5E0D8] rounded-md w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#E5E0D8] flex items-center justify-between gap-4">
          <h2 className="text-lg font-serif font-semibold text-[#141413]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media picker"
            className="p-1.5 text-[#5C5A55] hover:text-[#141413] rounded cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Switch */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-b border-[#E5E0D8] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('library')}
            className={`px-3.5 py-2 rounded text-xs font-semibold cursor-pointer whitespace-nowrap ${
              mode === 'library' ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E0D8] text-[#141413]'
            }`}
          >
            Media Library ({media.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3.5 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'upload' ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E0D8] text-[#141413]'
            }`}
          >
            <Upload size={13} /> Upload Image
          </button>
          <button
            type="button"
            onClick={() => setMode('external')}
            className={`px-3.5 py-2 rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              mode === 'external' ? 'bg-[#1E3A5F] text-white' : 'bg-white border border-[#E5E0D8] text-[#141413]'
            }`}
          >
            <Link2 size={13} /> External Image URL
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'library' && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search uploaded or external media by title or alt text..."
                  className="w-full h-10 pl-10 pr-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>

              {filteredMedia.length === 0 ? (
                <div className="py-12 text-center space-y-3 border border-dashed border-[#D6CEBE] rounded">
                  <p className="text-sm text-[#5C5A55]">
                    No media items match your filter. Upload a file or paste an external image URL.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer"
                  >
                    Upload First Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredMedia.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect({
                          url: item.public_url,
                          altText: item.alt_text || item.file_name,
                          item,
                        });
                        onClose();
                      }}
                      className="text-left border border-[#E5E0D8] hover:border-[#1E3A5F] rounded overflow-hidden bg-white transition-colors cursor-pointer group"
                    >
                      <div className="aspect-[16/10] bg-[#EBE6DF] overflow-hidden">
                        <img
                          src={resolveEditorialImage(item.public_url)}
                          alt={item.alt_text || item.file_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                      <div className="p-2.5 space-y-0.5">
                        <div className="text-xs font-semibold text-[#141413] truncate">{item.file_name}</div>
                        <div className="text-[11px] text-[#7A7770] truncate">
                          {item.alt_text || 'No alt text'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'upload' && (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Image Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Lisbon Logistics Hub Aerial"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">Image Alt Text</label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  placeholder="Descriptive alt text for accessibility & SEO"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                />
              </div>
              {allowCaption && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Caption (Optional)</label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    placeholder="Editorial photo caption"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="w-full py-10 border-2 border-dashed border-[#D6CEBE] hover:border-[#1E3A5F] rounded bg-[#FAF8F5] flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Upload size={22} className="text-[#1E3A5F]" />
                <span className="text-sm font-semibold text-[#141413]">
                  {uploading ? 'Uploading to editorial-media...' : 'Choose Image File from Computer'}
                </span>
                <span className="text-xs text-[#7A7770]">
                  JPG, PNG, WebP, or AVIF · Max 5 MB · Stored in Supabase Storage
                </span>
              </button>
            </div>
          )}

          {mode === 'external' && (
            <form onSubmit={handleSaveExternal} className="max-w-xl mx-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C5A55] block">External Image URL</label>
                <input
                  type="url"
                  required
                  value={externalUrl}
                  onChange={(e) => {
                    setExternalUrl(e.target.value);
                    setPreviewStatus(e.target.value.trim().startsWith('http') ? 'idle' : 'error');
                  }}
                  placeholder="https://example.com/architecture-photo.jpg"
                  className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono"
                />
              </div>

              {externalUrl.trim().startsWith('http') && (
                <div className="border border-[#E5E0D8] rounded overflow-hidden bg-[#FAF8F5]">
                  <div className="aspect-[16/9] bg-[#EBE6DF] flex items-center justify-center overflow-hidden">
                    <img
                      src={externalUrl.trim()}
                      alt={externalAlt || 'External preview'}
                      referrerPolicy="no-referrer"
                      onLoad={() => setPreviewStatus('valid')}
                      onError={() => setPreviewStatus('error')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 text-xs">
                    {previewStatus === 'valid' && (
                      <span className="text-[#14532D] font-semibold inline-flex items-center gap-1">
                        <Check size={13} /> Valid image loaded and ready to save
                      </span>
                    )}
                    {previewStatus === 'error' && (
                      <span className="text-[#991B1B] font-semibold">
                        Could not load an image from this URL. Verify the direct image link.
                      </span>
                    )}
                    {previewStatus === 'idle' && (
                      <span className="text-[#5C5A55]">Validating image preview...</span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Image Title</label>
                  <input
                    type="text"
                    value={externalTitle}
                    onChange={(e) => setExternalTitle(e.target.value)}
                    placeholder="Optional image title"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Alt Text</label>
                  <input
                    type="text"
                    value={externalAlt}
                    onChange={(e) => setExternalAlt(e.target.value)}
                    placeholder="Accessibility & SEO description"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
              </div>

              {allowCaption && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#5C5A55] block">Caption (Optional)</label>
                  <input
                    type="text"
                    value={externalCaption}
                    onChange={(e) => setExternalCaption(e.target.value)}
                    placeholder="Caption displayed beneath the image"
                    className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={savingExternal || previewStatus !== 'valid'}
                className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] disabled:opacity-50 text-white text-xs font-semibold rounded cursor-pointer"
              >
                {savingExternal ? 'Saving...' : 'Save URL & Select Image'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
