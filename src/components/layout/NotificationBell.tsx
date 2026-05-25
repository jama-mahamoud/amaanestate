import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Check, Trash2, Building, CreditCard, 
  FileText, ShieldCheck, MessageSquare, Info, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification, NotificationType } from '@/services/notificationService';

export default function NotificationBell() {
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
        return <Building size={14} className="text-[#C5A059]" />;
      case 'PAYMENT':
        return <CreditCard size={14} className="text-emerald-400" />;
      case 'AGREEMENT':
        return <FileText size={14} className="text-blue-400" />;
      case 'VERIFICATION':
        return <ShieldCheck size={14} className="text-indigo-400" />;
      case 'INQUIRY':
        return <MessageSquare size={14} className="text-[#C5A059]" />;
      default:
        return <Info size={14} className="text-white/60" />;
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
        className="relative p-2.5 text-white/60 hover:text-white hover:bg-white/[0.04] active:scale-95 duration-200 transition-all rounded-full flex items-center justify-center outline-none"
        aria-label="Toggle notifications"
      >
        <Bell size={18} className={`${unreadCount > 0 ? 'animate-pulse text-white' : ''}`} />
        
        {unreadCount > 0 && (
          <>
            {/* Soft breathing ring animate */}
            <span className="absolute top-1 right-1 flex h-4 w-4 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-luxury-gold/50 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C5A059] items-center justify-center text-[8px] font-black text-black">
                {unreadCount}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="absolute right-0 lg:right-[-10px] sm:right-0 mt-3 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden w-[340px] z-[100] flex flex-col"
          >
            {/* Dropdown Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Alert Log</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-luxury-gold/10 border border-luxury-gold/20 text-luxury-gold text-[9px] font-bold">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] text-white/40 hover:text-luxury-gold transition-colors font-medium cursor-pointer"
                    >
                      Read All
                    </button>
                    <span className="h-2 w-px bg-white/10" />
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] text-white/40 hover:text-red-400 transition-colors font-medium flex items-center gap-0.5 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List Container */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-white/[0.03] no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white/70">No notifications yet</h4>
                    <p className="text-[10px] text-white/40 max-w-[200px] mt-1">
                      Direct transactional updates and admin activity logs will manifest here.
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-all duration-300 flex items-start gap-3 relative ${
                      !n.read 
                        ? 'bg-luxury-gold/[0.02] hover:bg-luxury-gold/[0.04]' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Unread dot indicator */}
                    {!n.read && (
                      <span className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    )}

                    {/* Left Icon Panel */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      !n.read 
                        ? 'bg-luxury-gold/10 border-luxury-gold/20' 
                        : 'bg-white/[0.02] border-white/5'
                    } ${!n.read ? '' : 'pl-0.5'}`}>
                      {getIcon(n.type)}
                    </div>

                    {/* Notice Detail Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className={`text-xs ${!n.read ? 'font-semibold text-white/95' : 'text-white/70'} leading-snug truncate`}>
                          {n.title}
                        </h4>
                        <span className="text-[9px] text-white/30 whitespace-nowrap pt-0.5">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed mt-1 font-light break-words">
                        {n.message}
                      </p>

                      {/* Micro actions per card */}
                      {!n.read && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={(e) => handleMarkAsRead(n.id, e)}
                            className="text-[9px] text-luxury-gold/80 hover:text-white transition-colors font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={10} strokeWidth={3} /> Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer summary */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/5 text-center bg-white/[0.01]">
                <p className="text-[10px] text-white/45">
                  Showing {notifications.length} transactional logs
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
