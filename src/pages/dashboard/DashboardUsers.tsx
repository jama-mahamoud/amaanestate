import { Plus, Search, Filter, Edit3, Trash2, ShieldCheck, User, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

const MOCK_USERS = [
  { id: '1', name: 'Ahmed Mohamud', email: 'ahmed@amaan.com', role: 'Super Admin', status: 'Active', listings: 14 },
  { id: '2', name: 'Sarah Hassan', email: 'sarah@jigjiga.com', role: 'Verified Agent', status: 'Active', listings: 8 },
  { id: '3', name: 'Khalid Ibrahim', email: 'khalid@elite.com', role: 'Premium Broker', status: 'Pending', listings: 0 },
];

export default function DashboardUsers() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Identity <span className="text-white/20">Registry</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Institutional Verification & Authority Mapping</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500 hover:-translate-y-1">
          <Plus size={20} className="mr-3" /> Authorize New Entity
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-luxury-gold transition-colors" size={20} />
          <Input 
            placeholder="Scan global identity database..." 
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> clearance Level
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Identified User</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Authority Role</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">System Status</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Asset Load</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_USERS.map((user, i) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group hover:bg-white/[0.02] transition-all duration-500"
                >
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 relative">
                          {user.role === 'Super Admin' ? <ShieldCheck size={20} className="text-luxury-gold" /> : <User size={20} className="text-white/20 group-hover:text-luxury-gold transition-colors" />}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${user.status === 'Active' ? 'bg-green-500' : 'bg-luxury-gold'}`} />
                       </div>
                       <div>
                          <p className="text-lg font-display font-bold text-white mb-1 group-hover:text-luxury-gold transition-colors">{user.name}</p>
                          <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                             <Mail size={10} className="text-luxury-gold/50" /> {user.email}
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                      user.role === 'Super Admin' ? 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold' : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         user.status === 'Active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                       }`} />
                       <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-8">
                     <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Managed Assets</p>
                     <p className="text-sm font-bold text-white tabular-nums">{user.listings} UNITS</p>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-white"><ShieldAlert size={18} /></Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-white/10 hover:text-luxury-gold"><Edit3 size={18} /></Button>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"><Trash2 size={18} /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
