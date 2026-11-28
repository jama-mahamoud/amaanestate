import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalMarketComparisonReport } from '../../types';
import {
  GLOBAL_MARKETS_CHANNEL,
  GLOBAL_MARKETS_UPDATED_EVENT,
  getPublishedMarketComparisons,
} from '../../services/globalMarketsService';
import ComparisonMarketCard from './ComparisonMarketCard';

interface HeadToHeadComparisonsSectionProps {
  maxComparisons?: number;
}

export default function HeadToHeadComparisonsSection({
  maxComparisons = 3,
}: HeadToHeadComparisonsSectionProps) {
  const [comparisons, setComparisons] = useState<GlobalMarketComparisonReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComparisons = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      const featuredRes = await getPublishedMarketComparisons({ featuredOnly: true });
      let list = Array.isArray(featuredRes.comparisons) ? featuredRes.comparisons : [];

      if (list.length < 2) {
        const allRes = await getPublishedMarketComparisons().catch(() => ({
          comparisons: [] as GlobalMarketComparisonReport[],
        }));
        const allList = Array.isArray(allRes.comparisons) ? allRes.comparisons : [];
        const seenIds = new Set(list.map((c) => c.id));
        for (const item of allList) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            list.push(item);
          }
        }
      }

      setComparisons(list.slice(0, maxComparisons));
    } catch {
      if (isInitial) {
        setComparisons([]);
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [maxComparisons]);

  useEffect(() => {
    loadComparisons(true);
  }, [loadComparisons]);

  useEffect(() => {
    const handleUpdate = () => {
      loadComparisons(false);
    };

    window.addEventListener(GLOBAL_MARKETS_UPDATED_EVENT, handleUpdate);

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel = new BroadcastChannel(GLOBAL_MARKETS_CHANNEL);
        broadcastChannel.onmessage = handleUpdate;
      } catch {
        broadcastChannel = null;
      }
    }

    return () => {
      window.removeEventListener(GLOBAL_MARKETS_UPDATED_EVENT, handleUpdate);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [loadComparisons]);

  if (!loading && comparisons.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="head-to-head-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E0D8] pb-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#8C4A27]">
            Head-to-Head Research
          </p>
          <h2
            id="head-to-head-heading"
            className="text-2xl sm:text-3xl font-serif font-semibold text-[#141413]"
          >
            City Market Comparisons
          </h2>
        </div>

        <Link
          to="/global-markets#city-comparisons"
          className="inline-flex items-center min-h-[36px] text-xs font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0"
        >
          Explore All Comparisons &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E0D8] rounded-md p-3 space-y-3 animate-pulse"
            >
              <div className="h-28 bg-[#EBE6DF] rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 bg-[#FAF8F5] rounded" />
                <div className="h-20 bg-[#FAF8F5] rounded" />
              </div>
              <div className="h-8 bg-[#FAF8F5] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {comparisons.map((comparison) => (
            <ComparisonMarketCard key={comparison.id} comparison={comparison} />
          ))}
        </div>
      )}
    </section>
  );
}
