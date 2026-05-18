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
      const constraints: QueryConstraint[] = [];
      
      if (publishedOnly) {
        constraints.push(where('published', '==', true));
      }
      
      if (category) constraints.push(where('category', '==', category));
      if (language) constraints.push(where('language', '==', language));

      const q = query(collection(db, ARTICLES_COLLECTION), ...constraints);
      const snapshot = await getDocs(q);
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Article[];
      // Client-side sort to avoid composite index requirements
      return docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ARTICLES_COLLECTION);
      return [];
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
