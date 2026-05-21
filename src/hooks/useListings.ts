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
      const currentLastDoc = isLoadMore ? lastDoc : undefined;
      const result = await listingService.getListings({
        ...filters,
        lastDoc: currentLastDoc
      });

      if (isLoadMore) {
        setListings(prev => [...prev, ...result.listings]);
      } else {
        setListings(result.listings);
      }

      setLastDoc(result.lastDoc);
      // Check if we reached the end
      const limitVal = filters.limit || 20;
      setHasMore(result.listings.length === limitVal);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, [lastDoc]); // Keep lastDoc as dependency so loadMore can use current value

  // Initial fetch when core filters change
  useEffect(() => {
    // Reset state for new filter query
    setListings([]);
    setLastDoc(undefined);
    setHasMore(true);
    
    // We can't call fetchListings directly because it depends on lastDoc
    // and would trigger itself. So we call service directly for initial load.
    const initialFetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listingService.getListings(initialFilters);
        setListings(result.listings);
        setLastDoc(result.lastDoc);
        setHasMore(result.listings.length === (initialFilters.limit || 20));
      } catch (err: any) {
        setError(err.message || 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };
    
    initialFetch();
  }, [
    initialFilters.category, 
    initialFilters.listingType, 
    initialFilters.city, 
    initialFilters.minPrice, 
    initialFilters.maxPrice,
    initialFilters.status,
    initialFilters.currency,
    initialFilters.subcategory,
    initialFilters.associatedBrokerId,
    initialFilters.ownerId
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
