import { Plus, Search, Filter, Edit3, Trash2, ShieldCheck, User, Mail, ShieldAlert, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types';
import EmptyState from '@/components/EmptyState';

export default function DashboardUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (active: boolean) => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      if (active) setUsers(data);
    } catch (err: any) {
      if (active) setError(err.message || 'Failed to load user registry.');
    } finally {
      if (active) setLoading(false);
    }
  };

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      (u.displayName || '').toLowerCase().includes(q) || 
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  useEffect(() => {
    let active = true;
    loadUsers(active);
    return () => { active = false; };
  }, []);

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-0 h-16 pl-16 rounded-2xl text-white placeholder:text-white/10 text-lg focus-visible:ring-luxury-gold/30" 
          />
        </div>
        <Button variant="outline" className="border-white/5 bg-white/5 text-white h-16 px-8 rounded-2xl hover:bg-luxury-gold hover:text-luxury-black transition-all duration-500 font-bold uppercase tracking-widest text-[10px]">
          <Filter size={18} className="mr-3" /> clearance Level
        </Button>
      </div>

      <div className="glass-card rounded-[3.5rem] overflow-hidden relative shadow-2xl min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader2 className="w-12 h-12 text-luxury-gold animate-spin mb-4" />
             <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em]">Authenticating Registry Connection...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Identified User</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Authority Role</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">System Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user, i) => (
                  <motion.tr 
                    key={user.uid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group hover:bg-white/[0.02] transition-all duration-500"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.role === 'admin' ? <ShieldCheck size={20} className="text-luxury-gold" /> : <User size={20} className="text-white/20 group-hover:text-luxury-gold transition-colors" />
                            )}
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${user.isVerified ? 'bg-green-500' : 'bg-luxury-gold'}`} />
                         </div>
                         <div>
                            <p className="text-lg font-display font-bold text-white mb-1 group-hover:text-luxury-gold transition-colors">{user.displayName}</p>
                            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                               <Mail size={10} className="text-luxury-gold/50" /> {user.email}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${
                        user.role === 'admin' ? 'bg-luxury-gold/10 border-luxury-gold/30 text-luxury-gold' : 'bg-white/5 border-white/10 text-white/40'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           user.isVerified ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                         }`} />
                         <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{user.isVerified ? 'Verified' : 'Pending'}</span>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg border border-white/10 text-[10px] uppercase font-bold tracking-wider hover:bg-white/10 gap-1.5 flex items-center text-white/80 hover:text-white"
                          title="Audit Entity Clearance"
                          onClick={() => console.log('Audit user:', user.uid)}
                        >
                          <ShieldAlert size={14} />
                          <span>Audit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/10 text-luxury-gold text-[10px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                          title="Edit Entity Role"
                          onClick={() => console.log('Edit user:', user.uid)}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider gap-1.5 flex items-center"
                          title="Revoke Entity Access"
                          onClick={() => console.log('Delete user:', user.uid)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState 
            variant="dashed"
            showPlusIcon
            title="Registry Empty" 
            description={error || "The identity database is currently offline. No institutional entities have been authorized for network access."} 
            actionLabel="Authorize New Entity"
            onAction={() => console.log('Init User')}
            icon={<Users size={48} />}
          />
        )}
      </div>
    </div>
  );
}
