import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutList, Users, FileText, MessageSquare, User, Loader2 } from 'lucide-react';

interface Stats {
  pendingListings: number;
  pendingProfessionals: number;
  totalVerifiedProfessionals: number;
  totalListings: number;
  totalArticles: number;
  totalInquiries: number;
  totalUsers: number;
}

export default function ModerationStats({ stats, loading }: { stats: Stats; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <Loader2 className="animate-spin text-white/50" />
      </div>
    );
  }

  const items = [
    { label: 'Total Articles', value: stats.totalArticles, icon: <FileText size={20} /> },
    { label: 'Total Inquiries', value: stats.totalInquiries, icon: <MessageSquare size={20} /> },
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-white/5 border-white/5 rounded-2xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{item.label}</p>
              <h3 className="text-3xl font-display font-bold text-white mt-1">{item.value}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#C5A059]">
              {item.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
