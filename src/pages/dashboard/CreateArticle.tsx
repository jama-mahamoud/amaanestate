import { useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/article/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateArticle() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
        <div>
           <Button variant="ghost" onClick={() => navigate(-1)} className="text-white/40 hover:text-white px-0 hover:bg-transparent -ml-2 mb-4">
             <ArrowLeft size={16} className="mr-2" /> Back to Archive
           </Button>
           <h1 className="text-4xl font-display font-light text-white tracking-tight">New <span className="text-white/40">Article</span></h1>
        </div>
      </div>
      <ArticleForm />
    </div>
  );
}
