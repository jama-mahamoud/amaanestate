import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GalleryUpload from '@/components/article/GalleryUpload';
import MapPicker from '@/components/location/MapPicker';
import { Check, Info, Shield, CheckCircle2, Upload, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const renderBasicInfo = (formData: any, setFormData: any) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
        <span>Property Title</span>
      </label>
      <Input 
        placeholder="e.g. Modern 4-Bedroom Villa with Garden" 
        value={formData.title} 
        onChange={e => setFormData({...formData, title: e.target.value})} 
        className="bg-white/5 border-white/10 h-14 rounded-2xl" 
      />
    </div>
    {/* ... (keep rest of fields) */}
  </div>
);

// ... and so on for all steps
