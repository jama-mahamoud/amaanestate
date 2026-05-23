import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/article/ArticleForm';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (id) {
      articleService.getArticleById(id).then(data => {
        if (active) {
          setArticle(data);
          setLoading(false);
        }
      }).catch(err => {
        console.error("Failed to fetch article:", err);
        if (active) setLoading(false);
      });
    }
    return () => { active = false; };
  }, [id]);

  if (loading) return <div className="p-20 text-center text-white/30 uppercase font-bold tracking-widest animate-pulse">Loading report data...</div>;
  if (!article) return <div className="p-20 text-center text-red-400">Report not found in archive.</div>;

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
        <div>
           <Button variant="ghost" onClick={() => navigate(-1)} className="text-white/40 hover:text-white px-0 hover:bg-transparent -ml-2 mb-4">
             <ArrowLeft size={16} className="mr-2" /> Back to Archive
           </Button>
           <h1 className="text-5xl font-display font-bold tracking-tighter text-white">Edit <span className="text-white/20">Report</span></h1>
        </div>
      </div>
      <ArticleForm initialData={article} />
    </div>
  );
}
