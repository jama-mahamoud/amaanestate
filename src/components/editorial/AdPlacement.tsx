import React, { useEffect, useState } from 'react';
import { getSiteSettings } from '../../services/editorialService';
import { SiteSettings } from '../../types';

interface AdPlacementProps {
  slotName: string;
  format?: 'leaderboard' | 'inline';
}

export default function AdPlacement({ slotName, format = 'leaderboard' }: AdPlacementProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(() => {});
  }, []);

  const enabled = settings?.adsense_enabled && settings?.adsense_client_id;

  return (
    <aside
      aria-label="Advertisement"
      className={`w-full border border-[#E5E0D8] bg-[#F4F1EB] rounded px-4 py-3 text-center ${
        format === 'leaderboard' ? 'min-h-[96px]' : 'min-h-[112px]'
      } flex flex-col items-center justify-center`}
    >
      <span className="text-[11px] uppercase tracking-widest text-[#7A7770] font-medium mb-1">
        Advertisement
      </span>
      {enabled ? (
        <div className="w-full flex items-center justify-center text-xs text-[#5C5A55] font-mono">
          {/* Google AdSense unit slot ready for script initialization */}
          <ins
            className="adsbygoogle block w-full"
            data-ad-client={settings?.adsense_client_id}
            data-ad-slot={slotName}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <p className="text-xs text-[#7A7770]">
          Reserved Sponsorship Slot · Configure Google AdSense in Editorial Settings
        </p>
      )}
    </aside>
  );
}
