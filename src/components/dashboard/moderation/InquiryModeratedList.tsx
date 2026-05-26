import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  User, 
  Mail, 
  Phone,
  Clock, 
  CheckCircle2, 
  Trash2,
  Loader2,
  Tag,
  Eye,
  Archive,
  MailOpen,
  Send,
  SlidersHorizontal,
  Search,
  Check,
  Building2,
  Bookmark,
  ChevronDown,
  ChevronRight,
  EyeOff,
  UserCheck,
  RefreshCw,
  Clock3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

export default function InquiryModeratedList() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Outer categorization filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'contacted' | 'resolved' | 'follow_up'>('all');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'buyer' | 'callback' | 'whatsapp' | 'tour'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Interactive Response and Tracking Note states
  const [trackingNotes, setTrackingNotes] = useState<{ [key: string]: string }>({});
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    
    const unsubscribe = moderationService.subscribeToMessages((data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'new' | 'contacted' | 'resolved' | 'follow_up') => {
    setActioningId(id);
    const notes = trackingNotes[id] || '';
    const success = await moderationService.updateInquiryStatus(id, status, notes);
    if (success) {
      toast.success(`Inquiry marked as ${status.replace('_', ' ').toUpperCase()}`);
    } else {
      toast.error('Failed to update tracking state.');
    }
    setActioningId(null);
  };

  const handleSaveInternalNote = async (id: string, newStatus: any) => {
    setSavingNotes(id);
    const notes = trackingNotes[id] || '';
    const success = await moderationService.updateInquiryStatus(id, newStatus, notes);
    if (success) {
      toast.success('Internal response tracking note saved.');
    } else {
      toast.error('Failed to update tracking note.');
    }
    setSavingNotes(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently from database records? This is irreversible.')) return;
    setActioningId(id);
    const success = await moderationService.deleteDocument('contactMessages', id);
    if (success) {
      toast.success('Communication and associated leads deleted permanently.');
    } else {
      toast.error('Failed to purge inquiry card.');
    }
    setActioningId(null);
  };

  // Safe categorization mapper
  const getInquiryTypeStr = (typeVal: string) => {
    const v = (typeVal || '').toLowerCase();
    if (v.includes('callback') || v.includes('call')) return 'Callback Request';
    if (v.includes('whatsapp') || v.includes('chat')) return 'WhatsApp Lead';
    if (v.includes('tour') || v.includes('booking') || v.includes('visit')) return 'Property Tour Booking';
    return 'Buyer Inquiry';
  };

  const getInquiryTypeBadge = (typeVal: string) => {
    const str = getInquiryTypeStr(typeVal);
    if (str === 'Callback Request') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
    if (str === 'WhatsApp Lead') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (str === 'Property Tour Booking') {
      return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
    return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
  };

  // Local matching computed state
  const filteredMessages = React.useMemo(() => {
    let result = [...messages];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(msg => {
        const curStat = msg.responseStatus || 'new';
        return curStat === statusFilter;
      });
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter(msg => {
        const mappedStr = getInquiryTypeStr(msg.inquiryType || msg.type);
        if (typeFilter === 'callback') return mappedStr === 'Callback Request';
        if (typeFilter === 'whatsapp') return mappedStr === 'WhatsApp Lead';
        if (typeFilter === 'tour') return mappedStr === 'Property Tour Booking';
        if (typeFilter === 'buyer') return mappedStr === 'Buyer Inquiry';
        return true;
      });
    }

    // Keyword matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(msg => 
        (msg.fullName || '').toLowerCase().includes(q) ||
        (msg.email || '').toLowerCase().includes(q) ||
        (msg.phone || '').toLowerCase().includes(q) ||
        (msg.message || '').toLowerCase().includes(q) ||
        (msg.propertyId || '').toLowerCase().includes(q) ||
        (msg.propertyName || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [messages, statusFilter, typeFilter, searchQuery]);

  // Paginated chunk
  const paginatedMessages = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMessages.slice(start, start + itemsPerPage);
  }, [filteredMessages, currentPage]);

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Sub-header Filter system */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'new', 'contacted', 'resolved', 'follow_up'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s 
                ? 'bg-[#C5A059] text-black shadow-lg shadow-[#C5A059]/10' 
                : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Inquiries' : s === 'new' ? 'New Inquiries' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
          {filteredMessages.length} inquiries in list
        </div>
      </div>

      {/* Grid Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-[50%] -translate-y-[50%] text-white/40" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          />
        </div>

        {/* Medium and Origin Source dropdown */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-xs font-semibold text-white/80 focus:outline-none focus:border-[#C5A059]/40 transition-colors"
          >
            <option value="ALL">All Communication Channels</option>
            <option value="buyer">Direct Buyer Inquiries</option>
            <option value="callback">Callback Phone Requests</option>
            <option value="whatsapp">WhatsApp Pings</option>
            <option value="tour">Property Tour requests</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-xs text-white/30 font-bold uppercase tracking-widest px-2">
          Enterprise Response Center
        </div>
      </div>

      {/* Inquiries Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-[2rem] gap-4">
          <Loader2 size={32} className="animate-spin text-[#C5A059]" />
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Querying communications node registry...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-[2rem] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
            <MessageSquare size={28} />
          </div>
          <h4 className="text-xl font-display font-medium text-white/95">No pending reviews</h4>
          <p className="text-white/35 text-[11px] uppercase tracking-wider mt-2.5">Inbox synchronized successfully with real-time leads.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {paginatedMessages.map((msg) => {
              const typeBadge = getInquiryTypeBadge(msg.inquiryType || msg.type);
              const mappedType = getInquiryTypeStr(msg.inquiryType || msg.type);
              const isExpanded = expandedId === msg.id;
              
              // Initial note fallback
              if (trackingNotes[msg.id] === undefined) {
                trackingNotes[msg.id] = msg.trackerNotes || '';
              }

              const responseStatus = msg.responseStatus || 'new';

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/[0.005] border border-white/5 hover:border-white/10 transition-all rounded-[2rem]"
                >
                  {/* Standard Header Row */}
                  <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Channel & Target info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg ${typeBadge}`}>
                          {mappedType}
                        </span>
                        
                        {responseStatus === 'new' && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                            New Lead
                          </span>
                        )}
                        {responseStatus === 'contacted' && (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                            Brokers Contacted
                          </span>
                        )}
                        {responseStatus === 'follow_up' && (
                          <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                            Follow-Up Pending
                          </span>
                        )}
                        {responseStatus === 'resolved' && (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase">
                            Resolved Ticket
                          </span>
                        )}
                      </div>

                      <h4 className="text-xl font-display font-bold text-white tracking-tight">{msg.fullName}</h4>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#C5A059]" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-[#C5A059]" /> {msg.phone}</span>}
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#C5A059]" /> {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </div>

                    {/* Linked Property Anchor, if applicable */}
                    {msg.propertyName || msg.propertyId ? (
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 max-w-sm shrink-0">
                        <div className="flex items-center gap-1.5 text-white/30 text-[9px] uppercase font-bold tracking-widest">
                          <Building2 size={11} className="text-[#C5A059]" /> Anchored Asset Target
                        </div>
                        <p className="text-xs font-semibold text-white/80 line-clamp-1">{msg.propertyName || 'Platform Registered Listing'}</p>
                        <p className="text-[9px] font-mono text-white/30 uppercase truncate">REF ID: {msg.propertyId?.substring(0, 16) || 'General Agency Routing'}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-white/30 bg-white/5 border border-white/5 p-3 rounded-2xl uppercase font-bold tracking-widest text-center">
                        General Corporate Lead
                      </div>
                    )}

                    {/* Expand/Delete button set */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                        variant="outline"
                        className="h-12 w-12 rounded-xl bg-white/5 border-white/5 hover:border-[#C5A059]/30 hover:text-[#C5A059]"
                      >
                        {isExpanded ? <ChevronDown size={18} className="rotate-180 transition-transform" /> : <ChevronRight size={18} />}
                      </Button>
                      <Button
                        onClick={() => handleDelete(msg.id)}
                        disabled={actioningId === msg.id}
                        variant="ghost"
                        className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 border border-red-500/10 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Expand content body (Details & internal Tracking Console) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-white/[0.005] overflow-hidden"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          {/* Inner Inquiry Message block */}
                          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                            <span className="text-[10px] uppercase font-black text-[#C5A059] tracking-widest block">Inquiry Narrative Body</span>
                            <p className="text-sm font-medium leading-relaxed font-sans text-white/80 whitespace-pre-line italic">
                              "{msg.message || 'No explicit textual message provided. Simple request callback submitted.'}"
                            </p>
                          </div>

                          {/* Response and Internal Activity Tracker Core */}
                          <div className="p-6 bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-3xl md:-mx-2 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h5 className="text-[#C5A059] text-[10px] uppercase font-black tracking-[0.2em]">Response Tracking & Audit Notes</h5>
                                <p className="text-white/40 text-[11px] font-medium leading-relaxed mt-1">
                                  Mark this inquiry status and write internal records. Note who was assigned or the resolution description.
                                </p>
                              </div>

                              {/* Quick status toggle pills */}
                              <div className="flex flex-wrap gap-2">
                                {(['new', 'contacted', 'resolved', 'follow_up'] as const).map((statusVal) => (
                                  <button
                                    key={statusVal}
                                    onClick={() => handleUpdateStatus(msg.id, statusVal)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] uppercase font-black tracking-wider transition-all border ${
                                      responseStatus === statusVal
                                      ? 'bg-white text-black border-white'
                                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                                    }`}
                                  >
                                    {statusVal.replace('_', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Internal log feedback box */}
                            <div className="space-y-3">
                              <label className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">Internal Moderator Tracker Notes</label>
                              <div className="flex flex-col md:flex-row gap-3">
                                <input
                                  type="text"
                                  value={trackingNotes[msg.id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setTrackingNotes(prev => ({ ...prev, [msg.id]: val }));
                                  }}
                                  placeholder="Eg: Owner contacted via WhatsApp. Assigned to lead broker Habibullah at Kabul branch."
                                  className="flex-1 px-4 py-3 bg-black/40 border border-[#C5A059]/10 rounded-xl text-xs font-semibold text-white/95 focus:outline-none focus:border-[#C5A059]/40 placeholder:text-white/20"
                                />
                                <Button
                                  disabled={savingNotes === msg.id}
                                  onClick={() => handleSaveInternalNote(msg.id, responseStatus)}
                                  className="h-10 px-6 rounded-xl bg-[#C5A059] hover:bg-white text-black text-[10px] uppercase font-black tracking-widest"
                                >
                                  {savingNotes === msg.id ? <Loader2 size={12} className="animate-spin" /> : 'Save Log Entry'}
                                </Button>
                              </div>
                            </div>

                            {/* Response details footer audit log */}
                            {msg.lastResponsedBy && (
                              <div className="pt-4 border-t border-[#C5A059]/10 flex flex-wrap items-center justify-between gap-4 text-[9px] uppercase font-black text-[#C5A059]/60 tracking-widest">
                                <div className="flex items-center gap-2">
                                  <UserCheck size={14} /> Last tracked by: {msg.lastResponsedBy}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock3 size={14} /> Response Registered: {msg.respondedAt?.toDate ? msg.respondedAt.toDate().toLocaleTimeString() : 'N/A'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

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
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  className="h-10 px-4 rounded-xl text-xs gap-1 opacity-70 hover:opacity-100"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
