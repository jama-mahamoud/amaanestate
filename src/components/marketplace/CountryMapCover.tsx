import React, { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';
import { getCountryMapImageUrl } from '../../lib/globalMarkets';

interface CountryMapCoverProps {
  countryCode?: string | null;
  countryName: string;
  className?: string;
}

export default function CountryMapCover({
  countryCode,
  countryName,
  className = '',
}: CountryMapCoverProps) {
  const mapUrl = getCountryMapImageUrl(countryCode);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [mapUrl]);

  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden border-b border-[#E5E0D8] bg-[#F4EFE6] ${className}`}
    >
      {mapUrl && !failed ? (
        <>
          <img
            src={mapUrl}
            alt={`Geographic map outline of ${countryName}`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141413]/10 to-transparent"
          />
        </>
      ) : (
        <div
          aria-label={`Cartographic placeholder for ${countryName}`}
          className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center bg-[#F4EFE6] bg-[linear-gradient(to_right,rgba(30,58,95,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,58,95,0.06)_1px,transparent_1px)] bg-[size:28px_28px]"
        >
          <Globe2 size={28} strokeWidth={1.35} className="text-[#1E3A5F]/70" aria-hidden="true" />
          <span className="text-[11px] uppercase tracking-widest font-semibold text-[#5C5A55]">
            {countryName}
          </span>
        </div>
      )}
    </div>
  );
}
