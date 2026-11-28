import React, { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';

interface CountryFlagProps {
  code?: string | null;
  className?: string;
  fallbackSize?: number;
  fallbackClassName?: string;
}

export default function CountryFlag({
  code,
  className = 'w-4 h-3 rounded-[2px] ring-1 ring-black/15 shrink-0',
  fallbackSize = 14,
  fallbackClassName = 'text-[#8C4A27] shrink-0',
}: CountryFlagProps) {
  const iso = (code || '').trim().toLowerCase();
  const isValidIso = /^[a-z]{2}$/.test(iso);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [iso]);

  if (!isValidIso || failed) {
    return (
      <Globe2
        size={fallbackSize}
        className={fallbackClassName}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={`/flags/${iso}.svg`}
      alt=""
      aria-hidden="true"
      width={16}
      height={12}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`inline-block object-cover ${className}`}
    />
  );
}
