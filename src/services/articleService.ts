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
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const articlesCache: { [key: string]: CacheEntry<Article[]> } = {};
const articleDetailCache: { [key: string]: CacheEntry<Article> } = {};

const clearCaches = () => {
  for (const key in articlesCache) {
    if (Object.prototype.hasOwnProperty.call(articlesCache, key)) {
      delete articlesCache[key];
    }
  }
  for (const key in articleDetailCache) {
    if (Object.prototype.hasOwnProperty.call(articleDetailCache, key)) {
      delete articleDetailCache[key];
    }
  }
};

const cleanHtmlContent = (html?: string): string => {
  if (!html) return '';
  return html
    .replace(/<p>\s*?(<br\s*?\/?>)?\s*?<\/p>/g, '') // remove empty paragraphs
    .replace(/<p>&nbsp;<\/p>/g, '')                 // remove empty non-breaking space paragraphs
    .replace(/(<br\s*?\/?>\s*?){2,}/g, '<br />')     // squash duplicate linebreaks
    .trim();
};

export const articleService = {
  async ensureUniqueSlug(title: string, currentArticleId?: string): Promise<string> {
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    if (!baseSlug) baseSlug = "article";
    
    let uniqueSlug = baseSlug;
    let counter = 1;
    let duplicate = true;
    
    while (duplicate) {
      const art = await this.getArticleBySlug(uniqueSlug);
      if (art && art.id !== currentArticleId) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        duplicate = false;
      }
    }
    return uniqueSlug;
  },

  async getArticles(category?: string, language?: string, publishedOnly: boolean = true) {
    const cacheKey = `list_${category || 'all'}_${language || 'all'}_${publishedOnly}`;
    const cached = articlesCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      // Fetch all articles to perform safe, client-side, backwards-compatible, and index-free filtering
      const q = query(collection(db, ARTICLES_COLLECTION));
      const snapshot = await getDocs(q);
      
      let docs = snapshot.docs.map(doc => {
        const docData = doc.data();
        let finalSlug = docData.slug;
        if (!finalSlug && docData.title) {
          finalSlug = docData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
        }
        if (!finalSlug) finalSlug = doc.id;
        return {
          id: doc.id,
          ...docData,
          slug: finalSlug
        };
      }) as Article[];
      
      // Client-side safe, defensive filtering
      if (publishedOnly) {
        docs = docs.filter(art => {
          // Strict filtering: must be published AND public
          const isPublished = art.published === true || (art as any).status === 'published';
          const isPublic = art.visibility === 'public' || art.visibility === undefined; // default to public if undefined for legacy
          return isPublished && isPublic;
        });
      }
      
      if (category && category !== 'All') {
        docs = docs.filter(art => art.category === category);
      }
      
      if (language) {
        docs = docs.filter(art => art.language === language);
      }

      // Client-side sort safely handling multiple Date/Timestamp formats
      const sortedDocs = docs.sort((a, b) => {
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt instanceof Date ? a.createdAt.getTime() : (typeof a.createdAt === 'number' ? a.createdAt : 0));
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt instanceof Date ? b.createdAt.getTime() : (typeof b.createdAt === 'number' ? b.createdAt : 0));
        return bTime - aTime;
      });

      articlesCache[cacheKey] = { data: sortedDocs, timestamp: Date.now() };
      return sortedDocs;
    } catch (error) {
      console.error('Error fetching articles safely (falling back to empty list):', error);
      return []; // Safe return to avoid crashing the loader thread
    }
  },

  async getArticleById(id: string) {
    const cached = articleDetailCache[id];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const docRef = doc(db, ARTICLES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      const docData = snapshot.data();
      let finalSlug = docData.slug;
      if (!finalSlug && docData.title) {
        finalSlug = docData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!finalSlug) finalSlug = snapshot.id;
      const data = { id: snapshot.id, ...docData, slug: finalSlug } as Article;
      articleDetailCache[id] = { data, timestamp: Date.now() };
      return data;
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
      const data = { id: docData.id, ...docData.data() } as Article;
      if (!data.slug && data.title) {
        data.slug = data.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
      }
      if (!data.slug) data.slug = docData.id;
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${ARTICLES_COLLECTION}/slug/${slug}`);
      return null;
    }
  },

  async createArticle(data: Omit<Article, 'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'views'>) {
    if (!auth.currentUser) throw new Error('Authentication required');
    console.log("Creating new article:", data.title);
    try {
      clearCaches();
      // Ensure slug is auto-generated or validated
      let finalSlug = data.slug || '';
      if (!finalSlug && data.title) {
        finalSlug = await this.ensureUniqueSlug(data.title);
      } else if (finalSlug) {
        finalSlug = await this.ensureUniqueSlug(finalSlug);
      }
      
      const cleanContent = cleanHtmlContent(data.content);
      
      const articleData = {
        ...data,
        slug: finalSlug,
        content: cleanContent,
        authorId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0
      };
      console.log("Saving article data to Firestore:", articleData);
      
      const docRef = await addDoc(collection(db, ARTICLES_COLLECTION), articleData);
      console.log("Article created with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error creating article:", error);
      handleFirestoreError(error, OperationType.WRITE, ARTICLES_COLLECTION);
      return null;
    }
  },

  async updateArticle(id: string, data: Partial<Article>) {
    try {
      clearCaches();
      const docRef = doc(db, ARTICLES_COLLECTION, id);
      
      const updatePayload: any = { ...data };
      
      if (data.title && data.slug) {
        updatePayload.slug = await this.ensureUniqueSlug(data.slug, id);
      } else if (data.title && !data.slug) {
        updatePayload.slug = await this.ensureUniqueSlug(data.title, id);
      } else if (data.slug) {
        updatePayload.slug = await this.ensureUniqueSlug(data.slug, id);
      }
      
      if (data.content !== undefined) {
        updatePayload.content = cleanHtmlContent(data.content);
      }
      
      await updateDoc(docRef, {
        ...updatePayload,
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
      clearCaches();
      await deleteDoc(doc(db, ARTICLES_COLLECTION, id));
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${ARTICLES_COLLECTION}/${id}`);
      return false;
    }
  }
};
