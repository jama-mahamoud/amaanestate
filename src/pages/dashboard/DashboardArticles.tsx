import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Eye, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';

export default function DashboardArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getArticles(undefined, undefined, false).then(data => {
      setArticles(data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch articles:", err);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      if (await articleService.deleteArticle(id)) {
        setArticles(articles.filter(a => a.id !== id));
      }
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue || !dateValue.seconds) return 'Pending';
    return new Date(dateValue.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-display font-bold mb-4 tracking-tighter">Editorial <span className="text-white/20">Archive</span></h1>
          <p className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.3em]">Knowledge Base & Regional Intelligence</p>
        </div>
        <Button asChild className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-2xl font-bold shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <Link to="/dashboard/articles/create">
            <Plus size={20} className="mr-3" /> Draft New Report
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Query editorial logs..." 
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/20 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/10 bg-white/5 text-white h-16 px-10 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> Topic Tags
        </Button>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-white/5">
        {!loading && articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Content Designation</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Categorization</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Reads</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {articles.map((article, i) => (
                  <motion.tr 
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="group hover:bg-white/[0.04] transition-all duration-500"
                  >
                    <td className="p-8">
                       <p className="text-xl font-display font-bold text-white mb-2 group-hover:text-luxury-gold transition-colors">{article.title}</p>
                       <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                          <Calendar size={10} className="text-luxury-gold" /> {formatDate(article.createdAt)}
                       </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${
                           article.published ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-white/20'
                         }`} />
                         <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">{article.published ? 'Published' : 'Draft'}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-lg font-display font-bold text-white/60 capitalize italic">{article.category}</p>
                    </td>
                    <td className="p-8">
                       <p className="text-lg font-bold text-white tabular-nums">{article.views}</p>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-9 px-3 rounded-lg border border-white/10 text-[10px] uppercase font-bold tracking-wider hover:bg-white/10 gap-1.5 flex items-center text-white/80 hover:text-white"
                        >
                          <Link to={`/news/${article.id}`}>
                            <Eye size={14} />
                            <span>View</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-9 px-3 rounded-lg border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/10 text-luxury-gold text-[10px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                        >
                          <Link to={`/dashboard/articles/edit/${article.id}`}>
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                          onClick={() => handleDelete(article.id)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            variant="dashed"
            showPlusIcon
            title="Editorial Void" 
            description="The regional intelligence database is awaiting content integration. Draft your first report to secure the record." 
            actionLabel="Draft New Report"
            onAction={() => navigate('/dashboard/articles/create')}
            icon={<FileText size={48} />}
          />
        )}
      </div>
    </div>
  );
}
