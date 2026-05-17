import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../services/listingService';
import { ProfessionalService, ServiceStatus } from '../types';

export function useProfessionalServices(category?: string, status: ServiceStatus = 'active') {
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getProfessionalServices(category, status);
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [category, status]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refresh: fetchServices };
}
