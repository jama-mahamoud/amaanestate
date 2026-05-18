import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ArticleForm from '@/components/article/ArticleForm';
import { articleService } from '@/services/articleService';
import { Article } from '@/types';

export default function EditArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      articleService.getArticleById(id).then(data => {
        setArticle(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading article data...</div>;
  if (!article) return <div className="p-8 text-white">Article not found</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Edit Report</h1>
      <ArticleForm initialData={article} />
    </div>
  );
}
