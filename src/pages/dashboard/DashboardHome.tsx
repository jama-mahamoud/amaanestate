import React from 'react';
import { motion } from 'motion/react';
import { Home, Car, Users, TrendingUp, ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const stats = [
    { label: 'Active Listings', value: '42', icon: <Home className="text-luxury-gold" />, change: '+12%' },
    { label: 'Vehicle Inventory', value: '18', icon: <Car className="text-white" />, change: '+5%' },
    { label: 'Active Agents', value: '24', icon: <Users className="text-luxury-gold" />, change: '+2' },
    { label: 'Market Views', value: '1.2k', icon: <TrendingUp className="text-white" />, change: '+18%' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Portfolio <span className="text-white/40">Overview</span></h1>
          <p className="text-white/40 font-medium">Welcome back to AmaanEstate elite dashboard.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-luxury-gold/10 p-4 rounded-2xl border border-luxury-gold/20 flex flex-col items-end">
              <p className="text-[10px] uppercase tracking-widest font-bold text-luxury-gold mb-1">Market Sentiment</p>
              <p className="text-xl font-display font-bold">Bullish +4.2%</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-luxury-charcoal/40 border-white/5 p-8 rounded-[2.5rem] hover:border-luxury-gold/30 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <Badge className="bg-luxury-gold/10 text-luxury-gold border-0 flex items-center gap-1">
                  {stat.change} <ArrowUpRight size={10} />
                </Badge>
              </div>
              <p className="text-3xl font-display font-bold mb-1 tracking-tight">{stat.value}</p>
              <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-luxury-charcoal/40 border border-white/5 rounded-[3rem] p-10 h-[400px] flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div>
                <h3 className="text-2xl font-display font-bold mb-2">Revenue Growth</h3>
                <p className="text-white/40 text-sm">Monthly performance across all regional segments.</p>
              </div>
              <div className="h-48 w-full flex items-end gap-3 px-4">
                 {[40, 60, 45, 90, 65, 80, 100, 70, 85, 95, 110, 130].map((h, i) => (
                   <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group/bar">
                      <div 
                        className="absolute bottom-0 w-full bg-luxury-gold/40 rounded-t-lg transition-all duration-1000 delay-[i*100ms] group-hover/bar:bg-luxury-gold" 
                        style={{ height: `${h}%` }}
                      ></div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                <h4 className="text-white font-bold mb-6 flex items-center gap-3">
                  <Clock size={18} className="text-luxury-gold" /> Recent Activity
                </h4>
                <div className="space-y-6">
                  {[
                    { action: 'New Villa Listed', time: '2m ago', info: 'Jigjiga Airport Rd' },
                    { action: 'Price Updated', time: '1h ago', info: 'Land Cruiser V8' },
                    { action: 'Agent Approved', time: '4h ago', info: 'Abdi Hassan' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                       <div>
                         <p className="text-sm font-bold">{item.action}</p>
                         <p className="text-[10px] text-white/30 uppercase tracking-widest">{item.info}</p>
                       </div>
                       <span className="text-[10px] text-luxury-gold/60 font-bold">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                <h4 className="text-white font-bold mb-6 flex items-center gap-3">
                  <MapPin size={18} className="text-luxury-gold" /> Top Performing Cities
                </h4>
                <div className="space-y-6">
                  {[
                    { city: 'Jigjiga', share: '45%', color: 'bg-luxury-gold' },
                    { city: 'Dire Dawa', share: '30%', color: 'bg-white' },
                    { city: 'Addis Ababa', share: '25%', color: 'bg-white/40' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                         <span className="text-white/60">{item.city}</span>
                         <span className="text-white">{item.share}</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: item.share }}></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="p-10 bg-luxury-gold rounded-[3rem] text-luxury-black relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
              <h3 className="text-2xl font-display font-bold mb-6 relative z-10 leading-tight">Ready To Expand Your <br /> Regional Presence?</h3>
              <p className="text-luxury-black/70 text-sm mb-8 relative z-10">Add new properties or vehicles and reach the regions most qualified buyers.</p>
              <Button className="w-full bg-luxury-black text-white hover:bg-luxury-black/80 h-14 rounded-2xl font-bold relative z-10 border-0">
                Create New Listing
              </Button>
           </div>

           <div className="bg-luxury-charcoal/40 border border-white/5 rounded-[3rem] p-10">
              <h3 className="text-xl font-display font-bold mb-8">System Health</h3>
              <div className="space-y-6">
                 {[
                   { label: 'Marketplace Sync', status: 'Operational', color: 'bg-green-500' },
                   { label: 'Security Protocols', status: 'Active', color: 'bg-green-500' },
                   { label: 'AI Optimization', status: 'Enhanced', color: 'bg-luxury-gold' },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <p className="text-white/60 text-sm">{s.label}</p>
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${s.color} animate-pulse`}></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{s.status}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${className}`}>
    {children}
  </div>
);
