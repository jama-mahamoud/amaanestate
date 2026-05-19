import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  QueryConstraint,
  limit
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/utils';
import { Article } from '@/types';

const ARTICLES_COLLECTION = 'articles';

export const articleService = {
  async getArticles(category?: string, language?: string, publishedOnly: boolean = true) {
    try {
      // Fetch all articles to perform safe, client-side, backwards-compatible, and index-free filtering
      const q = query(collection(db, ARTICLES_COLLECTION));
      const snapshot = await getDocs(q);
      
      let docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      
      // Client-side safe, defensive filtering
      if (publishedOnly) {
        docs = docs.filter(art => {
          // Backward compatibility: If published is undefined, treat as true to recover old articles
          if (art.published === undefined) return true;
          return art.published === true || (art as any).status === 'published' || (art as any).visibility === 'public';
        });
      }
      
      if (category) {
        docs = docs.filter(art => art.category === category);
      }
      
      if (language) {
        docs = docs.filter(art => art.language === language);
      }

      // Client-side sort safely handling multiple Date/Timestamp formats
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt instanceof Date ? a.createdAt.getTime() : 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt instanceof Date ? b.createdAt.getTime() : 0);
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error fetching articles safely (falling back to empty list):', error);
      return []; // Safe return to avoid crashing the loader thread
    }
  },

  async getArticleById(id: string) {
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Article;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ARTICLES_COLLECTION}/${id}`);
      return null;
    }
  },

  async getArticleBySlug(slug: string) {
    try {
      const q = query(collection(db, ARTICLES_COLLECTION), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() } as Article;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ARTICLES_COLLECTION}/slug/${slug}`);
      return null;
    }
  },

  async createArticle(data: Omit<Article, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'views'>) {
    if (!auth.currentUser) throw new Error('Authentication required');
    try {
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), {
        ...data,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, ARTICLES_COLLECTION);
      return null;
    }
  },

  async updateArticle(id: string, data: Partial<Article>) {
    try {
      await updateDoc(doc(db, ARTICLES_COLLECTION, id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${ARTICLES_COLLECTION}/${id}`);
      return false;
    }
  },

  async deleteArticle(id: string) {
    try {
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ARTICLES_COLLECTION}/${id}`);
      return false;
    }
  }
};
