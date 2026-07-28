import React from 'react';
import { Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorialReview } from '@/services/reviewService';

interface PublishCenterWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange?: (field: keyof EditorialReview, value: any) => void;
  handleSave: (statusOverride?: 'draft' | 'published') => Promise<void>;
  onRestoreSnapshot?: (snapshot: Partial<EditorialReview>) => void;
}

export function PublishCenterWorkspace({
  form,
  handleSave,
}: PublishCenterWorkspaceProps) {
  const isPublished = form.status === 'published';

  return (
    <div className="space-y-6">
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              7. Publish Review
            </h3>
            <p className="text-xs text-white/50">
              Reviews are updated immediately upon saving or publishing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60 font-medium">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
              isPublished 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
            }`}>
              {form.status || 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            className="h-11 px-6 rounded-xl border-white/10 text-white hover:bg-white/10 text-xs font-medium"
          >
            <Save size={15} className="mr-2 text-white/70" /> Save Draft
          </Button>

          <Button
            onClick={() => handleSave('published')}
            className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-lg shadow-blue-500/20"
          >
            <Send size={15} className="mr-2" /> Publish Review
          </Button>
        </div>
      </section>
    </div>
  );
}
