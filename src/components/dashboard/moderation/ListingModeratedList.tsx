import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  MapPin, 
  Check, 
  X, 
  ExternalLink,
  Loader2,
  Trash2,
  AlertCircle,
  Star,
  EyeOff,
  Eye,
  Edit3,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  BookOpen,
  Send,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MessageSquareOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Listing, ListingStatus } from '@/types';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

type ModerationStatusFilter = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export default function ListingModeratedList() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Status bucket filter (Primary DB query)
  const [statusFilter, setStatusFilter] = useState<ModerationStatusFilter>('PENDING');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Search and Local filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'title-asc'>('date-desc');
  
  // Revision Request Modal state
  const [feedbackListing, setFeedbackListing] = useState<Listing | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset page on tab change
    
    const unsubscribe = moderationService.subscribeToListings(
      (data) => {
        setListings(data);
        setLoading(false);
      },
      statusFilter as ListingStatus,
      undefined
    );

    return () => unsubscribe();
  }, [statusFilter, refreshKey]);

  // Actions
  const handleApprove = async (id: string) => {
    setActioningId(id);
    const success = await moderationService.approveListing(id);
    if (success) {
      toast.success('Listing approved & certified successfully.');
    } else {
      toast.error('Failed to update listing status.');
    }
    setActioningId(null);
  };

  const handleReject = async (id: string) => {
    setActioningId(id);
    const success = await moderationService.rejectListing(id);
    if (success) {
      toast.success('Listing has been rejected and moved to Suspended archive.');
    } else {
      toast.error('Failed to reject the listing.');
    }
    setActioningId(null);
  };

  const handleToggleFeature = async (id: string, isFeatured: boolean) => {
    setActioningId(id);
    const success = await moderationService.toggleFeatureListing(id, !isFeatured);
    if (success) {
      toast.success(isFeatured ? 'Removed featured recommendation status' : 'Asset marked as verified featured promotion');
    } else {
      toast.error('Could not update promotion flags.');
    }
    setActioningId(null);
  };

  const handleSuspend = async (id: string) => {
    setActioningId(id);
    const success = await moderationService.suspendItem('listings', id);
    if (success) {
      toast.success('Asset suspended successfully.');
    } else {
      toast.error('Failed to suspend the catalog asset.');
    }
    setActioningId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete listing permanently from databases? This is irreversible.')) return;
    setActioningId(id);
    const success = await moderationService.deleteDocument('listings', id);
    if (success) {
      toast.success('Document deleted permanently from our secure archives.');
    } else {
      toast.error('Failed to delete listing.');
    }
    setActioningId(null);
  };

  const handleSubmitReviewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackListing || !feedbackText.trim()) return;

    setSendingFeedback(true);
    const success = await moderationService.requestListingChanges(feedbackListing.id, feedbackText);
    if (success) {
      toast.success(`Change request submitted. Feedback sent to owner: ${feedbackListing.email || 'Vendor'}`);
      setFeedbackListing(null);
      setFeedbackText('');
    } else {
      toast.error('Failed to submit revision feedback.');
    }
    setSendingFeedback(false);
  };

  // Get unique lists for filtering dropdowns
  const availableCities = React.useMemo(() => {
    const cities = new Set<string>();
    listings.forEach(l => l.city && cities.add(l.city));
    return Array.from(cities);
  }, [listings]);

  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    listings.forEach(l => l.category && cats.add(l.category));
    return Array.from(cats);
  }, [listings]);

  // Apply Search, Filters & Sorting locally
  const filteredListings = React.useMemo(() => {
    let result = [...listings];

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => 
        (l.title?.toLowerCase() || '').includes(q) ||
        (l.description?.toLowerCase() || '').includes(q) ||
        (l.city?.toLowerCase() || '').includes(q) ||
        (l.id || '').toLowerCase().includes(q) ||
        (l.email?.toLowerCase() || '').includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(l => l.category === categoryFilter);
    }

    // City filter
    if (cityFilter !== 'ALL') {
      result = result.filter(l => l.city === cityFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA;
      }
      if (sortBy === 'date-asc') {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tA - tB;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return result;
  }, [listings, searchQuery, categoryFilter, cityFilter, sortBy]);

  // Slice list for pagination
  const paginatedListings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredListings, currentPage]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Tab select bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          {(['PENDING', 'ACTIVE', 'SUSPENDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setSearchQuery('');
              }}
              className={`px-5 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all ${
                statusFilter === s 
                ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10' 
                : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s === 'PENDING' ? 'Pending Reviews' : s === 'ACTIVE' ? 'Active Listings' : 'Suspended Archive'}
            </button>
          ))}
        </div>

        <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
          {filteredListings.length} properties found
        </div>
      </div>

      {/* Grid Controls (Search, Sort, Filters) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search size={14} className="absolute left-3.5 top-[50%] -translate-y-[50%] text-white/40" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/80 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/80 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          >
            <option value="ALL">All Cities</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Sorting Selection */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/80 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          >
            <option value="date-desc">Newest Submitted</option>
            <option value="date-asc">Oldest Submitted</option>
            <option value="price-desc">Highest Price first</option>
            <option value="price-asc">Lowest Price first</option>
            <option value="title-asc">Alphabetic A-Z</option>
          </select>
        </div>
      </div>

      {/* Main Corporate Moderation Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl gap-4">
          <Loader2 size={32} className="animate-spin text-[#C5A059]" />
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Fetching catalog verification queue...</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-[2rem] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
            <MessageSquareOff size={28} />
          </div>
          <h4 className="text-xl font-display font-medium text-white/95">No pending reviews</h4>
          <p className="text-white/35 text-[11px] uppercase tracking-wider mt-2.5">All matching digital properties verified or correctly filtered.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table Container responsive wrapper */}
          <div className="overflow-x-auto rounded-3xl border border-white/5 bg-white/[0.01] shadow-2xl backdrop-blur-md">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider">Property Details</th>
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider">Classification</th>
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider">Geographics</th>
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider">Submitter & Valuation</th>
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider">Safety Status</th>
                  <th className="py-5 px-6 text-[10px] uppercase font-black text-white/40 tracking-wider text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedListings.map((listing) => {
                  const hasChangesRequested = listing.verificationStatus === 'REJECTED' && listing.status === 'PENDING';
                  
                  return (
                    <motion.tr 
                      key={listing.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Property col */}
                      <td className="py-5 px-6 min-w-[300px]">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden relative border border-white/10 shrink-0 bg-white/5">
                            <img 
                              src={listing.images?.[0] || '/placeholder-image.jpg'} 
                              alt={listing.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {listing.isFeatured && (
                              <div className="absolute top-1 right-1 p-0.5 bg-[#C5A059] rounded text-black shadow-lg">
                                <Star size={10} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-sm block tracking-tight line-clamp-1">{listing.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-white/30 block mt-1 uppercase">ID: {listing.id}</span>
                            {listing.moderationComment && (
                              <div className="mt-1 text-[10px] max-w-[280px] bg-red-500/10 text-red-400 border border-red-500/10 px-2 py-1 rounded-lg">
                                Revision Needed: "{listing.moderationComment}"
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category col */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-lg w-max">
                            {listing.category || 'Asset'}
                          </span>
                          <span className="text-[10px] text-white/40 font-semibold block">{listing.features?.beds || '-'} Beds • {listing.features?.baths || '-'} Baths</span>
                        </div>
                      </td>

                      {/* City col */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold">
                          <MapPin size={12} className="text-[#C5A059]" />
                          <span>{listing.city}</span>
                        </div>
                        <span className="text-[9px] text-white/30 font-bold uppercase block mt-1 tracking-wider">{listing.features?.parking ? 'Parking' : 'No Parking'}</span>
                      </td>

                      {/* Submitter col */}
                      <td className="py-5 px-6">
                        <span className="text-white font-mono font-bold text-xs truncate max-w-[150px] block">
                          {listing.email || 'Unregistered Vendor'}
                        </span>
                        <span className="text-[#C5A059] text-xs font-bold font-mono tracking-tight block mt-1">
                          {listing.currency || 'USD'} {listing.price?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status / Badge col */}
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-2">
                          {listing.status === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              ACTIVE
                            </span>
                          )}
                          {listing.status === 'PENDING' && !hasChangesRequested && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              PENDING REVIEW
                            </span>
                          )}
                          {hasChangesRequested && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                              REVISIONS REQ
                            </span>
                          )}
                          {listing.status === 'SUSPENDED' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-rose-500/15 text-rose-400 border border-rose-500/25">
                              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full"></span>
                              SUSPENDED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions col */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Inspect Link */}
                          <a 
                            href={listing.category === 'vehicle' ? `/vehicles/${listing.id}` : `/properties/${listing.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 border border-white/5 text-white/65 hover:text-[#C5A059] hover:border-[#C5A059]/40 rounded-xl transition-all"
                            title="Inspect Live Asset"
                          >
                            <ExternalLink size={14} />
                          </a>

                          {/* Quick Edit button */}
                          <button
                            onClick={() => navigate(`/list-property?edit=${listing.id}`)}
                            className="p-2 bg-white/5 border border-white/5 text-white/65 hover:text-white rounded-xl transition-all"
                            title="Edit Core Specification"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Featured toggle */}
                          <button
                            onClick={() => handleToggleFeature(listing.id, !!listing.isFeatured)}
                            className={`p-2 border rounded-xl transition-all ${
                              listing.isFeatured 
                              ? 'bg-[#C5A059]/10 border-[#C5A059] text-[#C5A059]' 
                              : 'bg-white/5 border-white/5 text-white/30 hover:text-[#C5A059]'
                            }`}
                            title="Toggle Premium Feature Badge"
                          >
                            <Star size={14} fill={listing.isFeatured ? 'currentColor' : 'none'} />
                          </button>

                          {/* Request Changes button */}
                          {listing.status === 'PENDING' && (
                            <button
                              onClick={() => setFeedbackListing(listing)}
                              className="px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white rounded-xl text-[9px] uppercase font-bold tracking-wider transition-all"
                              title="Request specific data change"
                            >
                              Request Change
                            </button>
                          )}

                          {/* Approve Action */}
                          {listing.status === 'PENDING' && (
                            <button
                              disabled={actioningId === listing.id}
                              onClick={() => handleApprove(listing.id)}
                              className="px-3.5 py-1.5 bg-emerald-500 text-black hover:bg-white rounded-xl text-[9px] uppercase font-black tracking-widest transition-all shadow-md shadow-emerald-500/10"
                            >
                              Approve
                            </button>
                          )}

                          {/* Suspend or Trash */}
                          {listing.status === 'ACTIVE' && (
                            <button
                              disabled={actioningId === listing.id}
                              onClick={() => handleSuspend(listing.id)}
                              className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                              title="Suspend and Hide listing"
                            >
                              <EyeOff size={14} />
                            </button>
                          )}

                          {/* Restore action */}
                          {listing.status === 'SUSPENDED' && (
                            <button
                              disabled={actioningId === listing.id}
                              onClick={() => handleApprove(listing.id)}
                              className="px-3 py-1.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-black rounded-xl text-[9px] uppercase font-bold tracking-widest"
                            >
                              Restore Active
                            </button>
                          )}

                          {/* Expunge / Permanent Delete */}
                          <button
                            disabled={actioningId === listing.id}
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 bg-red-950/20 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all"
                            title="Critically Erase Permanent Source document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Ledger Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 px-6 py-4 rounded-2xl">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-xs gap-1 opacity-70 hover:opacity-100"
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-xs gap-1 opacity-70 hover:opacity-100"
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision Request Feedback Dialog Overlay */}
      <AnimatePresence>
        {feedbackListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-black/95 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#C5A059]">REVISION REGULATOR</span>
                  <h3 className="text-2xl font-display font-medium text-white mt-1">Request Property Changes</h3>
                </div>
                <button
                  onClick={() => setFeedbackListing(null)}
                  className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Target Asset</p>
                <div className="flex gap-4 items-center mt-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                    <img src={feedbackListing.images?.[0]} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold line-clamp-1">{feedbackListing.title}</p>
                    <p className="text-[10px] text-white/30 font-mono">Owner email: {feedbackListing.email || 'Unregistered Vendor'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitReviewRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Requested Adjustments & Feedback Advice</label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide specific notes regarding why the submitted details are insufficient (e.g. incorrect zoning information, blurred legal ownership screenshots)."
                    className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-[#C5A059]/40 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFeedbackListing(null)}
                    className="h-12 px-6 rounded-xl border-white/5 hover:bg-white/5 text-xs text-white/60 uppercase font-bold tracking-wider"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={sendingFeedback}
                    className="h-12 px-8 rounded-xl bg-[#C5A059] text-black hover:bg-white text-xs uppercase font-black tracking-widest gap-2"
                  >
                    {sendingFeedback ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />} Send Feedback Advice
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
