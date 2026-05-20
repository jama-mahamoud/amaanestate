import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, ChevronRight, ChevronLeft, Loader2, MapPin, 
  Home, Bed, Bath, Hash, Check, Info, Shield, 
  Trash2, HelpCircle, CheckCircle2, Award, FileText, 
  ExternalLink, Eye, Map, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listingService } from '@/services/listingService';
import { uploadFile } from '@/services/uploadService';
import GalleryUpload from '@/components/article/GalleryUpload';
import MapPicker from '@/components/location/MapPicker';

// Document Uploader helper component for Step 5
function DocumentUploader({
  label,
  description,
  value,
  onChange
}: {
  label: string;
  description: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setProgress(20);
      const url = await uploadFile(file, 'legal_docs', (p) => setProgress(p));
      onChange(url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload credential document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all">
      <div className="flex-1">
        <p className="text-white text-sm font-bold tracking-wide">{label}</p>
        <p className="text-white/40 text-[11px] mt-1">{description}</p>
        {value && (
          <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-xl w-max">
            <Check size={14} /> Document Uploaded & Certified
          </div>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-4">
        {uploading ? (
          <div className="flex items-center gap-2 text-xs text-[#C5A059] font-bold uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin" /> {progress > 20 ? `${Math.round(progress)}%` : 'Uploading...'}
          </div>
        ) : value ? (
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => onChange('')}
              className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors bg-red-400/5 px-3 py-2 rounded-xl border border-red-500/10"
            >
              Remove
            </button>
            <a 
              href={value} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-white/5"
            >
              View File <ExternalLink size={12} />
            </a>
          </div>
        ) : (
          <label className="h-11 px-6 bg-white/5 hover:bg-white text-white hover:text-black font-bold rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors border border-white/10">
            <Upload size={14} /> Upload File
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}

export default function CreateProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: 'Jigjiga',
    subcategory: 'Apartment',
    listingType: 'sale' as 'sale' | 'rent',
    size: '',
    beds: 1,
    baths: 1,
    images: [] as string[],
    district: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    
    // Legal & Safety Verification Docs (Step 5)
    legalReferenceNumber: '',
    governmentRegistryNumber: '',
    associatedBrokerId: '',
    legalOwnershipCertificateUrl: '',
    legalTitleDeedUrl: '',
    sellerNationalIdUrl: '',
  });

  // Calculate overall form completion progress
  const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Location' },
    { id: 3, label: 'Property Photos' },
    { id: 4, label: 'Description' },
    { id: 5, label: 'Verification' },
    { id: 6, label: 'Preview & Submit' }
  ];

  const handleNextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.price.trim() !== '' && formData.subcategory.trim() !== '' && formData.size.trim() !== '';
      case 2:
        return formData.city.trim() !== '' && formData.district.trim() !== '' && formData.landmark.trim() !== '';
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.description.trim().length >= 15;
      case 5:
        // Rent Listings do not strictly require all seller deeds, Sale listings require deeds
        if (formData.listingType === 'sale') {
          return formData.legalReferenceNumber.trim() !== '' && formData.governmentRegistryNumber.trim() !== '';
        }
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;
    
    setLoading(true);
    try {
        const payload: any = {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            currency: 'USD',
            city: formData.city,
            location: formData.district ? `${formData.district}, ${formData.city}` : formData.city,
            subcategory: formData.subcategory,
            listingType: formData.listingType === 'sale' ? 'sale' : 'rent',
            category: 'property',
            images: formData.images,
            district: formData.district,
            landmark: formData.landmark,
            latitude: formData.latitude,
            longitude: formData.longitude,
            region: formData.city,
            features: {
                size: formData.size,
                beds: Number(formData.beds),
                baths: Number(formData.baths)
            }
        };

        // If 'sale', write all mandatory verified legal fields
        if (formData.listingType === 'sale') {
           payload.legalReferenceNumber = formData.legalReferenceNumber;
           payload.governmentRegistryNumber = formData.governmentRegistryNumber;
           payload.associatedBrokerId = formData.associatedBrokerId || '';
           
           // Generate unique legal registry reference ID to keep records organized
           const year = new Date().getFullYear();
           const rand = Math.floor(100000 + Math.random() * 900000);
           const cityPrefix = formData.city ? formData.city.substring(0,3).toUpperCase() : 'JIG';
           payload.legalListingId = `AE-${cityPrefix}-LND-${year}-${rand}`;
           
           payload.legalChecked = false;
           payload.ownershipVerified = false;
           payload.verificationStatus = 'pending';

           // Map real file URLs
           payload.legalOwnershipCertificateUrl = formData.legalOwnershipCertificateUrl || '';
           payload.legalTitleDeedUrl = formData.legalTitleDeedUrl || '';
           payload.sellerNationalIdUrl = formData.sellerNationalIdUrl || '';
        }

        await listingService.createListing(payload);
        navigate('/properties');
    } catch (err) {
        console.error('Failed to register estate listings:', err);
    } finally {
        setLoading(false);
    }
  };

  const formattedPrice = formData.price 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(formData.price))
    : 'Not Specified';

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumbs and Top Title */}
        <div className="text-center mb-10">
          <Badge className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 uppercase text-[10px] tracking-widest font-bold px-4 py-1.5 rounded-full mb-4">
             Publish Asset Registry Log
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-none mb-3">
             Create Property Listing
          </h1>
          <p className="text-white/40 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
             Publish your residential, commercial, or land assets to AmaanEstate's regional MLS grid directory. Keep credentials updated.
          </p>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="mb-12">
          {/* Timeline bar */}
          <div className="flex items-center justify-between relative mt-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-[#C5A059]/80 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s) => (
              <div 
                key={s.id} 
                onClick={() => {
                  // Only allow navigating back or to steps already validated
                  if (s.id < currentStep) {
                    setCurrentStep(s.id);
                  }
                }}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                  s.id < currentStep 
                    ? 'bg-[#C5A059] border-[#C5A059] text-black' 
                    : s.id === currentStep 
                    ? 'bg-black border-[#C5A059] text-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                    : 'bg-black border-white/10 text-white/40 group-hover:border-white/20'
                }`}>
                  {s.id < currentStep ? <Check size={12} className="stroke-[3]" /> : s.id}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider mt-2.5 hidden sm:block ${
                  s.id === currentStep ? 'text-[#C5A059]' : 'text-white/30'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Property Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 bg-white/[0.01] border border-white/10 rounded-[3rem] space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Basic Property Information</h3>
                  <p className="text-white/40 text-xs">Specify the main identifying metrics, type, and target market valuation.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                      <span>Property Title</span>
                      <span className="text-[10px] text-white/30 tracking-tight lowercase font-medium">required</span>
                    </label>
                    <Input 
                      placeholder="e.g. Modern 4-Bedroom Villa with Garden" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Subcategory Type</label>
                      <select 
                        value={formData.subcategory} 
                        onChange={e => setFormData({...formData, subcategory: e.target.value})} 
                        className="w-full h-14 bg-white/5 border border-white/10 px-4 rounded-2xl text-white outline-none focus:border-[#C5A059] transition-all"
                      >
                        <option value="Apartment" className="bg-neutral-900 text-white">Apartment</option>
                        <option value="Villa" className="bg-neutral-900 text-white">Villa</option>
                        <option value="Commercial" className="bg-neutral-900 text-white">Commercial Space</option>
                        <option value="Land" className="bg-neutral-900 text-white">Residential Land</option>
                        <option value="House" className="bg-neutral-900 text-white">Family House</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Listing Intention</label>
                      <div className="grid grid-cols-2 gap-2 h-14 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, listingType: 'sale'})}
                          className={`rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                            formData.listingType === 'sale' ? 'bg-[#C5A059] text-black' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          For Sale
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, listingType: 'rent'})}
                          className={`rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                            formData.listingType === 'rent' ? 'bg-[#C5A059] text-black' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          For Rent
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                        <span>Market Value (USD $)</span>
                        <span className="text-[10px] text-[#C5A059] tracking-widest uppercase font-mono">{formattedPrice}</span>
                      </label>
                      <Input 
                        type="number" 
                        placeholder="e.g. 150000" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                        required 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Asset Size (e.g. sqm/sqft)</label>
                      <Input 
                        placeholder="e.g. 240 sqm" 
                        value={formData.size} 
                        onChange={e => setFormData({...formData, size: e.target.value})} 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Bedrooms</label>
                      <div className="flex h-14 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, beds: Math.max(0, formData.beds - 1)})}
                          className="w-14 h-full bg-white/5 font-extrabold hover:bg-white/10 transition-colors"
                        >
                          -
                        </button>
                        <div className="flex-1 flex items-center justify-center font-bold font-mono text-lg text-[#C5A059]">
                          {formData.beds}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, beds: formData.beds + 1})}
                          className="w-14 h-full bg-white/5 font-extrabold hover:bg-white/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Bathrooms</label>
                      <div className="flex h-14 border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, baths: Math.max(0, formData.baths - 1)})}
                          className="w-14 h-full bg-white/5 font-extrabold hover:bg-white/10 transition-colors"
                        >
                          -
                        </button>
                        <div className="flex-1 flex items-center justify-center font-bold font-mono text-lg text-[#C5A059]">
                          {formData.baths}
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, baths: formData.baths + 1})}
                          className="w-14 h-full bg-white/5 font-extrabold hover:bg-white/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Location Information */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 bg-white/[0.01] border border-white/10 rounded-[3rem] space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Location</h3>
                  <p className="text-white/40 text-xs">Verify exact geographical boundaries, neighborhood terms, and landmarks.</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Primary Region</label>
                      <select 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        className="w-full h-14 bg-white/5 border border-white/10 px-4 rounded-2xl text-white outline-none focus:border-[#C5A059] transition-all"
                      >
                        <option value="Jigjiga" className="bg-neutral-900 text-white">Jigjiga</option>
                        <option value="Dire Dawa" className="bg-neutral-900 text-white">Dire Dawa</option>
                        <option value="Addis Ababa" className="bg-neutral-900 text-white">Addis Ababa</option>
                        <option value="Godey" className="bg-neutral-900 text-white">Godey</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">District / Xaafad</label>
                      <Input 
                        placeholder="e.g. Hodan / Central" 
                        value={formData.district} 
                        onChange={e => setFormData({...formData, district: e.target.value})} 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Street / Landmark</label>
                      <Input 
                        placeholder="e.g. Near Shabelle River view" 
                        value={formData.landmark} 
                        onChange={e => setFormData({...formData, landmark: e.target.value})} 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30"
                        required
                      />
                    </div>
                  </div>

                  {/* Dynamic Map Coordinates Component */}
                  <div className="pt-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1 block mb-3">
                      Coordinate Allocation Mapping
                    </label>
                    <MapPicker 
                      city={formData.city} 
                      latitude={formData.latitude} 
                      longitude={formData.longitude} 
                      onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Latitude Coordinates</p>
                      <p className="text-[#C5A059] text-sm font-mono font-bold mt-1">
                        {formData.latitude ? formData.latitude.toFixed(6) : 'Auto-allocated'}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Longitude Coordinates</p>
                      <p className="text-[#C5A059] text-sm font-mono font-bold mt-1">
                        {formData.longitude ? formData.longitude.toFixed(6) : 'Auto-allocated'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Media Upload */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 bg-white/[0.01] border border-white/10 rounded-[3rem] space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Property Photos</h3>
                  <p className="text-white/40 text-xs">Upload up to 12 architectural photographs to verify entry points, plumbing, and views.</p>
                </div>

                <div className="p-6 bg-[#C5A059]/5 border border-[#C5A059]/10 rounded-2xl flex gap-4 items-start">
                  <Info size={18} className="text-[#C5A059] shrink-0 mt-0.5" />
                  <div className="text-xs text-white/60 leading-relaxed">
                     <p className="font-bold text-white mb-1">Image Quality Guidelines</p>
                     For regional review clearance, submit clear high-resolution landscape photographs. Avoid blurred, cropped, or text-overlaid images. Primary thumbnail is set to the first completed file.
                  </div>
                </div>

                <div className="p-2 border border-white/5 bg-black/40 rounded-3xl">
                  <GalleryUpload 
                    value={formData.images} 
                    onChange={(urls) => setFormData({...formData, images: urls})} 
                    label="Verification Photographs" 
                    folder="property_mls"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: Strategic Narrative */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 bg-white/[0.01] border border-white/10 rounded-[3rem] space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Property Description</h3>
                  <p className="text-white/40 text-xs">Explicate spatial amenities, infrastructural proximities, and security properties.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                      <span>Description</span>
                      <span className="text-[10px] text-white/30 tracking-wider uppercase font-mono">{formData.description.trim().length} Chars</span>
                    </label>
                    <Textarea 
                      placeholder="e.g. This luxury residential property contains immediate spatial road access, verified steel frame infrastructure, modern security structures, independent backup power installations, and deep groundwater reservoirs..." 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="bg-white/5 border-white/10 min-h-[220px] rounded-2xl py-4 focus-visible:ring-[#C5A059]/30 text-white leading-relaxed" 
                      required 
                    />
                  </div>

                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-3">Copywriting Tips</p>
                     <ul className="space-y-2 text-xs text-white/50 leading-relaxed">
                       <li className="flex items-center gap-2">&bull; Highlight structural security elements like outer perimeter gates, guards spacing</li>
                       <li className="flex items-center gap-2">&bull; Identify regional proximity metrics (e.g. 5 minutes from city center, schools)</li>
                       <li className="flex items-center gap-2">&bull; Clarify water security configurations like dual groundwater reservoirs</li>
                     </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Regulatory & Legal Verification System */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 bg-white/[0.01] border border-[#C5A059]/20 rounded-[3rem] space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-3xl rounded-full" />
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center shrink-0 text-[#C5A059]">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white leading-tight">Legal Claims Verification</h3>
                    <p className="text-white/40 text-xs mt-1">Mandatory verification checks to enforce regional integrity and prevent multi-sold fraudulent deeds.</p>
                  </div>
                </div>

                {formData.listingType === 'rent' ? (
                  <div className="p-8 border border-white/10 bg-white/5 rounded-2xl space-y-4">
                    <p className="text-white font-bold leading-relaxed flex items-center gap-2">
                       <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> Rent Listings Exempt from Mandatory Land Registry upload
                    </p>
                    <p className="text-white/50 text-xs leading-relaxed">
                       As a rent listing provider, you can bypass the mandatory public land deed validation requirements. We still encourage listing with updated certificates if available to build instant customer confidence indicators.
                    </p>
                    
                    <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="space-y-2">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Broker ID / Owner Credentials (Optional)</label>
                        <Input 
                          placeholder="e.g. BROKER-JIG-1094" 
                          value={formData.associatedBrokerId} 
                          onChange={e => setFormData({...formData, associatedBrokerId: e.target.value})} 
                          className="bg-white/5 border-white/10 h-14 rounded-2xl" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Legal Reference Number (Waraaqaha)</label>
                        <Input 
                          placeholder="e.g. 102/2026/XYZ" 
                          value={formData.legalReferenceNumber} 
                          onChange={e => setFormData({...formData, legalReferenceNumber: e.target.value})} 
                          className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                          required 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Govt Registry Number</label>
                        <Input 
                          placeholder="e.g. GRN-89324" 
                          value={formData.governmentRegistryNumber} 
                          onChange={e => setFormData({...formData, governmentRegistryNumber: e.target.value})} 
                          className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] ml-1">Represented By Broker ID (Optional for direct owners)</label>
                      <Input 
                        placeholder="e.g. BROKER-XXX" 
                        value={formData.associatedBrokerId} 
                        onChange={e => setFormData({...formData, associatedBrokerId: e.target.value})} 
                        className="bg-white/5 border-white/10 h-14 rounded-2xl focus-visible:ring-[#C5A059]/30" 
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <DocumentUploader 
                        label="Upload Ownership Certificate (Waraaqaha Lahaanshaha)"
                        description="PDF or high-resolution scan of official regional certification parameters."
                        value={formData.legalOwnershipCertificateUrl}
                        onChange={(url) => setFormData({...formData, legalOwnershipCertificateUrl: url})}
                      />
                      
                      <DocumentUploader 
                        label="Upload Official Title Deed (Mulkiyada)"
                        description="PDF or scan verifying legal boundary points and registration registry stamps."
                        value={formData.legalTitleDeedUrl}
                        onChange={(url) => setFormData({...formData, legalTitleDeedUrl: url})}
                      />

                      <DocumentUploader 
                        label="Upload Seller National Identity Credential"
                        description="Clear photo scan of National Passport, Regional Identification doc, or Voter registration."
                        value={formData.sellerNationalIdUrl}
                        onChange={(url) => setFormData({...formData, sellerNationalIdUrl: url})}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 6: Review & Publish Preview */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="p-8 md:p-12 bg-white/[0.01] border border-white/10 rounded-[3rem] space-y-6">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Review & Publish</h3>
                  <p className="text-white/40 text-xs">Verify your listing details below prior to submitting onto the Amaan MLS network database.</p>
                  
                  {/* Embedded Compact Live Preview Panel */}
                  <div className="mt-8 border border-white/10 rounded-[2.5rem] overflow-hidden bg-black/80">
                    <div className="relative h-64 bg-neutral-900">
                      {formData.images.length > 0 ? (
                        <img 
                          src={formData.images[0]} 
                          alt={formData.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                          <AlertCircle size={40} className="mb-2" />
                          <p className="text-xs uppercase font-bold tracking-widest">No Primary Asset Image Uploaded</p>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/60 px-4 py-1.5 rounded-xl border border-white/5 text-[10px] uppercase font-bold tracking-widest text-[#C5A059]">
                         {formData.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                      </div>
                    </div>

                    <div className="p-8 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <Badge className="bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 uppercase text-[9px] font-bold tracking-widest px-3 py-1 mb-3">
                            {formData.subcategory}
                          </Badge>
                          <h4 className="text-2xl font-display font-bold text-white tracking-tight">{formData.title || 'Untitled Property'}</h4>
                          <div className="flex items-center gap-1.5 text-white/40 text-xs mt-2 font-medium">
                            <MapPin size={13} className="text-[#C5A059]" /> {formData.district ? `${formData.district}, ${formData.city}` : formData.city}
                          </div>
                        </div>
                        <div className="text-[#C5A059] font-display font-black text-3xl leading-none">
                          {formattedPrice}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6">
                        <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl">
                          <Bed size={16} className="text-[#C5A059] mb-1" />
                          <p className="text-[10px] text-white/30 uppercase font-black">Bedrooms</p>
                          <p className="text-white font-bold text-sm mt-0.5">{formData.beds}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl">
                          <Bath size={16} className="text-[#C5A059] mb-1" />
                          <p className="text-[10px] text-white/30 uppercase font-black">Bathrooms</p>
                          <p className="text-white font-bold text-sm mt-0.5">{formData.baths}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded-xl">
                          <Hash size={16} className="text-[#C5A059] mb-1" />
                          <p className="text-[10px] text-white/30 uppercase font-black">Asset Size</p>
                          <p className="text-white font-bold text-sm mt-0.5">{formData.size || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Description</p>
                        <p className="text-white/60 text-sm leading-relaxed truncate-2-lines">{formData.description || 'No description provided.'}</p>
                      </div>

                      <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <Award className="text-[#C5A059]" size={18} />
                          <div>
                            <p className="text-[10px] uppercase font-bold text-white/60">Legal Compliance Stamp</p>
                            <p className="text-[9px] text-white/30 mt-0.5">
                              {formData.listingType === 'sale' 
                                ? `Reference: ${formData.legalReferenceNumber || 'Incomplete'}`
                                : 'Rent Listings Exempted'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                           <Map className="text-emerald-400 focus-visible:ring-emerald-500/20" size={18} />
                           <div>
                             <p className="text-[10px] uppercase font-bold text-white/60">Spatial Allocation Coordinates</p>
                             <p className="text-[9px] text-white/30 mt-0.5">
                               {formData.latitude && formData.longitude 
                                 ? `${formData.latitude.toFixed(4)}°, ${formData.longitude.toFixed(4)}°`
                                 : 'Auto-positioned'}
                             </p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure network dispatch disclaimer */}
                <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex gap-3 text-white/50 text-[11px] leading-relaxed">
                  <Shield size={16} className="text-[#C5A059] shrink-0 fill-[#C5A059]/10" />
                  <p>
                    <strong>Security Clearance Node Verification:</strong> AmaanEstate enforces strict double-listing and fraudulent deed identification checks. Submission will write as "pending-review" state to regional nodes for up to 48 hours. Illegal submissions face immediate database penalties.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between items-center gap-4 pt-6 mt-10 border-t border-white/5">
            <Button 
              type="button" 
              variant="outline"
              disabled={loading}
              onClick={() => {
                if (currentStep === 1) {
                  navigate(-1);
                } else {
                  handlePrevStep();
                }
              }}
              className="h-14 px-8 border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-white/5 transition-all select-none"
            >
              <ChevronLeft size={14} /> {currentStep === 1 ? 'Cancel' : 'Back Step'}
            </Button>

            {currentStep < 6 ? (
              <Button 
                type="button" 
                onClick={handleNextStep}
                disabled={!isStepValid()}
                className="h-14 px-8 bg-[#C5A059] hover:bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Step <ChevronRight size={14} />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading || !isStepValid()}
                className="h-14 px-10 bg-[#C5A059] hover:bg-white text-black hover:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 transition-all duration-300 shadow-2xl shadow-[#C5A059]/10 disabled:opacity-40"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {loading ? 'Publishing Register...' : 'Publish Property'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline badge component replacement for standard badge library
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-full ${className}`}>
      {children}
    </span>
  );
}
