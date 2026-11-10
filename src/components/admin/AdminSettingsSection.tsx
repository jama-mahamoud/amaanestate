import React, { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon, LogOut } from 'lucide-react';
import { MediaItem, Profile, Role, SiteSettings } from '../../types';
import {
  updateOwnPassword,
  updateOwnProfile,
  updateSiteSettings,
  updateUserRole,
} from '../../services/adminService';
import {
  SocialLink,
  createSocialLink,
  deleteSocialLink,
  getAllSocialLinks,
  reorderSocialLinks,
  toggleSocialLinkStatus,
  updateSocialLink,
} from '../../services/socialService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import MediaPickerModal from './MediaPickerModal';
import { SocialIcon } from '../layout/SocialIcons';
import { toast } from 'sonner';

interface SeoSettingsSectionProps {
  siteSettings: SiteSettings | null;
  media: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => void;
}

export function SeoSettingsSection({
  siteSettings,
  media,
  onMediaAdded,
  onRefresh,
}: SeoSettingsSectionProps) {
  const [form, setForm] = useState<SiteSettings | null>(siteSettings);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(siteSettings);
  }, [siteSettings]);

  if (!form) {
    return (
      <div className="bg-white border border-[#E5E0D8] rounded p-8 text-sm text-[#5C5A55]">
        Loading SEO and website configuration...
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSiteSettings({
      site_name: form.site_name,
      tagline: form.tagline,
      domain: form.domain,
      default_seo_title: form.default_seo_title,
      default_seo_description: form.default_seo_description,
      default_og_image: form.default_og_image || null,
      adsense_client_id: form.adsense_client_id || '',
      adsense_enabled: Boolean(form.adsense_enabled),
    });
    setSaving(false);
    if (res.success) {
      toast.success('SEO & website settings saved.');
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to save settings.');
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-white border border-[#E5E0D8] rounded p-6 max-w-3xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-[#141413]">SEO &amp; Website Settings</h1>
          <p className="text-xs text-[#5C5A55]">
            Search metadata defaults, OpenGraph fallback image, domain, and AdSense publishing controls.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-[#1E3A5F]">
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
            /sitemap.xml <ExternalLink size={12} />
          </a>
          <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
            /robots.txt <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Publication Name</label>
          <input
            type="text"
            required
            value={form.site_name}
            onChange={(e) => setForm({ ...form, site_name: e.target.value })}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Primary Domain</label>
          <input
            type="text"
            required
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#5C5A55] block">Masthead Tagline</label>
        <input
          type="text"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#5C5A55] block">Default SEO Title</label>
        <input
          type="text"
          value={form.default_seo_title}
          onChange={(e) => setForm({ ...form, default_seo_title: e.target.value })}
          className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#5C5A55] block">Default SEO Meta Description</label>
        <textarea
          rows={3}
          value={form.default_seo_description}
          onChange={(e) => setForm({ ...form, default_seo_description: e.target.value })}
          className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#5C5A55] block">Default OpenGraph Share Image</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.default_og_image || ''}
            onChange={(e) => setForm({ ...form, default_og_image: e.target.value })}
            className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-3.5 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ImageIcon size={13} /> Select Image
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E0D8] space-y-4">
        <h2 className="text-sm font-serif font-semibold text-[#141413]">Google AdSense Integration</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">AdSense Client ID</label>
            <input
              type="text"
              value={form.adsense_client_id || ''}
              onChange={(e) => setForm({ ...form, adsense_client_id: e.target.value })}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#141413] pt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.adsense_enabled)}
              onChange={(e) => setForm({ ...form, adsense_enabled: e.target.checked })}
              className="accent-[#1E3A5F]"
            />
            <span>Enable Google AdSense Slots</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save SEO & Website Settings'}
      </button>

      <MediaPickerModal
        open={pickerOpen}
        title="Select Default OpenGraph Image"
        media={media}
        onClose={() => setPickerOpen(false)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url }) => setForm((prev) => (prev ? { ...prev, default_og_image: url } : prev))}
      />
    </form>
  );
}

