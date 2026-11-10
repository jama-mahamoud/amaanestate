import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, parseFirestoreDate, handleFirestoreError, OperationType } from './firestore';
import { Property, PropertyType, ListingType, PropertyStatus } from '../types';

const COLLECTION_NAME = 'properties';

/**
 * Converts a raw Firestore document snapshot into a strongly-typed Property object,
 * ensuring fallbacks for optional parameters and safe date transformations.
 */
function mapDocToProperty(docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData, id: string): Property {
  const data = docSnap.data ? docSnap.data() : docSnap;
  
  return {
    id: id,
    title: data.title || 'Untitled Property',
    description: data.description || '',
    propertyType: (data.propertyType || 'other') as PropertyType,
    listingType: (data.listingType || 'sale') as ListingType,
    price: Number(data.price) || 0,
    currency: data.currency || 'ETB',
    bedrooms: data.bedrooms !== undefined ? Number(data.bedrooms) : undefined,
    bathrooms: data.bathrooms !== undefined ? Number(data.bathrooms) : undefined,
    area: data.area !== undefined ? Number(data.area) : undefined,
    location: {
      region: data.location?.region || 'Somali Region',
      city: data.location?.city || 'Jigjiga',
      district: data.location?.district || '',
      neighborhood: data.location?.neighborhood || ''
    },
    address: data.address || '',
    images: Array.isArray(data.images) ? data.images : [],
    features: Array.isArray(data.features) ? data.features : [],
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    agentId: data.agentId || 'unassigned',
    status: (data.status || 'available') as PropertyStatus,
    featured: !!data.featured,
    availability: data.availability || 'Immediate',
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: data.updatedAt ? parseFirestoreDate(data.updatedAt) : undefined
  };
}

/**
 * Interface representing structured property search filters.
 */
export interface PropertySearchFilters {
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  locationQuery?: string; // Query matching region, city, district, or neighborhood
  status?: PropertyStatus;
  featured?: boolean;
}

/**
 * Retrieves all properties from Firestore.
 */
export async function getProperties(): Promise<Property[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => mapDocToProperty(doc, doc.id));
  } catch (error) {
    console.error('Error fetching properties from Firestore:', error);
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

/**
 * Retrieves a single property document by its unique ID.
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return mapDocToProperty(docSnap, docSnap.id);
  } catch (error) {
    console.error(`Error fetching property ${id} from Firestore:`, error);
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return null;
  }
}

/**
 * Searches and filters properties.
 * Employs a robust combination of primary Firestore clauses and localized post-filtering
 * to avoid index-generation limits and query errors (FailedPreconditionError).
 */
export async function searchProperties(filters: PropertySearchFilters): Promise<Property[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    let conditions = [];

    // Apply primary filters supported directly by simple Firestore indices
    if (filters.status) {
      conditions.push(where('status', '==', filters.status));
    } else {
      conditions.push(where('status', '==', 'available')); // default behavior
    }

    if (filters.propertyType) {
      conditions.push(where('propertyType', '==', filters.propertyType));
    }

    if (filters.listingType) {
      conditions.push(where('listingType', '==', filters.listingType));
    }

    if (filters.featured !== undefined) {
      conditions.push(where('featured', '==', filters.featured));
    }

    const q = query(colRef, ...conditions, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    let results = snap.docs.map(doc => mapDocToProperty(doc, doc.id));

    // Client-side post-filters for complex properties (price, rooms, location keywords)
    // This allows robust cross-filtering with zero risk of index exceptions.
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= (filters.minPrice ?? 0));
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= (filters.maxPrice ?? Infinity));
    }
    if (filters.bedrooms !== undefined) {
      results = results.filter(p => p.bedrooms !== undefined && p.bedrooms >= (filters.bedrooms ?? 0));
    }
    if (filters.bathrooms !== undefined) {
      results = results.filter(p => p.bathrooms !== undefined && p.bathrooms >= (filters.bathrooms ?? 0));
    }
    if (filters.locationQuery) {
      const keyword = filters.locationQuery.toLowerCase().trim();
      results = results.filter(p => {
        const regionMatch = p.location.region.toLowerCase().includes(keyword);
        const cityMatch = p.location.city.toLowerCase().includes(keyword);
        const districtMatch = p.location.district?.toLowerCase().includes(keyword) || false;
        const neighborhoodMatch = p.location.neighborhood?.toLowerCase().includes(keyword) || false;
        const addressMatch = p.address?.toLowerCase().includes(keyword) || false;
        return regionMatch || cityMatch || districtMatch || neighborhoodMatch || addressMatch;
      });
    }

    return results;
  } catch (error) {
    console.error('Error searching properties:', error);
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

/**
 * Creates a new property document.
 */
export async function createProperty(property: Omit<Property, 'id' | 'createdAt'>): Promise<string> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docData = {
      ...property,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(colRef, docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating property:', error);
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
}

/**
 * Updates an existing property's fields.
 */
export async function updateProperty(id: string, updates: Partial<Omit<Property, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating property ${id}:`, error);
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Archives a property by setting its status to 'archived'.
 */
export async function archiveProperty(id: string): Promise<void> {
  try {
    await updateProperty(id, { status: 'archived' });
  } catch (error) {
    console.error(`Error archiving property ${id}:`, error);
    throw error;
  }
}
