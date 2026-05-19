import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import { storageService } from '@/services/storageService';
import { ListingCategory, ListingType } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MapPicker from '../location/MapPicker';

interface ListingCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ListingCategory;
  onSuccess?: () => void;
}

export default function ListingCreationModal({ isOpen, onClose, category, onSuccess }: ListingCreationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Legal verification states
  const [legalReferenceNumber, setLegalReferenceNumber] = useState('');
  const [governmentRegistryNumber, setGovernmentRegistryNumber] = useState('');
  const [brokerId, setBrokerId] = useState('');
  
  const [ownershipCertificateFiles, setOwnershipCertificateFiles] = useState<File[]>([]);
  const [titleDeedFiles, setTitleDeedFiles] = useState<File[]>([]);
  const [sellerNationalIdFiles, setSellerNationalIdFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    city: category === 'property' ? 'Jigjiga' : '',
    location: '',
    listingType: 'sale' as ListingType,
    subcategory: '',
    // Vehicle specific
    year: new Date().getFullYear().toString(),
    mileage: '',
    fuelType: 'Petrol' as any,
    transmission: 'Automatic' as any,
    // Property specific
    beds: '',
    baths: '',
    size: '',
    // Location spec
    district: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        city: category === 'property' ? 'Jigjiga' : '',
        district: '',
        landmark: '',
        latitude: undefined,
        longitude: undefined
      }));
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedFiles.length === 0) {
      setError('At least one digital asset is required for regional mapping.');
      return;
    }

    setLoading(true);
    setUploading(true);
    setError(null);

    try {
      // 1. Pre-generate ID
      const newListingId = doc(collection(db, 'listings')).id;

      // 2. Upload images in parallel
      const uploadedImages = await storageService.uploadListingImages(
        newListingId, 
        selectedFiles,
        (progressMap) => {
          const values = Object.values(progressMap);
          const totalProgress = values.length > 0 
            ? values.reduce((a, b) => a + b, 0) / selectedFiles.length 
            : 0;
          setUploadProgress(totalProgress);
        }
      );

      // 3. Prepare listing data
      const listingData: any = {
        category,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        currency: formData.currency,
        city: formData.city,
        location: formData.district ? `${formData.district}, ${formData.city}` : formData.city,
        listingType: formData.listingType,
        subcategory: formData.subcategory,
        images: uploadedImages.map(img => img.url),
        metadata: {
          imageMetas: uploadedImages // Store rich metadata
        }
      };

      if (category === 'vehicle') {
        listingData.year = Number(formData.year);
        listingData.mileage = formData.mileage;
        listingData.fuelType = formData.fuelType;
        listingData.transmission = formData.transmission;
      } else if (category === 'property') {
        listingData.beds = Number(formData.beds) || 0;
        listingData.baths = Number(formData.baths) || 0;
        listingData.size = formData.size;
        listingData.district = formData.district;
        listingData.landmark = formData.landmark;
        listingData.latitude = formData.latitude;
        listingData.longitude = formData.longitude;
        listingData.region = formData.city;

        // Apply mandatory legal verification fields for SALE properties
        if (formData.listingType === 'sale') {
          listingData.legalReferenceNumber = legalReferenceNumber;
          listingData.governmentRegistryNumber = governmentRegistryNumber;
          listingData.associatedBrokerId = brokerId;
          
          // Generate unique legal listing ID (format: AE-JIG-LND-YYYY-XXXXXX)
          const year = new Date().getFullYear();
          const rand = Math.floor(100000 + Math.random() * 900000);
          const cityPrefix = formData.city ? formData.city.substring(0,3).toUpperCase() : 'UNK';
          listingData.legalListingId = `AE-${cityPrefix}-LND-${year}-${rand}`;
          
          listingData.legalChecked = false;
          listingData.ownershipVerified = false;
          
          // Simulated uploads (in production these would be real URLs)
          listingData.legalOwnershipCertificateUrl = ownershipCertificateFiles.length ? "url" : "";
          listingData.legalTitleDeedUrl = titleDeedFiles.length ? "url" : "";
          listingData.sellerNationalIdUrl = sellerNationalIdFiles.length ? "url" : "";
        }
      }

      // 4. Create listing with all data in one go
      const finalListingId = await listingService.createListingWithId(newListingId, listingData);

      if (!finalListingId) throw new Error('Failed to initialize asset record.');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Asset initialization failed');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-luxury-black border-white/5 text-white max-w-4xl rounded-[2.5rem] p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Side: Form Info */}
          <div className="md:w-1/3 bg-white/[0.02] p-10 border-r border-white/5 hidden md:block">
            <DialogHeader className="mb-10 text-left">
              <DialogTitle className="text-3xl font-display font-bold">Initialize <span className="gold-text-gradient">Asset Log</span></DialogTitle>
              <DialogDescription className="text-white/40 text-sm mt-4 leading-relaxed">
                Submit your asset for regional verification. All initial listings are held in review for up to 48 hours to ensure marketplace integrity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 mt-auto">
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-luxury-gold" />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Verified Ownership</p>
                    <p className="text-[10px] text-white/20 mt-1">Cross-referenced with regional records</p>
                 </div>
              </div>
              <div className="flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={16} className="text-luxury-gold" />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/60">Global Distribution</p>
                    <p className="text-[10px] text-white/20 mt-1">Instant visibility across Amaan network</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Asset Designation</label>
                  <Input 
                    required
                    placeholder="e.g. Modern Villa in Jigjiga"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Sub-Category</label>
                  <Select 
                    value={formData.subcategory} 
                    onValueChange={(val) => setFormData({ ...formData, subcategory: val })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus:ring-luxury-gold/30 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-black border-white/10 text-white">
                      {category === 'property' ? (
                        <>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Land">Land</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="Truck">Truck</SelectItem>
                          <SelectItem value="Lux">Luxury</SelectItem>
                          <SelectItem value="Bus">Bus</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Market Valuation ($)</label>
                  <Input 
                    required
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Primary Region</label>
                  {category === 'property' ? (
                    <Select 
                      value={formData.city || 'Jigjiga'} 
                      onValueChange={(val) => setFormData({ ...formData, city: val })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus:ring-luxury-gold/30 text-white">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent className="bg-luxury-black border-white/10 text-white">
                        <SelectItem value="Jigjiga">Jigjiga</SelectItem>
                        <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                        <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                        <SelectItem value="Godey">Godey</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      required
                      placeholder="e.g. Jigjiga"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Listing Type</label>
                  <Select 
                    value={formData.listingType} 
                    onValueChange={(val: ListingType) => setFormData({ ...formData, listingType: val })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus:ring-luxury-gold/30 text-white">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                    <SelectContent className="bg-luxury-black border-white/10 text-white">
                      <SelectItem value="sale">For Sale</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">
                    {category === 'vehicle' ? 'Vehicle Year' : 'Asset Size (e.g. 200sqm)'}
                  </label>
                  <Input 
                    required
                    placeholder={category === 'vehicle' ? '2024' : '200sqm'}
                    value={category === 'vehicle' ? formData.year : formData.size}
                    onChange={e => setFormData({ ...formData, [category === 'vehicle' ? 'year' : 'size']: e.target.value })}
                    className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                  />
                </div>
              </div>

              {category === 'vehicle' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Mileage (km)</label>
                    <Input 
                      required
                      placeholder="e.g. 12,000"
                      value={formData.mileage}
                      onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Fuel Type</label>
                    <Select 
                      value={formData.fuelType} 
                      onValueChange={(val) => setFormData({ ...formData, fuelType: val })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-luxury-black border-white/10 text-white">
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Transmission</label>
                    <Select 
                      value={formData.transmission} 
                      onValueChange={(val) => setFormData({ ...formData, transmission: val })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-luxury-black border-white/10 text-white">
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Bedrooms</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.beds}
                      onChange={e => setFormData({ ...formData, beds: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Bathrooms</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.baths}
                      onChange={e => setFormData({ ...formData, baths: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30"
                    />
                  </div>
                </div>
              )}

              {category === 'property' && (
                <div className="space-y-4 border-t border-white/5 pt-6">
                  <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                    <span>Location Intelligence</span>
                    <span className="h-px flex-1 bg-white/5" />
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">District / Xaafad</label>
                      <Input 
                        required
                        placeholder="e.g. Hodan / Central"
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Street / Landmark</label>
                      <Input 
                        required
                        placeholder="e.g. Near Shabelle River view"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus-visible:ring-luxury-gold/30 text-white"
                      />
                    </div>
                  </div>

                  {/* Dynamic Interactive map widget */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] ml-1">Pinpoint Asset Coordinates</label>
                    <MapPicker 
                      city={formData.city || 'Jigjiga'} 
                      latitude={formData.latitude} 
                      longitude={formData.longitude} 
                      onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Latitude</label>
                      <Input 
                        type="number" 
                        value={formData.latitude ?? ''} 
                        readOnly 
                        className="bg-white/5 border-white/10 text-white/40 select-all cursor-not-allowed h-10 text-xs font-mono"
                        placeholder="Auto-generated"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059]/40 ml-1">Longitude</label>
                      <Input 
                        type="number" 
                        value={formData.longitude ?? ''} 
                        readOnly 
                        className="bg-white/5 border-white/10 text-white/40 select-all cursor-not-allowed h-10 text-xs font-mono"
                        placeholder="Auto-generated"
                      />
                    </div>
                  </div>
                </div>
              )}

              <ImageUpload 
                onImagesChange={setSelectedFiles} 
                maxFiles={category === 'vehicle' ? 8 : 12}
              />

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Strategic Narrative</label>
                <Textarea 
                  required
                  placeholder="Describe the asset's unique value propositions..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 min-h-[160px] rounded-xl focus-visible:ring-luxury-gold/30 py-4 text-white"
                />
              </div>

              {category === 'property' && formData.listingType === 'sale' && (
                <div className="space-y-6 border border-[#C5A059]/20 bg-[#C5A059]/5 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 blur-3xl opacity-50 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[#C5A059]" size={24} />
                    <div>
                      <h3 className="text-[#C5A059] font-bold text-sm tracking-widest uppercase">Legal Ownership Verification System</h3>
                      <p className="text-[10px] text-white/50 mt-1">Mandatory for all property sales. Prevents duplicate and fraudulent listings.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Legal Reference Number (Waraaqaha)</label>
                      <Input 
                        required
                        placeholder="e.g. 102/2026/XYZ"
                        value={legalReferenceNumber}
                        onChange={e => setLegalReferenceNumber(e.target.value)}
                        className="bg-black/50 border-white/10 h-11 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Govt Registry Number</label>
                      <Input 
                        required
                        placeholder="e.g. GRN-89324"
                        value={governmentRegistryNumber}
                        onChange={e => setGovernmentRegistryNumber(e.target.value)}
                        className="bg-black/50 border-white/10 h-11 text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1">Represented By Broker ID (Optional for direct owners)</label>
                      <Input 
                        placeholder="e.g. BROKER-XXX"
                        value={brokerId}
                        onChange={e => setBrokerId(e.target.value)}
                        className="bg-black/50 border-white/10 h-11 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1 block mb-2">Upload Ownership Certificate</label>
                      <ImageUpload onImagesChange={setOwnershipCertificateFiles} maxFiles={1} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1 block mb-2">Upload Official Title Deed</label>
                      <ImageUpload onImagesChange={setTitleDeedFiles} maxFiles={1} />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 ml-1 block mb-2">Upload Seller National ID</label>
                      <ImageUpload onImagesChange={setSellerNationalIdFiles} maxFiles={1} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs">
                  <Info size={16} /> {error}
                </div>
              )}

              <DialogFooter className="pt-6 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="text-white/40 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-luxury-gold text-luxury-black hover:bg-white px-10 h-14 rounded-xl font-bold transition-all shadow-xl shadow-luxury-gold/10 min-w-[200px]"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={18} />
                      <span>{uploading ? `Broadcasting Data (${Math.round(uploadProgress)}%)` : 'Initializing...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <Plus size={18} />
                       <span>Initialize Listing</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
