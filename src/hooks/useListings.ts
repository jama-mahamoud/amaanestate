import { useState, useEffect, useCallback } from 'react';
import { listingService, ListingFilter } from '../services/listingService';
import { Listing } from '../types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function useListings(initialFilters: ListingFilter = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const fetchListings = useCallback(async (filters: ListingFilter = {}, isLoadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listingService.getListings({
        ...filters,
        lastDoc: isLoadMore ? lastDoc : undefined
      });

      if (isLoadMore) {
        setListings(prev => [...prev, ...result.listings]);
      } else {
        setListings(result.listings);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length > 0 && result.listings.length === (filters.limit || 20));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  // Initial fetch
  useEffect(() => {
    fetchListings(initialFilters);
  }, [
    initialFilters.category, 
    initialFilters.listingType, 
    initialFilters.city, 
    initialFilters.minPrice, 
    initialFilters.maxPrice
  ]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchListings(initialFilters, true);
    }
  };

  const refresh = () => {
    fetchListings(initialFilters);
  };

  return { listings, loading, error, hasMore, loadMore, refresh };
}
