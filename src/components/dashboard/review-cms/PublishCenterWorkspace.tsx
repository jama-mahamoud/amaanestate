import React, { useState } from 'react';
import { Calendar, Save, Send, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorialReview } from '@/services/reviewService';
import { toast } from 'sonner';

interface PublishCenterWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange: (field: keyof EditorialReview, value: any) => void;
  handleSave: (statusOverride?: 'draft' | 'published') => Promise<void>;
  onRestoreSnapshot: (snapshot: Partial<EditorialReview>) => void;
}

export function PublishCenterWorkspace({
  form,
  handleFieldChange,
  handleSave,
  onRestoreSnapshot,
}: PublishCenterWorkspaceProps) {
  const [snapshotNote, setSnapshotNote] = useState('');

  const history = form.revisionHistory || [];

  const handleSaveSnapshot = () => {
    const newRev = {
      id: `rev_${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: snapshotNote.trim() || 'Manual Revision Snapshot',
      snapshot: { ...form }
    };
    const updated = [newRev, ...history];
    handleFieldChange('revisionHistory', updated);
    setSnapshotNote('');
    toast.success('Revision snapshot saved!');
  };

  return (
    <div className="space-y-6">
      {/* 7. Publish & Status Actions */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            7. Publish Review
          </h3>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
            form.status === 'published' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
          }`}>
            Status: {form.status || 'Draft'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            className="h-10 px-5 rounded-xl border-white/10 text-white hover:bg-white/10 text-xs"
          >
            <Save size={14} className="mr-1.5" /> Save Draft
          </Button>

          <Button
            onClick={() => handleSave('published')}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20"
          >
            <Send size={14} className="mr-1.5" /> Publish Review
          </Button>
        </div>
      </section>

      {/* Schedule Publish */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 border-b border-white/5 pb-3 flex items-center gap-2">
          <Calendar size={14} /> Schedule Publish
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/70">Release Date</label>
            <Input
              type="date"
              className="bg-black/40 border-white/10 h-10 text-white text-xs"
              value={form.scheduledPublishDate || ''}
              onChange={(e) => handleFieldChange('scheduledPublishDate', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-white/70">Release Time</label>
            <Input
              type="time"
              className="bg-black/40 border-white/10 h-10 text-white text-xs"
              value={form.scheduledPublishTime || '12:00'}
              onChange={(e) => handleFieldChange('scheduledPublishTime', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-white/70">Timezone</label>
            <select
              className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs text-white outline-none focus:border-blue-500"
              value={form.timezone || 'UTC'}
              onChange={(e) => handleFieldChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
              <option value="CET">CET</option>
            </select>
          </div>
        </div>
      </section>

      {/* Revision History */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Revision History
          </h3>

          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Snapshot note..."
              className="bg-black/30 border-white/10 h-8 text-xs text-white flex-1 sm:w-56"
              value={snapshotNote}
              onChange={(e) => setSnapshotNote(e.target.value)}
            />
            <Button onClick={handleSaveSnapshot} size="sm" className="bg-white/10 hover:bg-white/20 text-white h-8 px-3 text-xs shrink-0">
              <Save size={12} className="mr-1" /> Save Snapshot
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {history.map((rev) => (
            <div key={rev.id} className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-white font-medium">{rev.note}</span>
                <span className="text-[10px] font-mono text-white/40 ml-2">({rev.timestamp})</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (window.confirm('Restore this snapshot? Current unsaved edits will be replaced.')) {
                    onRestoreSnapshot(rev.snapshot);
                    toast.success('Snapshot restored!');
                  }
                }}
                className="h-7 border-white/10 text-xs text-white hover:bg-blue-600/20 hover:border-blue-500/40"
              >
                <RotateCcw size={12} className="mr-1" /> Restore
              </Button>
            </div>
          ))}

          {history.length === 0 && (
            <div className="py-4 text-center border border-dashed border-white/10 rounded-xl text-white/30 text-xs font-mono">
              No saved revision snapshots.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
