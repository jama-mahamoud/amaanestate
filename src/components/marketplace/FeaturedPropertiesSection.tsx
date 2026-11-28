import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Property } from '../../types';
import { getFeaturedProperties, getProperties } from '../../services/propertyService';
import PropertyCard from './PropertyCard';

function isGenuinePublishedProperty(p: Property): boolean {
  return (
    Boolean(p?.id) &&
    p.publication_status === 'published' &&
    !p.is_sample &&
    p.source_name !== 'showcase_sample'
  );
}

export default function FeaturedPropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFeatured() {
      setLoading(true);
      try {
        const featuredRes = await getFeaturedProperties(undefined, 4);
        const combined: Property[] = [];
        const seenIds = new Set<string>();

        for (const item of featuredRes.properties || []) {
          if (isGenuinePublishedProperty(item) && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            combined.push(item);
          }
        }

        if (combined.length < 4) {
          const [saleRes, rentRes] = await Promise.all([
            getProperties({ transaction_type: 'sale', limit: 4 }).catch(() => ({
              properties: [] as Property[],
            })),
            getProperties({ transaction_type: 'rent', limit: 4 }).catch(() => ({
              properties: [] as Property[],
            })),
          ]);

          const fallbackPool = [
            ...(saleRes.properties || []),
            ...(rentRes.properties || []),
          ];

          for (const item of fallbackPool) {
            if (combined.length >= 4) break;
            if (isGenuinePublishedProperty(item) && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              combined.push(item);
            }
          }
        }

        if (!active) return;
        setProperties(combined.slice(0, 4));
      } catch {
        if (!active) return;
        setProperties([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeatured();

    return () => {
      active = false;
    };
  }, []);

  const gridColsClass =
    properties.length === 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section
      aria-labelledby="featured-properties-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Property Marketplace
          </p>
          <h2
            id="featured-properties-heading"
            className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
          >
            Featured Properties
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-[#1E3A5F]">
          <Link
            to="/buy"
            className="inline-flex items-center min-h-[36px] hover:underline whitespace-nowrap"
          >
            Properties for Sale &rarr;
          </Link>
          <span aria-hidden="true" className="text-[#D6CEBE]">|</span>
          <Link
            to="/rent"
            className="inline-flex items-center min-h-[36px] hover:underline whitespace-nowrap"
          >
            Properties for Rent &rarr;
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-[#EBE6DF]" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-24 bg-[#EBE6DF] rounded" />
                <div className="h-5 w-32 bg-[#EBE6DF] rounded" />
                <div className="h-4 w-full bg-[#EBE6DF] rounded" />
                <div className="h-3 w-40 bg-[#EBE6DF] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className={`grid ${gridColsClass} gap-5 sm:gap-6`}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-md p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-10 h-10 rounded bg-[#FAF8F5] border border-[#E5E0D8] flex items-center justify-center shrink-0 text-[#8C4A27]">
              <Building2 size={20} strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-semibold text-[#141413]">
                Verified Property Inventory Updating
              </h3>
              <p className="text-sm text-[#5C5A55] leading-relaxed">
                Active international residential listings for sale and rent are currently being curated and verified. Browse our marketplace directories to filter upcoming inventory.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/buy"
              className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142944] text-white text-xs font-semibold rounded transition-colors whitespace-nowrap"
            >
              Explore Buy
            </Link>
            <Link
              to="/rent"
              className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] text-xs font-semibold text-[#141413] rounded transition-colors whitespace-nowrap"
            >
              Explore Rent
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
