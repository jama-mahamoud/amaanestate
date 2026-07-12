import { useState } from 'react';
import { User, Shield, Bell, Save, Download, Copy, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmaanEstateLogo } from '../../components/brand/AmaanEstateLogo';

export default function DashboardSettings() {
  const [selectedVariant, setSelectedVariant] = useState<'horizontal' | 'stacked' | 'icon'>('horizontal');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'black' | 'white'>('dark');
  const [copied, setCopied] = useState(false);

  // Map variants and themes to their exact file paths in /public/brand/
  const getAssetFilename = (variant: string, theme: string) => {
    if (variant === 'icon') {
      if (theme === 'black') return 'amaan_estate_icon_black.svg';
      if (theme === 'white') return 'amaan_estate_icon_white.svg';
      return 'amaan_estate_icon.svg'; // Light/dark share the main full color icon
    }
    return `amaan_estate_${variant}_${theme}.svg`;
  };

  const activeFilename = getAssetFilename(selectedVariant, selectedTheme);
  const activeAssetPath = `/brand/${activeFilename}`;

  const handleCopySVGCode = () => {
    // Exact inline SVG definitions matching our static assets
    const svgDatabase = {
      'icon-dark': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-icon)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" />
  <circle cx="50" cy="14" r="3" fill="#06B6D4" />
  <circle cx="81" cy="32" r="3" fill="#2563EB" />
  <circle cx="81" cy="68" r="3" fill="#06B6D4" />
  <circle cx="50" cy="86" r="3" fill="#2563EB" />
  <circle cx="19" cy="68" r="3" fill="#06B6D4" />
  <circle cx="19" cy="32" r="3" fill="#2563EB" />
  <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-icon)" />
  <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#0F172A" stroke-width="1.5" />
  <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-icon)" stroke-width="1.5" stroke-linecap="round" />
</svg>`,
      'icon-light': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-icon)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" />
  <circle cx="50" cy="14" r="3" fill="#06B6D4" />
  <circle cx="81" cy="32" r="3" fill="#2563EB" />
  <circle cx="81" cy="68" r="3" fill="#06B6D4" />
  <circle cx="50" cy="86" r="3" fill="#2563EB" />
  <circle cx="19" cy="68" r="3" fill="#06B6D4" />
  <circle cx="19" cy="32" r="3" fill="#2563EB" />
  <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-icon)" />
  <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#0F172A" stroke-width="1.5" />
  <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-icon)" stroke-width="1.5" stroke-linecap="round" />
</svg>`,
      'icon-black': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
  <circle cx="50" cy="14" r="3" fill="#000000" />
  <circle cx="81" cy="32" r="3" fill="#000000" />
  <circle cx="81" cy="68" r="3" fill="#000000" />
  <circle cx="50" cy="86" r="3" fill="#000000" />
  <circle cx="19" cy="68" r="3" fill="#000000" />
  <circle cx="19" cy="32" r="3" fill="#000000" />
  <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#000000" />
  <circle cx="50" cy="53" r="5.5" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" />
  <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
</svg>`,
      'icon-white': `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
  <circle cx="50" cy="14" r="3" fill="#FFFFFF" />
  <circle cx="81" cy="32" r="3" fill="#FFFFFF" />
  <circle cx="81" cy="68" r="3" fill="#FFFFFF" />
  <circle cx="50" cy="86" r="3" fill="#FFFFFF" />
  <circle cx="19" cy="68" r="3" fill="#FFFFFF" />
  <circle cx="19" cy="32" r="3" fill="#FFFFFF" />
  <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#FFFFFF" />
  <circle cx="50" cy="53" r="5.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
  <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
</svg>`,
      'horizontal-light': `<svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-hz-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <g transform="translate(2.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-hz-light)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.25" />
    <circle cx="50" cy="14" r="3" fill="#06B6D4" />
    <circle cx="81" cy="32" r="3" fill="#2563EB" />
    <circle cx="81" cy="68" r="3" fill="#06B6D4" />
    <circle cx="50" cy="86" r="3" fill="#2563EB" />
    <circle cx="19" cy="68" r="3" fill="#06B6D4" />
    <circle cx="19" cy="32" r="3" fill="#2563EB" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-hz-light)" />
    <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#FFFFFF" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-hz-light)" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <text x="84" y="47" fill="#0F172A" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.02em">Amaan</text>
  <text x="166" y="47" fill="#2563EB" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="400" letter-spacing="-0.01em">Estate</text>
  <text x="85" y="64" fill="#64748B" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" letter-spacing="0.22em">TECH PUBLICATION</text>
