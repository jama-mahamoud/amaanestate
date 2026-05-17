import { User, Shield, Bell, Globe, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'motion/react';

export default function DashboardSettings() {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">System <span className="text-white/20">Config</span></h1>
          <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Institutional Preference & Security Matrix</p>
        </div>
        <Button className="bg-luxury-gold text-luxury-black hover:bg-white h-16 px-10 rounded-[2rem] font-bold shadow-2xl shadow-luxury-gold/20 transition-all duration-500">
          <Save size={18} className="mr-3" /> Synchronize Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 xl:col-span-8 space-y-12">
           
           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <User size={20} />
                 </div>
                 <h3 className="text-2xl font-display font-bold tracking-tight">Principal Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Authorized Full Name</label>
                    <Input defaultValue="Ahmed Mohamud" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Secure Email Endpoint</label>
                    <Input defaultValue="ahmed@amaanestate.com" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Geographic Assignment</label>
                    <Input defaultValue="Jigjiga, Somali Region" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 ml-2">Institutional Title</label>
                    <Input defaultValue="Regional Director" className="bg-white/5 border-0 h-16 rounded-2xl text-white px-6 focus-visible:ring-luxury-gold/30 text-lg" />
                 </div>
              </div>
           </section>

           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-luxury-gold/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <Shield size={20} />
                 </div>
                 <h3 className="text-2xl font-display font-bold tracking-tight">Security Cryptography</h3>
              </div>
              
              <div className="space-y-10">
                 <div className="flex items-center justify-between p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-base font-bold text-white tracking-tight">Multi-Factor Authentication</p>
                       <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Additional biometric and token verification required</p>
                    </div>
                    <div className="w-12 h-6 bg-luxury-gold rounded-full relative p-1 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                       <div className="absolute right-1 top-1 w-4 h-4 bg-luxury-black rounded-full" />
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer">
                    <div className="space-y-1">
                       <p className="text-base font-bold text-white tracking-tight">Encryption Key Rotation</p>
                       <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Automatic generation and deployment of new security keys every 30 days</p>
                    </div>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative p-1">
                       <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full" />
                    </div>
                 </div>
                 
                 <div className="pt-6">
                    <Button variant="outline" className="border-white/5 bg-white/5 text-white hover:bg-white/10 h-16 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                      Modify Security Blueprint
                    </Button>
                 </div>
              </div>
           </section>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-12">
           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-luxury-gold">
                    <Bell size={18} />
                 </div>
                 <h3 className="text-xl font-display font-bold tracking-tight">Protocol Logs</h3>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Asset Acquisitions', active: true },
                  { label: 'Market Fluctuations', active: true },
                  { label: 'System Announcements', active: false },
                  { label: 'Identity Reports', active: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-luxury-gold' : 'bg-white/5'}`} />
                  </div>
                ))}
              </div>
           </section>

           <section className="glass-card p-12 rounded-[4rem] relative overflow-hidden border-destructive/20 bg-destructive/[0.02]">
              <h3 className="text-xl font-display font-bold text-destructive mb-4 tracking-tight">Danger Zone</h3>
              <p className="text-white/30 text-xs font-light mb-8 leading-relaxed">Irreversible institutional account removal and asset de-registration.</p>
              <Button variant="outline" className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px]">
                 Decommission Identity
              </Button>
           </section>
        </div>
      </div>
    </div>
  );
}
