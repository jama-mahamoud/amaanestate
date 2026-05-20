import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SubCategory {
  title: string;
  path: string;
}

interface HorizontalScrollRowProps {
  title: string;
  subCategories: SubCategory[];
}

export default function HorizontalScrollRow({ title, subCategories }: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth / 2;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group py-6">
      <h3 className="text-xl font-display font-bold text-white mb-4">{title}</h3>
      <div className="relative flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 z-10 bg-luxury-black/80 text-white hover:text-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft />
        </Button>
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-8 py-2"
        >
          {subCategories.map((sub, i) => (
            <Link 
              key={i} 
              to={sub.path}
              className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-full text-sm font-medium whitespace-nowrap transition-colors"
            >
              {sub.title}
            </Link>
          ))}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-0 z-10 bg-luxury-black/80 text-white hover:text-luxury-gold opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
