import React, { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon, LogOut } from 'lucide-react';
import { MediaItem, Profile, Role, SiteSettings } from '../../types';
import {
  updateOwnPassword,
  updateOwnProfile,
  updateSiteSettings,
  updateUserRole,
} from '../../services/adminService';
import { resolveEditorialImage } from '../../lib/editorialImages';
import MediaPickerModal from './MediaPickerModal';
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
  const [socialLinks, setSocialLinks] = useState(siteSettings?.social_links || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setEditorialEmail(siteSettings.editorial_email || 'editorial@amaanestate.com');
      setSocialLinks(siteSettings.social_links || {});
    }
  }, [siteSettings]);

  const handleSaveEditorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateSiteSettings({
      editorial_email: editorialEmail.trim(),
      social_links: socialLinks,
    });
    setSaving(false);
    if (res.success) {
      toast.success('Editorial desk & social settings saved.');
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
            Newsroom contact address and verified publication social channels.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['twitter', 'linkedin', 'instagram', 'youtube'] as const).map((network) => (
            <div key={network} className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block capitalize">
                {network} URL
              </label>
              <input
                type="url"
                value={socialLinks[network] || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, [network]: e.target.value })}
                placeholder={`https://${network}.com/amaanestate`}
                className="w-full h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-mono"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C49] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Editorial Settings'}
        </button>
      </form>

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
