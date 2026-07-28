import React from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditorialReview } from '@/services/reviewService';

interface AffiliateCenterWorkspaceProps {
  form: Partial<EditorialReview>;
  handleFieldChange: (field: keyof EditorialReview, value: any) => void;
}

const BUTTON_PRESETS = [
  'Buy Now',
  'Visit Website',
  'Download',
  'Get Deal',
  'Start Free Trial'
];

export function AffiliateCenterWorkspace({ form, handleFieldChange }: AffiliateCenterWorkspaceProps) {
  // Map form.affiliateNetworks into list of buttons
  const buttonsList = (form.affiliateNetworks && form.affiliateNetworks.length > 0)
    ? form.affiliateNetworks.map(item => ({
        id: item.id || `btn_${Math.random()}`,
        name: item.name || 'Buy Now',
        url: item.url || ''
      }))
    : [
        {
          id: 'primary',
          name: 'Buy Now',
          url: form.affiliateUrl || ''
        }
      ];

  const syncButtonsToForm = (list: typeof buttonsList) => {
    // Convert to affiliateNetworks structure for backend compatibility
    const networks = list.map((b, idx) => ({
      id: b.id,
      network: 'Custom',
      name: b.name,
      url: b.url,
      price: '',
      isPrimary: idx === 0
    }));

    handleFieldChange('affiliateNetworks', networks);
    
    // Set main affiliateUrl to first button URL
    const primaryUrl = list[0]?.url || '';
    handleFieldChange('affiliateUrl', primaryUrl);
  };

  const addButton = () => {
    const updated = [
      ...buttonsList,
      {
        id: `btn_${Date.now()}`,
        name: 'Visit Website',
        url: ''
      }
    ];
    syncButtonsToForm(updated);
  };

  const updateButtonItem = (index: number, key: 'name' | 'url', value: string) => {
    const updated = [...buttonsList];
    updated[index] = { ...updated[index], [key]: value };
    syncButtonsToForm(updated);
  };

  const removeButtonItem = (index: number) => {
    if (buttonsList.length <= 1) {
      // Don't allow removing the last button, just clear it
      const updated = [{ id: 'primary', name: 'Buy Now', url: '' }];
      syncButtonsToForm(updated);
      return;
    }
    const updated = [...buttonsList];
    updated.splice(index, 1);
    syncButtonsToForm(updated);
  };

  return (
    <div className="space-y-6">
      {/* 6. Affiliate Links */}
      <section className="bg-[#08080c] rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            6. Affiliate Links
          </h3>
          <Button onClick={addButton} size="sm" className="bg-amber-600 hover:bg-amber-500 text-black font-semibold h-8 px-3 rounded-lg text-xs">
            <Plus size={14} className="mr-1" /> Add Button
          </Button>
        </div>

        <div className="space-y-4">
          {buttonsList.map((btn, index) => (
            <div key={btn.id || index} className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                  Button #{index + 1}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeButtonItem(index)}
                  className="w-7 h-7 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Button Text</label>
                  <Input
                    placeholder="e.g. Buy Now, Visit Website"
                    className="bg-black/30 border-white/10 h-10 text-xs text-white"
                    value={btn.name}
                    onChange={(e) => updateButtonItem(index, 'name', e.target.value)}
                  />
                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {BUTTON_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateButtonItem(index, 'name', preset)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                          btn.name === preset
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-white/40 border-white/5 hover:text-white'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/70">URL</label>
                  <div className="relative">
                    <ExternalLink size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <Input
                      placeholder="https://..."
                      className="bg-black/30 border-white/10 pl-8 h-10 text-xs text-white font-mono"
                      value={btn.url}
                      onChange={(e) => updateButtonItem(index, 'url', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
