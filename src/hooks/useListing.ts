import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../services/listingService';
import { Listing } from '../types';

export function useListing(id: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getListingById(id);
      setListing(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listing details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    
    setLoading(true);
    setError(null);
    listingService.getListingById(id || '').then(data => {
      if (active) {
        setListing(data);
        setLoading(false);
      }
    }).catch(err => {
      if (active) {
        setError(err.message || 'Failed to fetch listing details');
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [id]);

  return { listing, loading, error, refresh: fetchListing };
}
