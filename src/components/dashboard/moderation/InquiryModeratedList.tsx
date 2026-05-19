import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  User, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Trash2,
  Loader2,
  Tag,
  Eye,
  Archive,
  MailOpen,
  MailCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

export default function InquiryModeratedList() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'new' | 'archived'>('new');
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getContactMessages();
      const filtered = statusFilter === 'new' 
        ? data.filter(m => !m.archived)
        : data.filter(m => m.archived);
      setMessages(filtered);
    } catch (err: any) {
      setError(err.message || 'Communication network offline');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string, currentStatus: boolean) => {
    setActioningId(id);
    const success = await moderationService.archiveMessage(id, !currentStatus);
    if (success) {
      toast.success(currentStatus ? 'Message restored' : 'Message archived');
      setMessages(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Failed to update message status');
    }
    setActioningId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    setActioningId(id);
    const success = await moderationService.deleteDocument('contactMessages', id);
    if (success) {
      toast.success('Communication deleted');
      setMessages(prev => prev.filter(m => m.id !== id));
    } else {
      toast.error('Failed to delete message');
    }
    setActioningId(null);
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="animate-spin text-luxury-gold mb-6" size={48} />
        <div className="text-center">
          <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.4em] mb-2">Accessing Comm Link...</p>
          <p className="text-white/10 text-[8px] uppercase tracking-widest">Querying encrypted database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border border-red-500/10">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
           <MessageSquare size={32} />
        </div>
        <h3 className="text-2xl font-display font-bold">Signal Lost</h3>
        <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">{error}</p>
        <Button onClick={loadMessages} className="mt-8 border border-white/10 hover:border-luxury-gold">Reconnect Signal</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="flex flex-wrap gap-2">
        {(['new', 'archived'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${
              statusFilter === s 
              ? 'bg-luxury-gold text-black border-luxury-gold' 
              : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
            } border`}
          >
            {s}
          </button>
        ))}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
          <MessageSquare className="text-white/10 mb-6" size={48} />
          <h3 className="text-2xl font-display font-bold">Inbox Empty</h3>
          <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">No communications found for this status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card hover:bg-white/[0.03] transition-all p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8"
            >
              {/* Header Info */}
              <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center border border-luxury-gold/20">
                       <User size={20} />
                    </div>
                    <div className="min-w-0">
                       <p className="text-sm font-bold text-white truncate">{msg.fullName}</p>
                       <p className="text-[10px] font-medium text-white/40 truncate">{msg.email}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-white/20 text-[8px] font-black uppercase tracking-widest">
                       <Tag size={10} className="text-luxury-gold/50" /> {msg.inquiryType || 'General'}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/20 text-[8px] font-black uppercase tracking-widest">
                       <Clock size={10} className="text-luxury-gold/50" /> {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString() : 'N/A'}
                    </div>
                 </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[100px]">
                 <p className="text-white/60 text-sm leading-relaxed">{msg.message}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 shrink-0">
                 <Button 
                    onClick={() => handleArchive(msg.id, !!msg.archived)}
                    disabled={actioningId === msg.id}
                    variant="ghost"
                    className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                    title={msg.archived ? 'Restore' : 'Archive'}
                 >
                    {msg.archived ? <MailOpen size={20} /> : <Archive size={20} />}
                 </Button>
                 <Button 
                    asChild
                    variant="ghost"
                    className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold transition-all"
                 >
                    <a href={`mailto:${msg.email}`}>
                      <Mail size={20} />
                    </a>
                 </Button>
                 <Button 
                    onClick={() => handleDelete(msg.id)}
                    disabled={actioningId === msg.id}
                    variant="ghost"
                    className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500 hover:text-white transition-all"
                 >
                    <Trash2 size={20} />
                 </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
