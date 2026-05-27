import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, Trash2, Building, CreditCard, 
  FileText, ShieldCheck, MessageSquare, Info, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification, NotificationType } from '@/services/notificationService';

export default function NotificationBell({ isDark }: { isDark?: boolean }) {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminUser = profile?.role === 'admin';

  // Real-time Firestore Subscription
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const unsubscribe = notificationService.subscribe(user.uid, isAdminUser, (data) => {
      setNotifications(data);
    });

    return () => unsubscribe();
  }, [user, isAdminUser]);

  // Click Outside Detection
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await notificationService.markAllAsRead(unreadIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;
    try {
      await notificationService.clearAllNotifications(ids);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'PROPERTY':
        return <Building size={14} className="text-white/60" />;
      case 'PAYMENT':
        return <CreditCard size={14} className="text-emerald-500" />;
      case 'AGREEMENT':
        return <FileText size={14} className="text-blue-500" />;
      case 'VERIFICATION':
        return <ShieldCheck size={14} className="text-indigo-500" />;
      case 'INQUIRY':
        return <MessageSquare size={14} className="text-white/60" />;
      default:
        return <Info size={14} className="text-white/40" />;
    }
  };

  const formatTime = (createdAt: any) => {
    if (!createdAt) return 'Just now';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button with badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 transition-all rounded-full flex items-center justify-center outline-none active:scale-95 text-white/60 hover:text-white hover:bg-white/10"
        aria-label="Toggle notifications"
      >
        <Bell size={18} className={`${unreadCount > 0 ? 'text-white' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[8px] font-black text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 lg:right-[-10px] mt-3 bg-super-charcoal border border-white/10 rounded-2xl shadow-2xl w-[340px] z-[100] flex flex-col"
          >
            {/* Dropdown Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Alert Log</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wider">
                    Read All
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5 no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                  <Bell size={18} className="text-white/10 mb-2" />
                  <p className="text-xs font-bold text-white/40">No alerts found</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition-all flex items-start gap-3 ${!n.read ? 'bg-white/[0.02]' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-white/5' : 'bg-transparent border border-white/5'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <p className={`text-xs ${!n.read ? 'font-bold text-white' : 'text-white/70'} line-clamp-1`}>{n.title}</p>
                        <span className="text-[8px] text-white/20 font-bold uppercase whitespace-nowrap">{formatTime(n.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-white/40 line-clamp-2 mt-0.5 font-light">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
