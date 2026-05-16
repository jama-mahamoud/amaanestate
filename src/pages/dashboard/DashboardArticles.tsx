import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../components/providers/AuthProvider';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2, Edit, Plus } from 'lucide-react';
import { uploadImage } from '../../lib/upload';

export default function DashboardArticles() {
  const { appUser } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const defaultForm = {
    title: '',
    content: '',
    excerpt: '',
  };
  const [formData, setFormData] = useState(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchArticles = async () => {
    if (!appUser || appUser.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'articles'));
      setArticles(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    } catch (error: any) {
      toast.error('Error fetching articles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [appUser]);

  const handleEditClick = (article: any) => {
    setEditId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
    });
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditId(null);
    setFormData(defaultForm);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || appUser.role !== 'admin') return;
    setUploading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'articles');
      }

      if (editId) {
        const updateData: any = {
           title: formData.title,
           content: formData.content,
           excerpt: formData.excerpt,
           updatedAt: serverTimestamp(),
        };
        if (imageUrl) {
           updateData.imageUrl = imageUrl;
        }
        await updateDoc(doc(db, 'articles', editId), updateData);
        toast.success('Article updated successfully');
      } else {
        const articleData = {
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          imageUrl,
          author: appUser.uid,
          status: 'published',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'articles'), articleData);
        toast.success('Article created successfully');
      }

      setIsDialogOpen(false);
      setImageFile(null);
      setFormData(defaultForm);
      fetchArticles();
    } catch (err: any) {
      toast.error('Failed to save article: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const publishArticle = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'articles', id), {
         status: currentStatus === 'published' ? 'draft' : 'published',
         updatedAt: serverTimestamp()
      });
      toast.success('Status updated');
      fetchArticles();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const deleteArticle = async (id: string) => {
    if(!confirm('Delete this article?')) return;
    try {
      await deleteDoc(doc(db, 'articles', id));
      toast.success('Article deleted');
      fetchArticles();
    } catch(err: any) {
      toast.error('Failed to delete');
    }
  };

  if(!appUser || appUser.role !== 'admin') {
    return <div>Access Denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Articles & News</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-black text-white" onClick={handleCreateClick}>
              <Plus className="w-4 h-4 mr-2" /> Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="h-48" />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <Button type="submit" disabled={uploading} className="w-full bg-amber-500 hover:bg-black text-white">
                {uploading ? 'Uploading...' : (editId ? 'Update Article' : 'Publish Article')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Article</th>
              <th className="px-6 py-4 font-medium text-gray-500">Status</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center">No articles found.</td></tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                     {article.imageUrl && <img src={article.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />}
                     {article.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => publishArticle(article.id, article.status)}>
                      {article.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditClick(article)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                       <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteArticle(article.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                       <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}