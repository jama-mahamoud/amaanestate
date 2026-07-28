import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, ChevronUp, ChevronDown, Link2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorialReview } from '@/services/reviewService';

interface AffiliateCenterWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange: (field: keyof EditorialReview, value: any) => void;
}

export interface DynamicAffiliateButton {
  id: string;
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
}

export function AffiliateCenterWorkspace({ form, handleFieldChange }: AffiliateCenterWorkspaceProps) {
  // Parse existing buttons from review record
  const parseButtonsFromForm = (): DynamicAffiliateButton[] => {
    // 1. Check affiliateNetworks
    if (Array.isArray(form.affiliateNetworks) && form.affiliateNetworks.length > 0) {
      return form.affiliateNetworks.map((item, idx) => {
        let style: 'primary' | 'secondary' | 'outline' = 'secondary';
        if (item.style === 'primary' || item.style === 'secondary' || item.style === 'outline') {
          style = item.style;
        } else if (idx === 0) {
          style = 'primary';
        }
        return {
          id: item.id || `btn_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          label: item.name || '',
          url: item.url || '',
          style
        };
      });
    }

    // 2. Check ctaButtons
    if (Array.isArray(form.ctaButtons) && form.ctaButtons.length > 0) {
      return form.ctaButtons.map((btn, idx) => {
        let style: 'primary' | 'secondary' | 'outline' = 'secondary';
        if (btn.style === 'outline-gold' || btn.style === 'minimal-border' || (btn.style as string) === 'outline') {
          style = 'outline';
        } else if (btn.style === 'solid-blue' || (btn.style as string) === 'primary' || idx === 0) {
          style = 'primary';
        }
        return {
          id: `btn_${idx}_${Math.random().toString(36).substring(2, 7)}`,
          label: btn.text || '',
          url: btn.url || '',
          style
        };
      });
    }

    // 3. Check single affiliateUrl / ctaButtonText
    if (form.affiliateUrl || form.ctaButtonText) {
      return [
        {
          id: `btn_primary`,
          label: form.ctaButtonText || '',
          url: form.affiliateUrl || '',
          style: 'primary'
        }
      ];
    }

    // 4. Default: No buttons preloaded!
    return [];
  };

  const [buttons, setButtons] = useState<DynamicAffiliateButton[]>(parseButtonsFromForm);

  // Re-sync local state if form item ID changes
  useEffect(() => {
    setButtons(parseButtonsFromForm());
  }, [form.id]);

  const syncToForm = (newList: DynamicAffiliateButton[]) => {
    setButtons(newList);

    // Save to affiliateNetworks
    const networks = newList.map((b, idx) => ({
      id: b.id,
      network: 'Custom',
      name: b.label,
      url: b.url,
      style: b.style,
      isPrimary: idx === 0
    }));
    handleFieldChange('affiliateNetworks', networks);

    // Save to ctaButtons
    const ctaButtons = newList.map(b => ({
      text: b.label,
      url: b.url,
      style: b.style === 'primary' ? 'solid-blue' : b.style === 'outline' ? 'minimal-border' : 'solid-gold'
    }));
    handleFieldChange('ctaButtons', ctaButtons);

    // Save primary affiliateUrl & ctaButtonText
    const primary = newList[0];
    handleFieldChange('affiliateUrl', primary?.url || '');
    if (primary?.label) {
      handleFieldChange('ctaButtonText', primary.label);
    }
  };

  const handleAddButton = () => {
    const newBtn: DynamicAffiliateButton = {
      id: `btn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label: '',
      url: '',
      style: buttons.length === 0 ? 'primary' : 'secondary'
    };
    const updated = [...buttons, newBtn];
    syncToForm(updated);
  };

  const handleUpdate = (index: number, key: keyof DynamicAffiliateButton, value: any) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], [key]: value };
    syncToForm(updated);
  };

  const handleDelete = (index: number) => {
    const updated = [...buttons];
    updated.splice(index, 1);
    syncToForm(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= buttons.length) return;
    const updated = [...buttons];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    syncToForm(updated);
  };

  return (
    <div className="space-y-6">
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Link2 size={16} /> 6. Affiliate & CTA Buttons
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Configure custom call-to-action buttons for this review. Each review manages its own buttons independently.
            </p>
          </div>
          <Button
            onClick={handleAddButton}
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold h-9 px-4 rounded-xl text-xs shrink-0 shadow-md shadow-amber-500/20"
          >
            <Plus size={15} className="mr-1.5" /> Add Button
          </Button>
        </div>

        {buttons.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/[0.01] space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Link2 size={18} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm font-medium text-white">No Affiliate Buttons Added</h4>
              <p className="text-xs text-white/40 leading-relaxed">
                Add destination links such as "Visit Official Website", "Buy Now", "Start Free Trial", or "View Pricing".
              </p>
            </div>
            <Button
              onClick={handleAddButton}
              variant="outline"
              size="sm"
              className="mt-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs rounded-xl"
            >
              <Plus size={14} className="mr-1.5" /> Add First Button
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {buttons.map((btn, index) => (
              <div
                key={btn.id}
                className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-4 relative group transition-all hover:border-white/20"
              >
                {/* Header bar of individual button card */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      Button #{index + 1}
                    </span>
                    {index === 0 && (
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold uppercase">
                        Primary CTA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder up / down */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20"
                      title="Move Up"
                    >
                      <ChevronUp size={15} />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={index === buttons.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20"
                      title="Move Down"
                    >
                      <ChevronDown size={15} />
                    </Button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {/* Delete button */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(index)}
                      className="w-7 h-7 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/20"
                      title="Delete Button"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Button Label */}
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-medium text-white/80 block">
                      Button Label
                    </label>
                    <Input
                      placeholder="e.g. Visit Official Website, Buy Now, Download..."
                      className="bg-black/40 border-white/10 h-10 text-xs text-white placeholder:text-white/20 focus:border-amber-500/50"
                      value={btn.label}
                      onChange={(e) => handleUpdate(index, 'label', e.target.value)}
                    />
                  </div>

                  {/* Destination URL */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-medium text-white/80 block">
                      Destination URL
                    </label>
                    <div className="relative">
                      <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                      <Input
                        placeholder="https://example.com/affiliate-link"
                        className="bg-black/40 border-white/10 pl-8 h-10 text-xs text-white font-mono placeholder:text-white/20 focus:border-amber-500/50"
                        value={btn.url}
                        onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Button Style selector */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-xs font-medium text-white/80 block">
                      Button Style
                    </label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdate(index, 'style', 'primary')}
                        className={`text-[11px] py-1.5 rounded-lg font-medium transition-all ${
                          btn.style === 'primary'
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(index, 'style', 'secondary')}
                        className={`text-[11px] py-1.5 rounded-lg font-medium transition-all ${
                          btn.style === 'secondary'
                            ? 'bg-amber-500 text-black font-semibold shadow-sm'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Secondary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(index, 'style', 'outline')}
                        className={`text-[11px] py-1.5 rounded-lg font-medium transition-all ${
                          btn.style === 'outline'
                            ? 'bg-white/15 text-white font-semibold border border-white/20'
                            : 'text-white/50 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        Outline
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Button Preview inside editor */}
                <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-white/40">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                    Live Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold ${
                        btn.style === 'primary'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : btn.style === 'secondary'
                          ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                          : 'border border-white/30 text-white hover:bg-white/10'
                      }`}
                    >
                      {btn.label || 'Unlabeled Button'} <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helpful hints section footer */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3 text-xs text-white/50">
          <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white/80 block">Editorial Best Practices</span>
            <p className="leading-relaxed text-[11px]">
              The top button (#1) serves as the primary call-to-action on the editorial review hero and sticky sidebar. Secondary buttons appear as additional direct merchant links throughout the review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
