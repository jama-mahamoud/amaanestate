import React from 'react';
import { motion } from 'motion/react';
import { Home, Car, Users, TrendingUp, ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHome() {
  const stats = [
    { label: 'Active Listings', value: '42', icon: <Home />, change: '+12%' },
    { label: 'Vehicle Inventory', value: '18', icon: <Car />, change: '+5%' },
    { label: 'Active Agents', value: '24', icon: <Users />, change: '+2' },
    { label: 'Market Views', value: '1.2k', icon: <TrendingUp />, change: '+18%' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-display font-bold mb-3 tracking-tighter">Command <span className="text-white/20">Center</span></h1>
          <p className="text-white/20 text-sm font-bold uppercase tracking-[0.3em]">Institutional Grade Surveillance Interface Active</p>
        </div>
        <div className="flex gap-4">
           <div className="glass-card px-8 py-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-luxury-gold/5 blur-xl rounded-full" />
              <p className="text-[9px] uppercase tracking-[0.4em] font-black text-luxury-gold/40 mb-2">Regional Sentiment</p>
              <p className="text-2xl font-display font-bold tracking-tighter">Bullish <span className="text-luxury-gold">+4.2%</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group hover:border-luxury-gold/20 transition-all duration-700">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3x rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-luxury-black transition-all duration-500 shadow-xl group-hover:shadow-luxury-gold/20">
                  {stat.icon}
                </div>
                <div className="bg-luxury-gold/10 text-luxury-gold px-3 py-1 rounded-full text-[9px] font-black tracking-widest flex items-center gap-2">
                  {stat.change} <ArrowUpRight size={10} />
                </div>
              </div>
              <p className="text-5xl font-display font-bold mb-3 tracking-tighter">{stat.value}</p>
              <p className="text-white/10 text-[10px] uppercase tracking-[0.4em] font-black">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-8 space-y-12">
           <div className="glass-card rounded-[4rem] p-12 h-[500px] flex flex-col justify-between overflow-hidden relative group shadow-2xl">
              <div className="absolute top-0 right-0 w-full h-[50%] bg-gradient-to-b from-luxury-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div>
                <h3 className="text-3xl font-display font-bold mb-3 tracking-tight">Financial Performance</h3>
                <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Active Market Capitalization Sequence</p>
              </div>
              <div className="h-64 w-full flex items-end gap-4 px-4 pb-4">
                 {[40, 60, 45, 90, 65, 80, 100, 70, 85, 95, 110, 130].map((h, i) => (
                    <div key={i} className="flex-1 group/bar relative">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                         className="absolute bottom-0 w-full bg-white/[0.03] rounded-2xl group-hover/bar:bg-luxury-gold/20 transition-all duration-500 border border-white/[0.05]"
                       />
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity text-[10px] font-black text-luxury-gold tracking-widest">
                         {h}%
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-10 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
                <h4 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-4 tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <Clock size={18} />
                  </div>
                  System Frequency
                </h4>
                <div className="space-y-8">
                  {[
                    { action: 'Estate Record Logged', time: '02m', info: 'Sector IV • Residential' },
                    { action: 'Valuation recalibrated', time: '14h', info: 'Mobility • Asset 029' },
                    { action: 'Protocol Clearance', time: '21h', info: 'Agent AH-192' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group/item cursor-pointer">
                       <div className="space-y-1">
                         <p className="text-sm font-bold text-white group-hover/item:text-luxury-gold transition-colors">{item.action}</p>
                         <p className="text-[9px] text-white/10 uppercase font-black tracking-widest">{item.info}</p>
                       </div>
                       <span className="text-[10px] text-luxury-gold/40 font-black tabular-nums">{item.time} AGO</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-10 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
                <h4 className="text-xl font-display font-bold text-white mb-8 flex items-center gap-4 tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <MapPin size={18} />
                  </div>
                  Regional Dominance
                </h4>
                <div className="space-y-8">
                  {[
                    { city: 'Jigjiga Central', share: '45%', color: 'bg-luxury-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' },
                    { city: 'Dire Dawa Hub', share: '30%', color: 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' },
                    { city: 'Addis Link', share: '25%', color: 'bg-white/20' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                         <span className="text-white/20">{item.city}</span>
                         <span className="text-white">{item.share}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: item.share }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={`h-full ${item.color}`} 
                          />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="p-12 bg-luxury-gold rounded-[4rem] text-luxury-black relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/30 blur-[60px] rounded-full translate-x-1/4 -translate-y-1/4 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-black tracking-[0.4em] mb-4 opacity-50">Strategic Expansion</p>
                <h3 className="text-4xl font-display font-bold mb-8 leading-[0.9] tracking-tighter">Scale Your <br /> Digital Assets</h3>
                <p className="text-luxury-black/60 text-base font-medium mb-12 max-w-[220px] leading-relaxed italic">Initiate new property protocols across the regional network.</p>
                <Button className="w-full bg-luxury-black text-white hover:bg-luxury-black/90 h-20 rounded-[2rem] font-bold text-lg border-0 shadow-2xl shadow-luxury-gold/50 transition-all duration-500 hover:-translate-y-1">
                  Initialize New Log
                </Button>
              </div>
           </div>

           <div className="glass-card rounded-[4rem] p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/[0.01]" />
              <h3 className="text-2xl font-display font-bold mb-10 tracking-tight">Network Health</h3>
              <div className="space-y-8 relative z-10">
                 {[
                   { label: 'Blockchain Sync', status: 'Operational', color: 'bg-[#22c55e]' },
                   { label: 'Security Cryptography', status: 'Encrypted', color: 'bg-[#22c55e]' },
                   { label: 'AI Prediction Matrix', status: 'Active', color: 'bg-luxury-gold' },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between group cursor-pointer">
                      <p className="text-white/20 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">{s.label}</p>
                      <div className="flex items-center gap-4">
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/10 group-hover:text-white/30 transition-colors">{s.status}</span>
                         <div className={`w-2 h-2 rounded-full ${s.color} shadow-[0_0_10px_currentColor] animate-pulse`} />
                      </div>
                   </div>
                 ))}
              </div>
              <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-center">
                 <p className="text-white/5 text-[10px] font-black uppercase tracking-[0.5em]">Session Secured</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
