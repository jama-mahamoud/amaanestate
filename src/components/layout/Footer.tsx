import { Link } from 'react-router-dom';
import { 
  Facebook, Instagram, MessageCircle, Music2
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
            <div className="flex gap-3 pt-2">
              {[
                { Icon: Facebook, url: 'https://web.facebook.com/profile.php?id=61560833697279' },
                { Icon: Instagram, url: 'https://instagram.com/primedeals' },
                { Icon: Music2, url: 'https://www.tiktok.com/@momentumforsuccesstv' },
                { Icon: MessageCircle, url: 'https://wa.me/251910012794' }
              ].map(({ Icon, url }, i) => (
                <a 
                  key={i} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 outline-none"
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
