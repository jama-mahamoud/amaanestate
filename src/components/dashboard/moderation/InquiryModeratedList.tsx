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
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { moderationService } from '@/services/moderationService';
import { toast } from 'sonner';

export default function InquiryModeratedList() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const data = await moderationService.getContactMessages();
    setMessages(data);
    setLoading(false);
  };

  const handleArchive = async (id: string) => {
    setActioningId(id);
    // In a real app we'd have a specific status update
    toast.success('Message archived');
    setMessages(prev => prev.filter(m => m.id !== id));
    setActioningId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-luxury-gold mb-4" size={32} />
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Querying Message Vault...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass-card rounded-[3rem] border-dashed border-white/5">
        <MessageSquare className="text-white/10 mb-6" size={48} />
        <h3 className="text-2xl font-display font-bold">Inbox Empty</h3>
        <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">No communications recorded in the recent cycle</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          layout
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card hover:bg-white/[0.03] transition-all p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8"
        >
          {/* Header Info */}
          <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 text-luxury-gold flex items-center justify-center">
                   <User size={18} />
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
          <div className="flex-1 p-6 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[80px]">
             <p className="text-white/60 text-sm leading-relaxed">{msg.message}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
             <Button 
                onClick={() => handleArchive(msg.id)}
                disabled={actioningId === msg.id}
                variant="ghost"
                className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:border-luxury-gold hover:text-luxury-gold transition-all"
             >
                <Archive size={20} />
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
          </div>
        </motion.div>
      ))}
    </div>
  );
}
