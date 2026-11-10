import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  limit, 
  QueryDocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
import { db, parseFirestoreDate, handleFirestoreError, OperationType } from './firestore';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  createdAt: string;
}

const COLLECTION_NAME = 'articles';

function mapDocToArticle(docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): Article {
  const data = docSnap.data ? docSnap.data() : docSnap;
  return {
    id: id,
    title: data.title || 'Untitled Article',
    slug: data.slug || id,
    summary: data.summary || data.excerpt || '',
    excerpt: data.excerpt || data.summary || '',
    content: data.content || '',
    coverImage: data.coverImage || data.image || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    author: data.author || 'AmaanEstate Editorial',
    createdAt: parseFirestoreDate(data.createdAt)
  };
}

/**
 * Fetches latest articles from the preserved Firestore collection.
 */
export async function getLatestArticles(limitCount = 3): Promise<Article[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => mapDocToArticle(doc, doc.id));
  } catch (error) {
    console.error('Error fetching articles from Firestore:', error);
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    // Return empty array on error to keep UI resilient
    return [];
  }
}

/**
 * Fetches all articles.
 */
export async function getAllArticles(): Promise<Article[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => mapDocToArticle(doc, doc.id));
  } catch (error) {
    console.error('Error fetching all articles:', error);
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

/**
 * Fetches a single article by its slug from Firestore.
 */
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) {
      // Try fetching by ID as fallback
      try {
        const docRef = doc(db, COLLECTION_NAME, slug);
        const dSnap = await getDoc(docRef);
        if (dSnap.exists()) {
          return mapDocToArticle(dSnap, dSnap.id);
        }
      } catch (e) {}
      return null;
    }
    return mapDocToArticle(snap.docs[0], snap.docs[0].id);
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${slug}`);
    return null;
  }
}

