import { useNavigate } from 'react-router-dom';
import ArticleForm from '@/components/article/ArticleForm';

export default function CreateArticle() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Draft New Report</h1>
      <ArticleForm />
    </div>
  );
}
