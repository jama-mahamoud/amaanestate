import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const newsItems = [
  {
    id: '1',
    title: 'The Real Estate Boom in Jigjiga: What Investors Need to Know',
    excerpt: 'Exploring the rapid urban development in the Somali Regional capital and why now is the prime time to invest in residential property.',
    date: 'May 15, 2024',
    author: 'Mohamed Abdi',
    readTime: '5 min read',
    category: 'Market Trends',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: '2',
    title: '5 Luxury Vehicles Perfect for Regional Terrain',
    excerpt: 'A curated list of SUVs and off-road vehicles that combine comfort with the rugged durability needed for inter-city travel in the region.',
    date: 'May 12, 2024',
    author: 'Sarah Hassan',
    readTime: '7 min read',
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: '3',
    title: 'Legal Compliance: Buying Land in the Somali Region',
    excerpt: 'A comprehensive guide on the documentation and due diligence required when purchasing commercial or residential land.',
    date: 'May 10, 2024',
    readTime: '10 min read',
    author: 'Dr. Ali Ibrahim',
    category: 'Legal Guide',
    image: 'https://images.unsplash.com/photo-1589149014565-d6d713c8e44c?auto=format&fit=crop&q=80&w=1200'
  }
];

export default function News() {
  return (
    <div className="min-h-screen bg-luxury-black pt-28 pb-20">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-20">
          <p className="text-luxury-gold font-bold tracking-[0.3em] uppercase text-xs mb-4">Regional Insights</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
            News & <span className="text-white/40">Market Updates</span>
          </h1>
        </div>

        {/* Featured Article */}
        <div className="mb-20">
          <Link to={`/news/${newsItems[0].id}`}>
            <div className="relative h-[600px] rounded-[3.5rem] overflow-hidden group">
              <img 
                src={newsItems[0].image} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Featured" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 md:p-16 max-w-3xl">
                <Badge className="bg-luxury-gold text-luxury-black border-0 mb-6 uppercase tracking-widest font-bold">
                  {newsItems[0].category}
                </Badge>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 group-hover:text-luxury-gold transition-colors">
                  {newsItems[0].title}
                </h2>
                <div className="flex items-center gap-6 text-white/50 text-sm">
                  <span className="flex items-center gap-2"><Calendar size={14} /> {newsItems[0].date}</span>
                  <span className="flex items-center gap-2"><Clock size={14} /> {newsItems[0].readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {newsItems.slice(1).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/news/${item.id}`} className="group">
                <Card className="bg-luxury-charcoal/50 border-white/5 overflow-hidden rounded-[2.5rem] h-full flex flex-col transition-all hover:bg-luxury-charcoal/70">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={item.title} 
                    />
                  </div>
                  <CardContent className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-luxury-gold border-luxury-gold/30 uppercase text-[10px] tracking-widest font-bold">
                          {item.category}
                        </Badge>
                        <span className="text-white/30 text-[10px] uppercase font-bold">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-4 group-hover:text-luxury-gold transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-white/40 text-sm line-clamp-3 mb-6 leading-relaxed">
                        {item.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-widest font-bold">
                        <User size={12} className="text-luxury-gold" />
                        {item.author}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 h-14 px-10 rounded-2xl font-bold">
              Load Older Articles
            </Button>
        </div>
      </div>
    </div>
  );
}
