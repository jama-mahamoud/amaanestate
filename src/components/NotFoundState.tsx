import { motion } from 'framer-motion';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NotFoundStateProps {
  title: string;
  description: string;
  backLink: string;
  backLabel: string;
}

export default function NotFoundState({ 
  title, 
  description, 
  backLink, 
  backLabel 
}: NotFoundStateProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-20">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-luxury-gold mb-8 border border-white/5"
      >
        <SearchX size={40} />
      </motion.div>
      <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tighter">{title}</h1>
      <p className="text-white/40 max-w-lg mb-12 text-lg font-light leading-relaxed">{description}</p>
      <Link to={backLink}>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-12 rounded-2xl font-bold transition-all duration-500 hover:-translate-y-1">
          <ArrowLeft size={20} className="mr-3" /> {backLabel}
        </Button>
      </Link>
    </div>
  );
}