</svg>`,
      'horizontal-dark': `<svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-hz-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="amaan-glow-hz-dark" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0" />
    </linearGradient>
  </defs>
  <g transform="translate(2.5, 2.5) scale(0.75)">
    <circle cx="50" cy="50" r="45" fill="url(#amaan-glow-hz-dark)" />
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-hz-dark)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" />
    <circle cx="50" cy="14" r="3" fill="#06B6D4" />
    <circle cx="81" cy="32" r="3" fill="#2563EB" />
    <circle cx="81" cy="68" r="3" fill="#06B6D4" />
    <circle cx="50" cy="86" r="3" fill="#2563EB" />
    <circle cx="19" cy="68" r="3" fill="#06B6D4" />
    <circle cx="19" cy="32" r="3" fill="#2563EB" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-hz-dark)" />
    <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#0F172A" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-hz-dark)" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <text x="84" y="47" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.02em">Amaan</text>
  <text x="166" y="47" fill="#06B6D4" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="400" letter-spacing="-0.01em">Estate</text>
  <text x="85" y="64" fill="rgba(255,255,255,0.4)" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" letter-spacing="0.22em">TECH PUBLICATION</text>
</svg>`,
      'horizontal-black': `<svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(2.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
    <circle cx="50" cy="14" r="3" fill="#000000" />
    <circle cx="81" cy="32" r="3" fill="#000000" />
    <circle cx="81" cy="68" r="3" fill="#000000" />
    <circle cx="50" cy="86" r="3" fill="#000000" />
    <circle cx="19" cy="68" r="3" fill="#000000" />
    <circle cx="19" cy="32" r="3" fill="#000000" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#000000" />
    <circle cx="50" cy="53" r="5.5" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <text x="84" y="47" fill="#000000" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.02em">Amaan</text>
  <text x="166" y="47" fill="#000000" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="400" letter-spacing="-0.01em">Estate</text>
  <text x="85" y="64" fill="#000000" opacity="0.6" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" letter-spacing="0.22em">TECH PUBLICATION</text>
</svg>`,
      'horizontal-white': `<svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(2.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
    <circle cx="50" cy="14" r="3" fill="#FFFFFF" />
    <circle cx="81" cy="32" r="3" fill="#FFFFFF" />
    <circle cx="81" cy="68" r="3" fill="#FFFFFF" />
    <circle cx="50" cy="86" r="3" fill="#FFFFFF" />
    <circle cx="19" cy="68" r="3" fill="#FFFFFF" />
    <circle cx="19" cy="32" r="3" fill="#FFFFFF" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#FFFFFF" />
    <circle cx="50" cy="53" r="5.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <text x="84" y="47" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="800" letter-spacing="-0.02em">Amaan</text>
  <text x="166" y="47" fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="24" font-weight="400" letter-spacing="-0.01em">Estate</text>
  <text x="85" y="64" fill="#FFFFFF" opacity="0.6" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="700" letter-spacing="0.22em">TECH PUBLICATION</text>
</svg>`,
      'stacked-light': `<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-st-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
  </defs>
  <g transform="translate(62.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-st-light)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.25" />
    <circle cx="50" cy="14" r="3" fill="#06B6D4" />
    <circle cx="81" cy="32" r="3" fill="#2563EB" />
    <circle cx="81" cy="68" r="3" fill="#06B6D4" />
    <circle cx="50" cy="86" r="3" fill="#2563EB" />
    <circle cx="19" cy="68" r="3" fill="#06B6D4" />
    <circle cx="19" cy="32" r="3" fill="#2563EB" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-st-light)" />
    <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#FFFFFF" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-st-light)" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g transform="translate(100, 104)">
    <text fill="#0F172A" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="-0.02em" text-anchor="end" x="-3">Amaan</text>
    <text fill="#2563EB" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="400" letter-spacing="-0.01em" text-anchor="start" x="3">Estate</text>
  </g>
  <text x="100" y="122" fill="#64748B" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" letter-spacing="0.18em" text-anchor="middle">TECH PUBLICATION</text>
</svg>`,
      'stacked-dark': `<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="amaan-grad-st-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <linearGradient id="amaan-glow-st-dark" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0" />
    </linearGradient>
  </defs>
  <g transform="translate(62.5, 2.5) scale(0.75)">
    <circle cx="50" cy="50" r="45" fill="url(#amaan-glow-st-dark)" />
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="url(#amaan-grad-st-dark)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.35" />
    <circle cx="50" cy="14" r="3" fill="#06B6D4" />
    <circle cx="81" cy="32" r="3" fill="#2563EB" />
    <circle cx="81" cy="68" r="3" fill="#06B6D4" />
    <circle cx="50" cy="86" r="3" fill="#2563EB" />
    <circle cx="19" cy="68" r="3" fill="#06B6D4" />
    <circle cx="19" cy="32" r="3" fill="#2563EB" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="url(#amaan-grad-st-dark)" />
    <circle cx="50" cy="53" r="5.5" fill="#06B6D4" stroke="#0F172A" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="url(#amaan-grad-st-dark)" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g transform="translate(100, 104)">
    <text fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="-0.02em" text-anchor="end" x="-3">Amaan</text>
    <text fill="#06B6D4" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="400" letter-spacing="-0.01em" text-anchor="start" x="3">Estate</text>
  </g>
  <text x="100" y="122" fill="rgba(255,255,255,0.4)" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" letter-spacing="0.18em" text-anchor="middle">TECH PUBLICATION</text>
</svg>`,
      'stacked-black': `<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(62.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#000000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
    <circle cx="50" cy="14" r="3" fill="#000000" />
    <circle cx="81" cy="32" r="3" fill="#000000" />
    <circle cx="81" cy="68" r="3" fill="#000000" />
    <circle cx="50" cy="86" r="3" fill="#000000" />
    <circle cx="19" cy="68" r="3" fill="#000000" />
    <circle cx="19" cy="32" r="3" fill="#000000" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#000000" />
    <circle cx="50" cy="53" r="5.5" fill="#000000" stroke="#FFFFFF" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#000000" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g transform="translate(100, 104)">
    <text fill="#000000" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="-0.02em" text-anchor="end" x="-3">Amaan</text>
    <text fill="#000000" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="400" letter-spacing="-0.01em" text-anchor="start" x="3">Estate</text>
  </g>
  <text x="100" y="122" fill="#000000" opacity="0.6" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" letter-spacing="0.18em" text-anchor="middle">TECH PUBLICATION</text>
</svg>`,
      'stacked-white': `<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(62.5, 2.5) scale(0.75)">
    <path d="M 50,14 L 81,32 L 81,68 L 50,86 L 19,68 L 19,32 Z" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.4" />
    <circle cx="50" cy="14" r="3" fill="#FFFFFF" />
    <circle cx="81" cy="32" r="3" fill="#FFFFFF" />
    <circle cx="81" cy="68" r="3" fill="#FFFFFF" />
    <circle cx="50" cy="86" r="3" fill="#FFFFFF" />
    <circle cx="19" cy="68" r="3" fill="#FFFFFF" />
    <circle cx="19" cy="32" r="3" fill="#FFFFFF" />
    <path d="M 33,68 L 46,30 C 47.2,26.5 52.8,26.5 54,30 L 67,68 L 59.5,68 L 50,40.5 L 40.5,68 Z" fill="#FFFFFF" />
    <circle cx="50" cy="53" r="5.5" fill="#FFFFFF" stroke="#000000" stroke-width="1.5" />
    <path d="M 38,53 L 44.5,53 M 55.5,53 L 62,53" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" />
  </g>
  <g transform="translate(100, 104)">
    <text fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="-0.02em" text-anchor="end" x="-3">Amaan</text>
    <text fill="#FFFFFF" font-family="'Inter', system-ui, sans-serif" font-size="18" font-weight="400" letter-spacing="-0.01em" text-anchor="start" x="3">Estate</text>
  </g>
  <text x="100" y="122" fill="#FFFFFF" opacity="0.6" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700" letter-spacing="0.18em" text-anchor="middle">TECH PUBLICATION</text>
</svg>`
    };

    const searchKey = `${selectedVariant}-${selectedTheme}`;
    const svgContent = svgDatabase[searchKey] || svgDatabase[`icon-${selectedTheme}`] || svgDatabase['horizontal-dark'];

    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">System <span className="text-white/20">Config</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Institutional Preference & Security Matrix</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500">
          <Save size={18} className="mr-3" /> Synchronize Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-8 space-y-12">
           
           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <User size={20} />
                 </div>
                 <h3 className="text-2xl font-display font-bold tracking-tight">Principal Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Authorized Full Name</label>
                    <Input placeholder="Enter Identity Name" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Secure Email Endpoint</label>
                    <Input placeholder="email@amaanestate.com" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Geographic Assignment</label>
                    <Input placeholder="Assign Operational Region" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Institutional Title</label>
                    <Input placeholder="Designate Rank" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
              </div>
           </section>

           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <Shield size={20} />
                 </div>
                 <h3 className="text-2xl font-display font-bold tracking-tight">Security Cryptography</h3>
              </div>
              
              <div className="space-y-10">
                 <div className="flex items-center justify-between p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-base font-bold text-white tracking-tight">Multi-Factor Authentication</p>
                       <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Additional biometric and token verification required</p>
                    </div>
                    <div className="w-12 h-6 bg-luxury-gold rounded-full relative p-1 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-luxury-black rounded-full" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-base font-bold text-white tracking-tight">Encryption Key Rotation</p>
                       <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Automatic generation and deployment of new security keys every 30 days</p>
                    </div>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
                    </div>
                 </div>
                 
                 <div className="pt-6">
                    <Button variant="outline" className="border-white/5 bg-white/5 text-white hover:bg-white/10 h-16 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                      Modify Security Blueprint
                    </Button>
                 </div>
              </div>
           </section>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-12">
           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <Bell size={18} />
                 </div>
                 <h3 className="text-xl font-display font-bold tracking-tight">Protocol Logs</h3>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Asset Acquisitions', active: true },
                  { label: 'Market Fluctuations', active: true },
                  { label: 'System Announcements', active: false },
                  { label: 'Identity Reports', active: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-luxury-gold' : 'bg-white/5'}`} />
                  </div>
                ))}
              </div>
           </section>

           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden border-destructive/20 bg-destructive/[0.02]">
              <h3 className="text-xl font-display font-bold text-destructive mb-4 tracking-tight">Danger Zone</h3>
              <p className="text-white/30 text-xs font-light mb-8 leading-relaxed">Irreversible institutional account removal and asset de-registration.</p>
              <Button variant="outline" className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px]">
                 Decommission Identity
              </Button>
           </section>
        </div>

        {/* Brand Asset Center: Single-click preview and download of requested deliverables */}
        <div className="lg:col-span-12">
          <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[120px] rounded-full" />
            
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400">
                <Palette size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold tracking-tight">AmaanEstate Brand Asset Kit</h3>
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-1">Official High-Definition Identity Deliverables</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Selector Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Variant Selector */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white/20 ml-1 block">Logo Structure</span>
                  <div className="grid grid-cols-3 gap-2 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                    {(['horizontal', 'stacked', 'icon'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedVariant === v
                            ? 'bg-white/10 text-white shadow-lg'
                            : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black text-white/20 ml-1 block">Color Scheme</span>
                  <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                    {(['dark', 'light', 'black', 'white'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTheme(t)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedTheme === t
                            ? 'bg-white/10 text-white shadow-lg border border-white/10'
                            : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metadata & Asset details */}
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30">Active Asset:</span>
                    <span className="font-mono text-cyan-400 font-bold">{activeFilename}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30">Resolution:</span>
                    <span className="text-white/70 font-medium">Scalable Vector (.SVG)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30">Suitability:</span>
                    <span className="text-white/70 font-medium capitalize">
                      {selectedTheme === 'dark' && 'Dark Interfaces / Backgrounds'}
                      {selectedTheme === 'light' && 'Documents, Invoices, Light Themes'}
                      {selectedTheme === 'black' && 'Solid Monochrome High-Contrast'}
                      {selectedTheme === 'white' && 'Overlay layouts / Dark print sheets'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Dynamic Presentation Preview */}
              <div className="lg:col-span-8 flex flex-col justify-between p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative group min-h-[300px]">
                
                {/* Backing Pattern */}
                <div className="absolute inset-0 bg-radial-grid opacity-10" />
                
                {/* Visual Frame wrapper with appropriate color background to demonstrate true context */}
                <div 
                  className={`flex-grow flex items-center justify-center p-12 rounded-3xl transition-all duration-500 shadow-inner overflow-hidden ${
                    selectedTheme === 'light' || selectedTheme === 'black'
                      ? 'bg-[#F8FAFC]' 
                      : 'bg-[#0B0F19]'
                  }`}
                >
                  <AmaanEstateLogo
                    variant={selectedVariant}
                    theme={selectedTheme}
                    height={selectedVariant === 'icon' ? 120 : selectedVariant === 'stacked' ? 140 : 100}
                    width="auto"
                  />
                </div>

                {/* Live Controls */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  
                  {/* Download Static Asset link */}
                  <a
                    href={activeAssetPath}
                    download={activeFilename}
                    className="flex-grow inline-flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-14 rounded-2xl transition-all shadow-lg shadow-cyan-600/10 text-xs uppercase tracking-widest focus:outline-none"
                  >
                    <Download size={16} />
                    Download Vector Asset (.SVG)
                  </a>

                  {/* Copy Inline Markup */}
                  <button
                    onClick={handleCopySVGCode}
                    className="flex-grow inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold h-14 rounded-2xl border border-white/5 transition-all text-xs uppercase tracking-widest focus:outline-none"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy SVG Code
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
