import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Building2, Phone, MapPin, Loader2, Sparkles, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { brokerService } from '@/services/brokerService';

const SPECIALTIES_OPTIONS = ['Residential', 'Commercial', 'Beachfront', 'Farmlands', 'Luxury Villas', 'Development Land'];

export default function AgentRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    bio: '',
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    telegram: '',
    city: '',
    region: 'Somali Region',
    officeAddress: '',
    propertySpecialization: [] as string[],
    languagesSpoken: '',
    yearsOfExperience: '',
    licenseNumber: '',
    businessHours: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await brokerService.applyForBroker(user.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        region: formData.region,
        city: formData.city,
        officeAddress: formData.officeAddress,
        companyName: formData.companyName,
        governmentIdUrl: 'N/A', // TODO: Add upload
        businessLicenseUrl: 'N/A', // TODO: Add upload
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        areasOfOperation: [formData.city, formData.region],
        propertySpecialization: formData.propertySpecialization,
        languagesSpoken: formData.languagesSpoken.split(',').map(s => s.trim()),
        bio: formData.bio,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      propertySpecialization: prev.propertySpecialization.includes(spec)
        ? prev.propertySpecialization.filter(s => s !== spec)
        : [...prev.propertySpecialization, spec]
    }));
  };

  if (!user) return <div className="min-h-screen bg-super-black flex items-center justify-center text-white">Please sign in to apply.</div>;

  return (
    <div className="min-h-screen bg-super-black py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Join Our Premium Network</h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">Build your professional profile and start reaching sophisticated property buyers.</p>
        </header>

        <div className="bg-[#111] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            {/* Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] font-bold">1</div>
                <h2 className="text-xl font-display font-semibold text-white">Identity & Branding</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
                  <Input placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="bg-white/5 border-none h-14 rounded-2xl pl-12" />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
                  <Input placeholder="Company / Agency Name" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl pl-12" />
                </div>
                <Input placeholder="Website URL" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="License Number (optional)" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
              </div>
            </section>

            {/* Expertise */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] font-bold">2</div>
                <h2 className="text-xl font-display font-semibold text-white">Professional Information</h2>
              </div>
              <textarea placeholder="Tell us about your professional background and experience..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/5 border-none p-5 rounded-2xl text-white h-32 focus:ring-2 focus:ring-[#C5A059]/50" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input placeholder="Years of Experience" type="number" value={formData.yearsOfExperience} onChange={e => setFormData({...formData, yearsOfExperience: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
                  <Input placeholder="Languages Spoken (e.g. English, Somali)" value={formData.languagesSpoken} onChange={e => setFormData({...formData, languagesSpoken: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
              </div>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES_OPTIONS.map(spec => (
                  <button 
                    key={spec} 
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.propertySpecialization.includes(spec) 
                        ? 'bg-[#C5A059] text-black' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </section>

             {/* Contact */}
             <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] font-bold">3</div>
                <h2 className="text-xl font-display font-semibold text-white">Contact & Social</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} required className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="Facebook URL" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="Instagram URL" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="Telegram Username" value={formData.telegram} onChange={e => setFormData({...formData, telegram: e.target.value})} className="bg-white/5 border-none h-14 rounded-2xl" />
                <Input placeholder="Office Address" value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} required className="bg-white/5 border-none h-14 rounded-2xl" />
              </div>
            </section>

            <Button type="submit" size="lg" className="w-full bg-[#C5A059] hover:bg-white text-black h-14 rounded-2xl text-base font-bold shadow-lg shadow-[#C5A059]/10 flex items-center gap-2" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" /> Submitting...</> : <>Complete Application <ChevronRight size={18}/></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
