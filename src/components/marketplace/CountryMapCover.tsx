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
      className={`relative aspect-[16/9] w-full overflow-hidden border-b border-[#1E3A5F]/20 bg-[#0A182B] ${className}`}
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
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0A182B]/60 to-transparent"
          />
        </>
      ) : (
        <div
          aria-label={`Cartographic placeholder for ${countryName}`}
          className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-4 text-center bg-[#0A182B] bg-[linear-gradient(to_right,rgba(201,164,92,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,164,92,0.06)_1px,transparent_1px)] bg-[size:24px_24px]"
        >
          <Globe2 size={24} strokeWidth={1.35} className="text-[#C9A45C]/80" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#EADBBA]">
            {countryName}
          </span>
        </div>
      )}
    </div>
  );
}