export function SocialMediaLinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  // Form State
  const [platform, setPlatform] = useState<SocialLink['platform']>('twitter');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('twitter');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLinks = async () => {
    setLoading(true);
    const data = await getAllSocialLinks();
    setLinks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const notifyChange = () => {
    window.dispatchEvent(new Event('social_links_updated'));
  };

  const handleOpenAdd = () => {
    setEditingLink(null);
    setPlatform('twitter');
    setName('X (Twitter)');
    setUrl('');
    setIconName('twitter');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: SocialLink) => {
    setEditingLink(item);
    setPlatform(item.platform);
    setName(item.name);
    setUrl(item.url);
    setIconName(item.icon_name || item.platform);
    setIsActive(item.is_active);
    setModalOpen(true);
  };

  const handlePlatformChange = (p: SocialLink['platform']) => {
    setPlatform(p);
    setIconName(p);
    const labels: Record<string, string> = {
      twitter: 'X (Twitter)',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      youtube: 'YouTube',
      telegram: 'Telegram',
      tiktok: 'TikTok',
      other: 'Website / Other',
    };
    setName(labels[p] || 'Social Channel');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('URL is required.');
      return;
    }
    setSaving(true);
    if (editingLink) {
      await updateSocialLink(editingLink.id, {
        platform,
        name: name.trim(),
        url: url.trim(),
        icon_name: iconName,
        is_active: isActive,
      });
      toast.success(`Updated ${name}`);
    } else {
      await createSocialLink({
        platform,
        name: name.trim(),
        url: url.trim(),
        icon_name: iconName,
        display_order: links.length + 1,
        is_active: isActive,
      });
      toast.success(`Added ${name}`);
    }
    setSaving(false);
    setModalOpen(false);
    await loadLinks();
    notifyChange();
  };

  const handleToggle = async (link: SocialLink) => {
    const next = !link.is_active;
    await toggleSocialLinkStatus(link.id, next);
    toast.success(`${link.name} ${next ? 'activated' : 'deactivated'}.`);
    await loadLinks();
    notifyChange();
  };

  const handleDelete = async (id: string, linkName: string) => {
    if (window.confirm(`Delete ${linkName} social media link?`)) {
      await deleteSocialLink(id);
      toast.success(`Deleted ${linkName}.`);
      await loadLinks();
      notifyChange();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const copy = [...links];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reorderPayload = copy.map((item, idx) => ({
      id: item.id,
      display_order: idx + 1,
    }));

    setLinks(copy);
    await reorderSocialLinks(reorderPayload);
    toast.success('Social links reordered.');
    notifyChange();
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div>
          <h2 className="text-lg font-serif font-semibold text-[#141413]">
            Social Media Links Management
          </h2>
          <p className="text-xs text-[#5C5A55]">
            Manage, activate, reorder, and update official publication channels appearing in the website footer.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          + Add Platform
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-xs text-[#5C5A55]">Loading social channels...</div>
      ) : links.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#5C5A55] border border-dashed border-[#E5E0D8] rounded">
          No social media channels added yet. Click &ldquo;+ Add Platform&rdquo; to configure one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] uppercase tracking-wider text-[10px] text-[#5C5A55]">
              <tr>
                <th className="px-3 py-2.5">Order</th>
                <th className="px-3 py-2.5">Platform</th>
                <th className="px-3 py-2.5">Display Name</th>
                <th className="px-3 py-2.5">Profile URL</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {links.map((link, idx) => (
                <tr key={link.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-3 py-2.5 font-mono text-[#5C5A55]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="px-1 py-0.5 hover:bg-[#EBE6DF] rounded disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === links.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="px-1 py-0.5 hover:bg-[#EBE6DF] rounded disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <span className="ml-1">{link.display_order}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-semibold capitalize text-[#141413]">
                    <div className="flex items-center gap-2">
                      <SocialIcon platform={link.icon_name || link.platform} size={15} />
                      <span>{link.platform}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#141413]">{link.name}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-[#1E3A5F] truncate max-w-[200px]">
                    <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(link)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                        link.is_active
                          ? 'bg-[#E6F4EA] text-[#137333]'
                          : 'bg-[#F1F3F4] text-[#5F6368]'
                      }`}
                    >
                      {link.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(link)}
                      className="text-[#1E3A5F] font-semibold hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id, link.name)}
                      className="text-[#991B1B] font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-semibold text-[#141413]">
              {editingLink ? 'Edit Social Media Channel' : 'Add Social Media Channel'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#5C5A55] block">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => handlePlatformChange(e.target.value as any)}
                  className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs capitalize"
                >
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="telegram">Telegram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">X (Twitter)</option>
                  <option value="other">Other / Custom</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5C5A55] block">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AMAAN ESTATE on LinkedIn"
                  className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5C5A55] block">Profile / Channel URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://platform.com/your-profile"
                  className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5C5A55] block">Icon</label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs capitalize"
                >
                  <option value="facebook">Facebook Icon</option>
                  <option value="youtube">YouTube Icon</option>
                  <option value="instagram">Instagram Icon</option>
                  <option value="telegram">Telegram Icon</option>
                  <option value="tiktok">TikTok Icon</option>
                  <option value="linkedin">LinkedIn Icon</option>
                  <option value="twitter">X / Twitter Icon</option>
                  <option value="globe">Globe / General Icon</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#1E3A5F]"
                />
                <span className="font-semibold text-[#141413]">Active &amp; Visible in Footer</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#1E3A5F] hover:bg-[#162C49] text-white rounded font-semibold cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface EditorialSettingsSectionProps {
  siteSettings: SiteSettings | null;
  users: Profile[];
  roles: Role[];
  currentProfile: Profile | null;
  onRefresh: () => void;
}

export function EditorialSettingsSection({
  siteSettings,
  users,
  roles,
  currentProfile,
  onRefresh,
}: EditorialSettingsSectionProps) {
  const [editorialEmail, setEditorialEmail] = useState(siteSettings?.editorial_email || 'editorial@amaanestate.com');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setEditorialEmail(siteSettings.editorial_email || 'editorial@amaanestate.com');
    }
  }, [siteSettings]);

  const handleSaveEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSiteSettings({
      editorial_email: editorialEmail.trim(),
    });
    setSaving(false);
    if (res.success) {
      toast.success('Editorial desk settings saved.');
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to save editorial settings.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <form onSubmit={handleSaveEditorial} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-5">
        <div>
          <h1 className="text-xl font-serif font-semibold text-[#141413]">Editorial Desk Settings</h1>
          <p className="text-xs text-[#5C5A55]">
            Newsroom contact address and verified publication configuration.
          </p>
        </div>

        <div className="space-y-1.5 max-w-md">
          <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Desk Email</label>
          <input
            type="email"
            required
            value={editorialEmail}
            onChange={(e) => setEditorialEmail(e.target.value)}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Editorial Email'}
        </button>
      </form>

      {/* Dynamic Social Media Links Manager */}
      <SocialMediaLinksManager />

      {/* Users & RBAC Roles */}
      <div className="bg-white border border-[#E5E0D8] rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E0D8]">
          <h2 className="text-lg font-serif font-semibold text-[#141413]">
            Team Access &amp; Editorial Roles ({users.length})
          </h2>
          <p className="text-xs text-[#5C5A55]">
            Only accounts assigned the <code className="font-mono">admin</code> or{' '}
            <code className="font-mono">editor</code> role can access this CMS workspace.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-5 py-3 text-right">Update Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F5]/70">
                  <td className="px-5 py-3 font-medium text-[#141413]">
                    {u.full_name || 'Unnamed User'}
                    {currentProfile?.id === u.id && (
                      <span className="ml-2 text-[11px] text-[#8C4A27] font-semibold">(You)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#5C5A55]">{u.email}</td>
                  <td className="px-4 py-3 text-xs font-semibold capitalize text-[#1E3A5F]">
                    {u.role?.name || 'reader'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select
                      value={u.role_id || u.role?.id || ''}
                      disabled={currentProfile?.role?.name !== 'admin'}
                      onChange={async (e) => {
                        const res = await updateUserRole(u.id, e.target.value);
                        if (res.success) {
                          toast.success('User role updated.');
                          onRefresh();
                        } else {
                          toast.error(res.error || 'Only admins can update user roles.');
                        }
                      }}
                      className="h-9 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold capitalize disabled:opacity-50"
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
      </div>
    </div>
  );
}

interface MyAccountSectionProps {
  profile: Profile | null;
  media: MediaItem[];
  onMediaAdded: (item: MediaItem) => void;
  onRefresh: () => void;
  onSignOut: () => void;
}

export function MyAccountSection({
  profile,
  media,
  onMediaAdded,
  onRefresh,
  onSignOut,
}: MyAccountSectionProps) {
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setAvatarUrl(profile?.avatar_url || '');
    setBio(profile?.bio || '');
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setSavingProfile(true);
    const res = await updateOwnProfile({
      full_name: fullName,
      avatar_url: avatarUrl || null,
      bio: bio || null,
    });
    setSavingProfile(false);
    if (res.success) {
      toast.success('Account profile updated.');
      onRefresh();
    } else {
      toast.error(res.error || 'Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const res = await updateOwnPassword(newPassword);
    setSavingPassword(false);
    if (res.success) {
      toast.success('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.error || 'Could not update password.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white border border-[#E5E0D8] rounded p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={resolveEditorialImage(avatarUrl, 'author-portrait')}
            alt={fullName || profile?.email || 'Admin profile'}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover bg-[#EBE6DF]"
          />
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#141413]">
              {profile?.full_name || 'Editorial Administrator'}
            </h1>
            <p className="text-xs font-mono text-[#5C5A55]">
              {profile?.email} · <span className="capitalize text-[#8C4A27] font-semibold">{profile?.role?.name || 'admin'}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold text-[#141413] rounded inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <h2 className="text-lg font-serif font-semibold text-[#141413]">Profile Details</h2>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Avatar Image</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="flex-1 h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
            />
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-3.5 h-10 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Choose Image
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#5C5A55] block">Editorial Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <form onSubmit={handleUpdatePassword} className="bg-white border border-[#E5E0D8] rounded p-6 space-y-4">
        <h2 className="text-lg font-serif font-semibold text-[#141413]">Security &amp; Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={savingPassword}
          className="px-5 py-2.5 bg-[#8C4A27] hover:bg-[#733B1E] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <MediaPickerModal
        open={pickerOpen}
        title="Select Account Avatar"
        media={media}
        onClose={() => setPickerOpen(false)}
        onMediaAdded={onMediaAdded}
        onSelect={({ url }) => setAvatarUrl(url)}
      />
    </div>
  );
}
