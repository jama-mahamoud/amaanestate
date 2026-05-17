import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MOCK_ARTICLES = {
  '1': {
    id: '1',
    title: 'The Real Estate Boom in Jigjiga: What Investors Need to Know',
    content: `
      <p>Jigjiga is witnessing an unprecedented transformation. As the administrative and economic hub of the Somali Region, the city has become a magnet for investment, infrastructure development, and luxury residential growth.</p>
      
      <p>In the last 24 months, land value in prime locations like the Airport Road and the Presidential Palace vicinity has appreciated by over 40%. This growth is driven by several key factors:</p>
      
      <h3>1. Urban Decentralization</h3>
      <p>New city plans are expanding the boundaries of Jigjiga, creating organized residential zones with wider roads and better drainage systems. These areas are attracting the diaspora and local elite who seek modern living standards.</p>
      
      <h3>2. Infrastructure Connectivity</h3>
      <p>The paving of primary inter-city roads and the expansion of utilities have unlocked previously inaccessible land plots, making them viable for high-end developments.</p>
      
      <h3>3. Transparency in Land Ownership</h3>
      <p>Regional efforts to digitize land registries have increased investor confidence, ensuring that "Amaan" (Trust) is backed by solid legal framework.</p>
      
      <p>For those looking to enter the market, we recommend focusing on 'G+1' and 'G+2' residential villas which currently see the highest demand and fastest rental yield turnover.</p>
    `,
    date: 'May 15, 2024',
    author: 'Mohamed Abdi',
    readTime: '5 min read',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200'
  }
};

export default function ArticleDetails() {
  const { id } = useParams();
  const article = MOCK_ARTICLES[id as keyof typeof MOCK_ARTICLES] || MOCK_ARTICLES['1'];

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Article Hero */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img src={article.image} className="w-full h-full object-cover" alt={article.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Badge className="bg-luxury-gold text-luxury-black border-0 mb-8 uppercase tracking-widest font-bold px-4 py-1.5">
                {article.category}
              </Badge>
              <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-8 tracking-tight leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm font-medium uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-luxury-gold" /> {article.date}</span>
                <span className="flex items-center gap-2"><User size={16} className="text-luxury-gold" /> BY {article.author}</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-luxury-gold" /> {article.readTime}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-12 py-6 border-y border-white/5">
             <Link to="/news" className="flex items-center gap-2 text-white/40 hover:text-luxury-gold transition-colors text-xs font-bold tracking-widest">
                <ArrowLeft size={14} /> BACK TO NEWS
             </Link>
             <div className="flex items-center gap-4">
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mr-2">Share Article</span>
                <button className="text-white/40 hover:text-luxury-gold transition-colors"><Facebook size={18} /></button>
                <button className="text-white/40 hover:text-luxury-gold transition-colors"><Twitter size={18} /></button>
                <button className="text-white/40 hover:text-luxury-gold transition-colors"><Linkedin size={18} /></button>
             </div>
          </div>

          <div 
            className="prose prose-invert prose-luxury max-w-none 
              prose-p:text-white/60 prose-p:text-lg prose-p:leading-relaxed prose-p:font-light prose-p:mb-8
              prose-h3:text-white prose-h3:font-display prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-6 prose-h3:mt-12
              prose-strong:text-luxury-gold prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />

          <div className="mt-20 p-10 bg-luxury-charcoal/30 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center gap-10">
             <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-luxury-gold/20">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" alt={article.author} />
             </div>
             <div>
                <h4 className="text-white font-display font-bold text-xl mb-2">About {article.author}</h4>
                <p className="text-white/40 text-sm leading-relaxed mb-4">Mohamed is a senior macro-economist specializing in the emerging real estate markets of Eastern Ethiopia. He provides strategic advisory to several development firms in the Somali Region.</p>
                <Link to="/contact" className="text-luxury-gold font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                  Contact Contributor &rarr;
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
