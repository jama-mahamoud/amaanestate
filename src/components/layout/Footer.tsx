import { Link } from 'react-router-dom';
import { 
  Facebook, Instagram, MessageCircle, Youtube, Linkedin, Music2
} from 'lucide-react';
import { BrandHeader } from '../brand/BrandHeader';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#050507] text-white pt-16 pb-12 relative overflow-hidden font-sans border-t border-white/5">
      {/* Subtle Visual Ambience Background Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[200px] pointer-events-none opacity-10 select-none">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#C5A059]/10 rounded-full filter blur-[80px] -translate-y-1/2" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        
        {/* Affiliate Disclosure Section (Subtle, Small, Professional) */}
        <div className="pb-10 mb-10 border-b border-white/5">
          <div className="max-w-4xl">
            <h4 className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold mb-2">Affiliate Disclosure</h4>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Some links on this website are affiliate links. If you purchase through them, we may earn a commission at no additional cost to you. Our editorial opinions remain independent and unbiased.{' '}
              <Link to="/disclaimer" className="text-[#C5A059] hover:underline hover:text-white transition-colors font-medium">
                Learn More
              </Link>
            </p>
          </div>
        </div>

        {/* 4 Responsive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-6">
            <BrandHeader size="md" />
            <p className="text-white/40 text-xs leading-relaxed max-w-sm">
              Amaan Reviews delivers trusted software reviews, AI tool analysis, technology insights, and expert buying guides.
            </p>
            {/* Social Icons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {[
                { 
                  Icon: Facebook, 
                  url: 'https://www.facebook.com/amaanestate',
                  name: 'Facebook',
                  className: 'border-[#1877F2]/20 bg-[#1877F2]/5 text-[#1877F2]/70 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:shadow-[0_0_12px_rgba(24,119,242,0.45)]'
                },
                { 
                  Icon: Instagram, 
                  url: 'https://instagram.com/amaanestate', 
                  name: 'Instagram',
                  className: 'border-[#E1306C]/20 bg-[#E1306C]/5 text-[#E1306C]/70 hover:bg-gradient-to-tr hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737] hover:border-transparent hover:text-white hover:shadow-[0_0_12px_rgba(225,48,108,0.45)]'
                },
                { 
                  Icon: Music2, 
                  url: 'https://www.tiktok.com/@amaanestate',
                  name: 'TikTok',
                  className: 'border-white/10 bg-white/5 text-white/70 hover:bg-[#010101] hover:border-transparent hover:text-white hover:shadow-[-2px_-2px_0px_#00F2FE,2px_2px_0px_#FE0979,0_0_12px_rgba(255,255,255,0.25)]'
                },
                { 
                  Icon: Youtube, 
                  url: 'https://www.youtube.com/@amaanestate',
                  name: 'YouTube',
                  className: 'border-[#FF0000]/20 bg-[#FF0000]/5 text-[#FF0000]/70 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white hover:shadow-[0_0_12px_rgba(255,0,0,0.45)]'
                },
                { 
                  Icon: Linkedin, 
                  url: 'https://www.linkedin.com/company/amaanestate',
                  name: 'LinkedIn',
                  className: 'border-[#0077B5]/20 bg-[#0077B5]/5 text-[#0077B5]/70 hover:bg-[#0077B5] hover:border-[#0077B5] hover:text-white hover:shadow-[0_0_12px_rgba(0,119,181,0.45)]'
                },
                { 
                  Icon: MessageCircle, 
                  url: 'https://wa.me/251910012794',
                  name: 'WhatsApp',
                  className: 'border-[#25D366]/20 bg-[#25D366]/5 text-[#25D366]/70 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white hover:shadow-[0_0_12px_rgba(37,211,102,0.45)]'
                }
              ].map(({ Icon, url, name, className }, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={name}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-105 outline-none ${className}`}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h3 className="font-display font-bold text-white tracking-widest uppercase text-[10px] mb-6">
              Categories
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'Software & Tools', path: '/software' },
                { name: 'Tech Gear', path: '/tech-gear' },
                { name: 'Reviews', path: '/reviews' },
                { name: 'News', path: '/news' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="font-display font-bold text-white tracking-widest uppercase text-[10px] mb-6">
              Company
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'About', path: '/about' },
                { name: 'Contact', path: '/contact' },
                { name: 'Become Contributor', path: '/contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-display font-bold text-white tracking-widest uppercase text-[10px] mb-6">
              Legal
            </h3>
            <ul className="space-y-3.5">
              {[
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Disclaimer', path: '/disclaimer' },
                { name: 'Affiliate Disclosure', path: '/disclaimer' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-white/50 hover:text-white transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/30 tracking-wider">
          <p>
            &copy; {currentYear} Amaan Reviews. All Rights Reserved.
          </p>
          <p className="font-medium text-white/40">
            Made with professionalism and transparency.
          </p>
        </div>

      </div>
    </footer>
  );
}
