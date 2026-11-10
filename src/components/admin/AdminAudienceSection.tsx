import React, { useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import { ContactMessage, ContactMessageStatus, NewsletterSubscriber } from '../../types';
import {
  deleteContactMessage,
  deleteSubscriber,
  updateContactMessage,
  updateSubscriberStatus,
} from '../../services/adminService';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'sonner';

interface SubscribersSectionProps {
  subscribers: NewsletterSubscriber[];
  onRefresh: () => void;
}

export function SubscribersSection({ subscribers, onRefresh }: SubscribersSectionProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesSearch =
        !q || s.email.toLowerCase().includes(q) || s.source.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [subscribers, search, statusFilter]);

  const handleExportCsv = () => {
    const header = 'email,status,source,created_at\n';
    const rows = filtered
      .map((s) => `"${s.email}","${s.status}","${s.source}","${s.created_at}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'amaan-estate-subscribers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif font-semibold text-[#141413]">Newsletter Subscribers</h1>
            <p className="text-xs text-[#5C5A55] tabular-nums">
              {subscribers.filter((s) => s.status === 'subscribed').length} active ·{' '}
              {subscribers.length} total records
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold text-[#141413] rounded inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7770]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or signup source..."
              className="w-full h-10 pl-10 pr-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'subscribed' | 'unsubscribed')}
            className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5C5A55]">
            No newsletter subscribers match the active filter.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider text-[#5C5A55]">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#FAF8F5]/70">
                  <td className="px-5 py-3 font-medium text-[#141413]">{sub.email}</td>
                  <td className="px-4 py-3 text-xs font-mono text-[#5C5A55]">{sub.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold capitalize ${
                        sub.status === 'subscribed' ? 'text-[#14532D]' : 'text-[#7A7770]'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums text-[#5C5A55]">
                    {sub.created_at.split('T')[0]}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={async () => {
                        const nextStatus = sub.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
                        const ok = await updateSubscriberStatus(sub.id, nextStatus);
                        if (ok) {
                          toast.success(`Subscriber marked ${nextStatus}.`);
                          onRefresh();
                        }
                      }}
                      className="px-2.5 py-1 bg-[#EFECE6] hover:bg-[#E5E0D8] rounded text-xs font-semibold cursor-pointer"
                    >
                      {sub.status === 'subscribed' ? 'Unsubscribe' : 'Reactivate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(sub)}
                      className="p-1.5 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                      title="Delete Subscriber"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Subscriber"
        description={`Remove "${deleteTarget?.email || ''}" permanently from newsletter subscribers?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await deleteSubscriber(deleteTarget.id);
          setDeleteTarget(null);
          if (ok) {
            toast.success('Subscriber deleted.');
            onRefresh();
          } else {
            toast.error('Unable to delete subscriber.');
          }
        }}
      />
    </div>
  );
}

interface MessagesSectionProps {
  messages: ContactMessage[];
  onRefresh: () => void;
}

export function MessagesSection({ messages, onRefresh }: MessagesSectionProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | ContactMessageStatus>('all');
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);

  const filtered = messages.filter(
    (m) => statusFilter === 'all' || m.status === statusFilter
  );

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#E5E0D8] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-semibold text-[#141413]">Editorial Contact Messages</h1>
          <p className="text-xs text-[#5C5A55] tabular-nums">
            {messages.filter((m) => m.status === 'unread').length} unread · {messages.length} total
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | ContactMessageStatus)}
          className="h-10 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold self-start sm:self-auto"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded p-12 text-center text-sm text-[#5C5A55]">
          No contact messages match the selected status.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => {
            const currentNotes = notesDraft[msg.id] ?? msg.admin_notes ?? '';
            return (
              <div key={msg.id} className="bg-white border border-[#E5E0D8] rounded p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-serif font-semibold text-[#141413]">{msg.subject}</h2>
                      <span
                        className={`text-xs font-semibold capitalize ${
                          msg.status === 'unread' ? 'text-[#8C4A27]' : 'text-[#5C5A55]'
                        }`}
                      >
                        · {msg.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#5C5A55]">
                      From <strong className="text-[#141413]">{msg.name}</strong> ({msg.email}) ·{' '}
                      <span className="font-mono tabular-nums">{msg.created_at.split('T')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={msg.status}
                      onChange={async (e) => {
                        const ok = await updateContactMessage(msg.id, {
                          status: e.target.value as ContactMessageStatus,
                        });
                        if (ok) {
                          toast.success('Message status updated.');
                          onRefresh();
                        }
                      }}
                      className="h-9 px-2.5 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs font-semibold"
                    >
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(msg)}
                      className="p-2 text-[#991B1B] hover:bg-[#FEF2F2] rounded cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[#2A2927] leading-relaxed bg-[#FAF8F5] p-4 rounded border border-[#E5E0D8]">
                  {msg.message}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={currentNotes}
                    onChange={(e) => setNotesDraft((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                    placeholder="Internal editorial notes (only visible to admin/editors)..."
                    className="flex-1 h-9 px-3 bg-[#FAF8F5] border border-[#D6CEBE] rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await updateContactMessage(msg.id, {
                        admin_notes: currentNotes,
                      });
                      if (ok) {
                        toast.success('Admin notes saved.');
                        onRefresh();
                      } else {
                        toast.error('Failed to save admin notes.');
                      }
                    }}
                    className="h-9 px-4 bg-[#1E3A5F] text-white text-xs font-semibold rounded cursor-pointer whitespace-nowrap"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Contact Message"
        description={`Delete message "${deleteTarget?.subject || ''}" from ${deleteTarget?.name || ''}?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const ok = await deleteContactMessage(deleteTarget.id);
          setDeleteTarget(null);
          if (ok) {
            toast.success('Message deleted.');
            onRefresh();
          } else {
            toast.error('Failed to delete message.');
          }
        }}
      />
    </div>
  );
}
