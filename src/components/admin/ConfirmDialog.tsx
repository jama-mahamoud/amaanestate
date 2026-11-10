import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm Delete',
  destructive = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-[#E5E0D8] rounded-md w-full max-w-md p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center text-[#991B1B] shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="space-y-1">
              <h3 id="confirm-dialog-title" className="text-lg font-serif font-semibold text-[#141413]">
                {title}
              </h3>
              <p className="text-sm text-[#5C5A55] leading-relaxed">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation"
            className="p-1.5 text-[#5C5A55] hover:text-[#141413] rounded cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E0D8]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#141413] text-xs font-semibold rounded cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white text-xs font-semibold rounded cursor-pointer whitespace-nowrap disabled:opacity-60 ${
              destructive ? 'bg-[#991B1B] hover:bg-[#7F1D1D]' : 'bg-[#1E3A5F] hover:bg-[#162C49]'
            }`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
