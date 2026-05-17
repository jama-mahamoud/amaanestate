import { Plus, Search, Filter, Edit3, Trash2, Eye, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

const MOCK_ARTICLES = [
  { id: '1', title: 'The Real Estate Boom in Jigjiga', date: 'May 15, 2024', status: 'Published', views: '2.4k', category: 'Market Trends' },
  { id: '2', title: 'Luxury Vehicles Perfect for Regional Terrain', date: 'May 12, 2024', status: 'Published', views: '1.8k', category: 'Lifestyle' },
  { id: '3', title: 'Legal Compliance: Buying Land', date: 'May 10, 2024', status: 'Draft', views: '0', category: 'Legal Guide' },
];

export default function DashboardArticles() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Editorial <span className="text-white/20">Archive</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Knowledge Base & Regional Intelligence</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1">
          <Plus size={20} className="mr-3" /> Draft New Report
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Query editorial logs..." 
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> Topic Tags
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Content Designation</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Status</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Categorization</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Metrics</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_ARTICLES.map((article, i) => (
                <motion.tr 
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group hover:bg-white/[0.02] transition-all duration-500"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                          <FileText size={24} className="text-luxury-gold opacity-40 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div>
                          <p className="text-lg font-display font-bold text-white mb-1 group-hover:text-luxury-gold transition-colors">{article.title}</p>
                          <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                             <Calendar size={10} className="text-luxury-gold" /> {article.date}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         article.status === 'Published' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'
                       }`} />
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{article.status}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="text-lg font-display font-bold text-white italic">{article.category}</p>
                  </td>
                  <td className="p-8">
                     <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Global ReadCount</p>
                     <p className="text-sm font-bold text-white tabular-nums">{article.views}</p>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-white"><Eye size={18} /></Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-luxury-gold"><Edit3 size={18} /></Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={18} /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
