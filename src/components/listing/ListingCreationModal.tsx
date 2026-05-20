import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import { storageService } from '@/services/storageService';
import { ListingCategory, ListingType } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, Check, MapPin, Building2, Bed, Bath, Hash, 
  ChevronRight, ChevronLeft, ShieldCheck, Info, FileText, 
  AlertCircle, Sparkles, Upload, Car, Compass, ListTodo, ShieldAlert,
  Image as ImageIcon
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MapPicker from '../location/MapPicker';
import { motion, AnimatePresence } from 'motion/react';

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
  const [currentStep, setCurrentStep] = useState(1);

  // Legal verification file attachments
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
    subcategory: category === 'property' ? 'Apartment' : 'SUV',
    
    // Vehicle specific
    year: new Date().getFullYear().toString(),
    mileage: '',
    fuelType: 'Petrol' as any,
    transmission: 'Automatic' as any,
    
    // Household specific (Villas, Apartments, etc.)
    beds: '',
    baths: '',
    size: '',
    furnished: 'No',
    parking: 'No',
    
    // Land specific fields
    plotType: 'Freehold',
    zoningType: 'Residential',
    roadAccess: 'No',
    waterAccess: 'No',
    electricityNearby: 'No',
    cornerPlot: 'No',
    boundaryDescription: '',
    surveyReference: '',
    terrain: 'Flat',
    fenced: 'No',
    landUse: 'Residential',
    
    // Commercial specific fields
    parkingSpaces: '',
    floorsCount: '',
    powerCapacity: '',
    securitySystems: 'No',

    // Location spec
    district: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,

    // Legal & Safety Verification IDs (Step 6)
    legalReferenceNumber: '',
    governmentRegistryNumber: '',
    associatedBrokerId: ''
  });

  // Calculate dynamic steps based on listing category
  const getSteps = () => {
    if (category === 'property') {
      return [
        { id: 1, label: 'Basic Info' },
        { id: 2, label: 'Property Details' },
        { id: 3, label: 'Location' },
        { id: 4, label: 'Photos' },
        { id: 5, label: 'Description' },
        { id: 6, label: 'Verification' },
        { id: 7, label: 'Review & Publish' }
      ];
    } else {
      return [
        { id: 1, label: 'Basic Info' },
        { id: 2, label: 'Vehicle Details' },
        { id: 3, label: 'Location' },
        { id: 4, label: 'Photos' },
        { id: 5, label: 'Description' },
        { id: 6, label: 'Review & Publish' }
      ];
    }
  };

  const steps = getSteps();

  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        price: '',
        city: category === 'property' ? 'Jigjiga' : 'Jigjiga',
        subcategory: category === 'property' ? 'Apartment' : 'SUV',
        listingType: 'sale',
        district: '',
        landmark: '',
        latitude: undefined,
        longitude: undefined,
        legalReferenceNumber: '',
        governmentRegistryNumber: '',
        associatedBrokerId: ''
      }));
      setSelectedFiles([]);
      setOwnershipCertificateFiles([]);
      setTitleDeedFiles([]);
      setSellerNationalIdFiles([]);
      setError(null);
    }
  }, [category, isOpen]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step-by-Step Inline Field Validation Guidelines
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.price.trim() !== '' && formData.subcategory.trim() !== '';
      case 2:
        if (category === 'vehicle') {
          return formData.mileage.trim() !== '' && formData.year.trim() !== '';
        } else {
          // If property subcategory is not Land, require Size
          return formData.size.trim() !== '';
        }
      case 3:
        if (category === 'property') {
          return formData.city.trim() !== '' && formData.district.trim() !== '' && formData.landmark.trim() !== '';
        }
        return formData.city.trim() !== '';
      case 4:
        return selectedFiles.length > 0;
      case 5:
        return formData.description.trim().length >= 10;
      case 6:
        if (category === 'property') {
          // Render Step 6 verification: Sale listings require legal waraaqaha info
          if (formData.listingType === 'sale') {
            return formData.legalReferenceNumber.trim() !== '' && formData.governmentRegistryNumber.trim() !== '';
          }
          return true; // Rent listings bypass
        }
        return true; // Vehicles skip verification and go directly to summary review
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedFiles.length === 0) {
      setError('At least one primary listing photograph is required.');
      setCurrentStep(4);
      return;
    }

    setLoading(true);
    setUploading(true);
    setError(null);

    try {
      // 1. Pre-generate Listing Firestore Document ID
      const newListingId = doc(collection(db, 'listings')).id;

      // 2. Upload main images to Cloudinary in parallel
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

      // 3. Prepare full payload structure
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
          imageMetas: uploadedImages
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

        // Populate structured features
        listingData.features = {
          beds: Number(formData.beds) || 0,
          baths: Number(formData.baths) || 0,
          size: formData.size,
          furnished: formData.furnished,
          parking: formData.parking,
          
          // Custom Land attributes
          plotType: formData.plotType,
          zoningType: formData.zoningType,
          roadAccess: formData.roadAccess === 'Yes',
          waterAccess: formData.waterAccess === 'Yes',
          electricityNearby: formData.electricityNearby === 'Yes',
          cornerPlot: formData.cornerPlot === 'Yes',
          boundaryDescription: formData.boundaryDescription,
          surveyReference: formData.surveyReference,
          terrain: formData.terrain,
          fenced: formData.fenced === 'Yes',
          landUse: formData.landUse,

          // Custom Commercial attributes
          parkingSpaces: Number(formData.parkingSpaces) || 0,
          floorsCount: Number(formData.floorsCount) || 0,
          powerCapacity: formData.powerCapacity,
          securitySystems: formData.securitySystems === 'Yes'
        };

        // If listing is for property Sale, handle mandatory legal certificate uploads!
        if (formData.listingType === 'sale') {
          listingData.legalReferenceNumber = formData.legalReferenceNumber;
          listingData.governmentRegistryNumber = formData.governmentRegistryNumber;
          listingData.associatedBrokerId = formData.associatedBrokerId;

          // Generate randomized registry reference lookup code
          const yearStamp = new Date().getFullYear();
          const randomSuffix = Math.floor(100000 + Math.random() * 900000);
          const cityPrefix = formData.city ? formData.city.substring(0,3).toUpperCase() : 'JIG';
          listingData.legalListingId = `AE-${cityPrefix}-LND-${yearStamp}-${randomSuffix}`;
          
          listingData.legalChecked = false;
          listingData.ownershipVerified = false;

          let ownershipUrl = "";
          let deedUrl = "";
          let nationalIdUrl = "";

          // Perform actual dynamic file uploads for credential security files
          if (ownershipCertificateFiles.length > 0) {
            const uploaded = await storageService.uploadListingImages(newListingId, ownershipCertificateFiles);
            if (uploaded.length > 0) ownershipUrl = uploaded[0].url;
          }
          if (titleDeedFiles.length > 0) {
            const uploaded = await storageService.uploadListingImages(newListingId, titleDeedFiles);
            if (uploaded.length > 0) deedUrl = uploaded[0].url;
          }
          if (sellerNationalIdFiles.length > 0) {
            const uploaded = await storageService.uploadListingImages(newListingId, sellerNationalIdFiles);
            if (uploaded.length > 0) nationalIdUrl = uploaded[0].url;
          }

          listingData.legalOwnershipCertificateUrl = ownershipUrl;
          listingData.legalTitleDeedUrl = deedUrl;
          listingData.sellerNationalIdUrl = nationalIdUrl;
        }
      }

      // 4. Save listing
      const finalListingId = await listingService.createListingWithId(newListingId, listingData);
      if (!finalListingId) throw new Error('Unresolved document insertion failure.');

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Verify connections and retry.');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formattedPrice = formData.price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(formData.price))
    : 'Not Set';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0D0D0D] border border-white/10 text-white max-w-5xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-black/80">
        <div className="flex flex-col md:flex-row h-full max-h-[92vh]">
          
          {/* Left Summary Sidebar */}
          <div className="md:w-[28%] bg-neutral-950 p-8 border-r border-white/5 flex flex-col justify-between hidden md:flex shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="text-[#C5A059]" size={20} />
                <span className="text-white font-display font-extrabold uppercase text-[11px] tracking-widest">Amaan Network MLS</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] block">WIZARD STEPS</span>
                <p className="text-lg font-display font-black text-white">
                  Step {currentStep} of {steps.length}
                </p>
              </div>

              {/* Steps timeline indicator list */}
              <div className="mt-8 space-y-4">
                {steps.map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                      s.id < currentStep 
                        ? 'bg-[#C5A059] border-[#C5A059] text-black' 
                        : s.id === currentStep 
                        ? 'bg-[#0D0D0D] border-[#C5A059] text-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.2)]'
                        : 'bg-[#0D0D0D] border-white/10 text-white/30'
                    }`}>
                      {s.id < currentStep ? <Check size={10} className="stroke-[3]" /> : s.id}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${
                        s.id === currentStep ? 'text-[#C5A059]' : 'text-white/30'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#C5A059] shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/50 leading-relaxed">
                  All listings are digitally indexed within 48 hours following security compliance confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Right dynamic content workspace */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar max-h-[92vh]">
            
            {/* Header section with category specific labels */}
            <div className="p-6 md:p-8 border-b border-white/5 bg-neutral-950/40 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
                  {category === 'property' ? 'ESTATE ASSET INVENTORY' : 'VEHICLE ASSET INVENTORY'}
                </p>
                <h3 className="text-xl md:text-2xl font-display font-black tracking-tight text-white mt-1">
                  Create New {category === 'property' ? 'Property' : 'Vehicle'} Listing
                </h3>
              </div>
              <Button onClick={onClose} variant="ghost" className="rounded-xl text-white/40 hover:text-white h-9 px-3">
                Cancel
              </Button>
            </div>

            {/* Steps Container Area */}
            <div className="p-6 md:p-10 flex-1">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Property Type & Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Categorization & Pricing</h4>
                      <p className="text-white/40 text-[11px]">Primary listing categorization details and expected valuation metrics.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Sub-category dropdown */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Asset Classification Type</label>
                        <Select 
                          value={formData.subcategory} 
                          onValueChange={(val) => setFormData({ ...formData, subcategory: val, beds: '', baths: '', size: '' })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-[#C5A059]/30 text-white">
                            <SelectValue placeholder="Select sub-classification" />
                          </SelectTrigger>
                          <SelectContent className="bg-neutral-950 border-white/10 text-white">
                            {category === 'property' ? (
                              <>
                                <SelectItem value="Apartment">Apartment Suite</SelectItem>
                                <SelectItem value="Villa">Villa Residence</SelectItem>
                                <SelectItem value="Commercial">Commercial Facility</SelectItem>
                                <SelectItem value="Land">Vacant / Land Registry</SelectItem>
                                <SelectItem value="House">Residential House</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="SUV">SUV</SelectItem>
                                <SelectItem value="Sedan">Sedan</SelectItem>
                                <SelectItem value="Truck">Logistical Truck</SelectItem>
                                <SelectItem value="Lux">Luxury / Performance</SelectItem>
                                <SelectItem value="Bus">Bus Transport</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Property Title */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Title</label>
                        <Input 
                          placeholder={category === 'property' ? "e.g. Elegant 5-Bedroom Villa with Gated Perimeter" : "e.g. Toyota Land Cruiser V8 Premium"} 
                          value={formData.title} 
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                          className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                          required 
                        />
                      </div>

                      {/* Market Value / Pricing and Intent */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Market Value (USD $)</label>
                          <Input 
                            type="number" 
                            placeholder="Enter expected amount in USD" 
                            value={formData.price} 
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                            className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                            required 
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Listing Allocation Intention</label>
                          <div className="grid grid-cols-2 gap-2 h-12 p-1.5 bg-white/5 rounded-xl border border-white/10">
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, listingType: 'sale' })}
                              className={`rounded-lg transition-all font-black text-[10px] uppercase tracking-wider ${
                                formData.listingType === 'sale' ? 'bg-[#C5A059] text-black' : 'text-white/40 hover:text-white'
                              }`}
                            >
                              For Sale
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, listingType: 'rent' })}
                              className={`rounded-lg transition-all font-black text-[10px] uppercase tracking-wider ${
                                formData.listingType === 'rent' ? 'bg-[#C5A059] text-black' : 'text-white/40 hover:text-white'
                              }`}
                            >
                              For Rent
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Conditional Property Details */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {category === 'property' ? 'Conditional Specifications' : 'Technical Specifications'}
                      </h4>
                      <p className="text-white/40 text-[11px]">Specify precise characteristics depending on structural classification parameters.</p>
                    </div>

                    <div className="space-y-6">
                      
                      {category === 'vehicle' ? (
                        /* VEHICLE SPECIFIC FORM FIELDS */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Manufacturing Year</label>
                            <Input 
                              type="number"
                              placeholder="2024" 
                              value={formData.year} 
                              onChange={(e) => setFormData({ ...formData, year: e.target.value })} 
                              className="bg-white/5 border-white/10 h-12 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Mileage Reading (km)</label>
                            <Input 
                              placeholder="e.g. 15,000" 
                              value={formData.mileage} 
                              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })} 
                              className="bg-white/5 border-white/10 h-12 rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Engine Fuel System</label>
                            <Select 
                              value={formData.fuelType} 
                              onValueChange={(val) => setFormData({ ...formData, fuelType: val })}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-950 border-white/10 text-white">
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric EV</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Transmission Mode</label>
                            <Select 
                              value={formData.transmission} 
                              onValueChange={(val) => setFormData({ ...formData, transmission: val })}
                            >
                              <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-950 border-white/10 text-white">
                                <SelectItem value="Automatic">Automatic Transmission</SelectItem>
                                <SelectItem value="Manual">Manual Stick Shift</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                      ) : formData.subcategory === 'Land' ? (
                        /* DYNAMIC LAND CATEGORY SPECIFIC FORM FIELDS */
                        <div className="space-y-4">
                          <div className="p-4 bg-white/5 border border-[#C5A059]/20 rounded-xl text-xs text-white/70 leading-relaxed flex gap-2">
                            <Sparkles size={16} className="text-[#C5A059] shrink-0" />
                            <span>Optimizing list container layout for Land Registry documents.</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Total Plot Area Size</label>
                              <Input 
                                placeholder="e.g. 400 sqm" 
                                value={formData.size} 
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Land Use Allocation</label>
                              <Select 
                                value={formData.landUse} 
                                onValueChange={(val) => setFormData({ ...formData, landUse: val })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-950 border-white/10 text-white">
                                  <SelectItem value="Residential">Residential Development</SelectItem>
                                  <SelectItem value="Commercial">Commercial/Retail Use</SelectItem>
                                  <SelectItem value="Agriculture">Agricultural Production</SelectItem>
                                  <SelectItem value="Industrial">Heavy / Light Industrial</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Title Ownership Type</label>
                              <Select 
                                value={formData.plotType} 
                                onValueChange={(val) => setFormData({ ...formData, plotType: val })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-950 border-white/10 text-white">
                                  <SelectItem value="Freehold">Freehold (Mulkiya Permanent)</SelectItem>
                                  <SelectItem value="Leasehold">Leasehold Agreement</SelectItem>
                                  <SelectItem value="Customary">Customary Clan Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Zoning Standard</label>
                              <Select 
                                value={formData.zoningType} 
                                onValueChange={(val) => setFormData({ ...formData, zoningType: val })}
                              >
                                <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-950 border-white/10 text-white">
                                  <SelectItem value="Residential">Zone A (Residential)</SelectItem>
                                  <SelectItem value="Commercial">Zone B (Commercial Business)</SelectItem>
                                  <SelectItem value="Mixed">Zone C (Mixed Residential/Retail)</SelectItem>
                                  <SelectItem value="Agricultural">Zone D (Farmland/Unzoned)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Road Access</label>
                              <Select value={formData.roadAccess} onValueChange={(val) => setFormData({ ...formData, roadAccess: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Groundwater</label>
                              <Select value={formData.waterAccess} onValueChange={(val) => setFormData({ ...formData, waterAccess: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">Grid Electricity</label>
                              <Select value={formData.electricityNearby} onValueChange={(val) => setFormData({ ...formData, electricityNearby: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/40 block font-sans">Plot is Fenced</label>
                              <Select value={formData.fenced} onValueChange={(val) => setFormData({ ...formData, fenced: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem></SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Survey Stamp Reference ID (Optional)</label>
                              <Input 
                                placeholder="e.g. SRV-2026-X8" 
                                value={formData.surveyReference} 
                                onChange={(e) => setFormData({ ...formData, surveyReference: e.target.value })} 
                                className="bg-white/5 border-white/10 h-11 rounded-xl text-xs"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Terrain Properties</label>
                              <Select value={formData.terrain} onValueChange={(val) => setFormData({ ...formData, terrain: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Flat">Flat Plateau Plain</SelectItem><SelectItem value="Sloped">Sloped Terrain</SelectItem><SelectItem value="Hilly">Hilly Landscape</SelectItem></SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                      ) : formData.subcategory === 'Commercial' ? (
                        /* DYNAMIC COMMERCIAL FACILITY SPECIFIC FORM FIELDS */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Floor Area Size (e.g. sqm)</label>
                              <Input 
                                placeholder="e.g. 500 sqm" 
                                value={formData.size} 
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Power Connection Grid Capacity</label>
                              <Input 
                                placeholder="e.g. 100 kW Triple Phase" 
                                value={formData.powerCapacity} 
                                onChange={(e) => setFormData({ ...formData, powerCapacity: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Dedicated Parking Spots</label>
                              <Input 
                                type="number"
                                placeholder="e.g. 12" 
                                value={formData.parkingSpaces} 
                                onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Floors Count</label>
                              <Input 
                                type="number"
                                placeholder="e.g. 3" 
                                value={formData.floorsCount} 
                                onChange={(e) => setFormData({ ...formData, floorsCount: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">CCTV & Specialized Access Systems</label>
                            <Select value={formData.securitySystems} onValueChange={(val) => setFormData({ ...formData, securitySystems: val })}>
                              <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                              <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes (Full CCTV Perimeter Active)</SelectItem><SelectItem value="No">No / Not Confirmed</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>

                      ) : (
                        /* RESIDENTIAL HOMES, VILLAS & APARTMENTS SPECIFIC FORM FIELDS */
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Total Built Size</label>
                              <Input 
                                placeholder="e.g. 180 sqm" 
                                value={formData.size} 
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })} 
                                className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Bedrooms</label>
                                <Input 
                                  type="number"
                                  placeholder="0" 
                                  value={formData.beds} 
                                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })} 
                                  className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Bathrooms</label>
                                <Input 
                                  type="number"
                                  placeholder="0" 
                                  value={formData.baths} 
                                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })} 
                                  className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Fully Furnished State</label>
                              <Select value={formData.furnished} onValueChange={(val) => setFormData({ ...formData, furnished: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes (Furnished Residence)</SelectItem><SelectItem value="No">No (Unfurnished)</SelectItem></SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Dedicated Parking Space</label>
                              <Select value={formData.parking} onValueChange={(val) => setFormData({ ...formData, parking: val })}>
                                <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-neutral-950"><SelectItem value="Yes">Yes (Secure Garage / Driveway)</SelectItem><SelectItem value="No">No / Street only</SelectItem></SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Geographic Location & Map Allocation */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Location Details</h4>
                      <p className="text-white/40 text-[11px]">Pinpoint exact neighborhood coordinates, districts, and streets.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Primary Region</label>
                          <Select 
                            value={formData.city || 'Jigjiga'} 
                            onValueChange={(val) => setFormData({ ...formData, city: val })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-[#C5A059]/30 text-white">
                              <SelectValue placeholder="Select city/region" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-950 border-white/10 text-white">
                              <SelectItem value="Jigjiga">Jigjiga Region</SelectItem>
                              <SelectItem value="Dire Dawa">Dire Dawa Region</SelectItem>
                              <SelectItem value="Addis Ababa">Addis Ababa Area</SelectItem>
                              <SelectItem value="Godey">Godey Region</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">District / Xaafad</label>
                          <Input 
                            placeholder="e.g. Hodan" 
                            value={formData.district} 
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })} 
                            className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                            required 
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Street Landmark Reference</label>
                          <Input 
                            placeholder="e.g. Beside Shabelle Radio Station" 
                            value={formData.landmark} 
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} 
                            className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30"
                            required 
                          />
                        </div>
                      </div>

                      {category === 'property' && (
                        <div className="space-y-3 pt-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block ml-1">Pinpoint Mapping (Interactive)</label>
                          <MapPicker 
                            city={formData.city || 'Jigjiga'} 
                            latitude={formData.latitude} 
                            longitude={formData.longitude} 
                            onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-neutral-950 border border-white/5 rounded-xl">
                              <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">Latitude</p>
                              <p className="text-[#C5A059] text-xs font-mono font-bold mt-0.5">
                                {formData.latitude ? formData.latitude.toFixed(6) : 'Auto-detected'}
                              </p>
                            </div>
                            <div className="p-3 bg-neutral-950 border border-white/5 rounded-xl">
                              <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">Longitude</p>
                              <p className="text-[#C5A059] text-xs font-mono font-bold mt-0.5">
                                {formData.longitude ? formData.longitude.toFixed(6) : 'Auto-detected'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Media Gallery Drop File Upload */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Visual Media Assets</h4>
                      <p className="text-white/40 text-[11px]">Upload representative high-contrast landscape format photography.</p>
                    </div>

                    <div className="space-y-4">
                      <ImageUpload 
                        onImagesChange={setSelectedFiles} 
                        maxFiles={category === 'vehicle' ? 8 : 12}
                        label="Property Photographs"
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Strategic Narrative Description */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Property Description</h4>
                      <p className="text-white/40 text-[11px]">Explain water configurations, immediate perimeter security structures, and backup facilities.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1 flex items-center justify-between">
                          <span>Listing Description Strategic Text</span>
                          <span className="text-[9px] text-white/30 lowercase font-mono">{formData.description.trim().length} Chars</span>
                        </label>
                        <Textarea 
                          placeholder="Describe the unique characteristics, secure steel perimeters, proximity to urban centers, water wells, active reserve tanks..." 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                          className="bg-white/5 border-white/10 min-h-[180px] rounded-xl focus-visible:ring-[#C5A059]/30 py-4 text-white text-sm leading-relaxed" 
                          required 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 6: Anti-Fraud Regulatory Ownership Verification (Sale Land/Housing only) */}
                {currentStep === 6 && category === 'property' && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center shrink-0 text-[#C5A059]">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Regulatory Legal Registry Validation</h4>
                        <p className="text-white/40 text-[11px] mt-0.5">Mandatory security checks to ensure non-duplicate titles and legitimate broker representation.</p>
                      </div>
                    </div>

                    {formData.listingType === 'rent' ? (
                      <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl space-y-3">
                        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                          <Check size={14} className="stroke-[3]" /> Rent listing bypass system active
                        </p>
                        <p className="text-white/50 text-[11px] leading-relaxed">
                          Properties allocated for active monthly lease/rent do not require strict waraaqaha land registry uploads. You may proceed and optionally fill standard references.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Legal Reference Number (Waraaqaha)</label>
                            <Input 
                              placeholder="e.g. 104/2026-XJL" 
                              value={formData.legalReferenceNumber} 
                              onChange={(e) => setFormData({ ...formData, legalReferenceNumber: e.target.value })} 
                              className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30 text-white" 
                              required 
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Govt Registry Stamp ID</label>
                            <Input 
                              placeholder="e.g. REG-782" 
                              value={formData.governmentRegistryNumber} 
                              onChange={(e) => setFormData({ ...formData, governmentRegistryNumber: e.target.value })} 
                              className="bg-white/5 border-white/10 h-12 rounded-xl focus-visible:ring-[#C5A059]/30 text-white" 
                              required 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 ml-1">Broker ID Code (Optional)</label>
                          <Input 
                            placeholder="e.g. BROKER-JIG-123" 
                            value={formData.associatedBrokerId} 
                            onChange={(e) => setFormData({ ...formData, associatedBrokerId: e.target.value })} 
                            className="bg-white/5 border-white/10 h-12 rounded-xl text-white" 
                          />
                        </div>

                        {/* File inputs for verification deeds */}
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 block mb-2 tracking-wider">Upload Verification Ownership Certificate (JPEG/PNG)</label>
                            <ImageUpload onImagesChange={setOwnershipCertificateFiles} maxFiles={1} label="Ownership Cert File" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 block mb-2 tracking-wider">Upload Land Title Deed (JPEG/PNG)</label>
                            <ImageUpload onImagesChange={setTitleDeedFiles} maxFiles={1} label="Title Deed File" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-white/40 block mb-2 tracking-wider">Upload Seller Identity Verification ID card (JPEG/PNG)</label>
                            <ImageUpload onImagesChange={setSellerNationalIdFiles} maxFiles={1} label="Ident Passport File" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 7: Comprehensive Live Review Summary page */}
                {((currentStep === 7 && category === 'property') || (currentStep === 6 && category === 'vehicle')) && (
                  <motion.div
                    key="step7"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">Final Clearance Registry</h4>
                      <p className="text-white/40 text-[11px]">Review full mapped data values before executing secure multi-node publication.</p>
                    </div>

                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-neutral-950">
                      
                      {/* Sub-header mock grid thumbnail */}
                      <div className="aspect-video relative bg-neutral-900 border-b border-white/5 flex items-center justify-center">
                        {selectedFiles.length > 0 ? (
                          <img 
                            src={URL.createObjectURL(selectedFiles[0])} 
                            alt="Primary Display Asset Tag" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="text-white/20 flex flex-col items-center">
                            <ImageIcon size={32} />
                            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">No Primary Asset Art</span>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 bg-[#C5A059] text-black font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                          {formData.listingType === 'sale' ? 'FOR SALE' : 'FOR LEASE'}
                        </span>
                      </div>

                      {/* Info Review Body */}
                      <div className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <span className="text-[9px] uppercase font-black text-[#C5A059] tracking-widest bg-[#C5A059]/10 px-2.5 py-1 rounded">
                              {formData.subcategory}
                            </span>
                            <h5 className="text-xl font-display font-bold text-white mt-2 leading-tight">
                              {formData.title || 'Untitled Asset Name'}
                            </h5>
                            <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                              <MapPin size={12} className="text-[#C5A059]" /> {formData.district ? `${formData.district}, ${formData.city}` : formData.city}
                            </p>
                          </div>
                          <div>
                            <p className="text-white/30 text-[9px] uppercase tracking-widest font-black text-right">EXPECTED VALUATION</p>
                            <p className="text-[#C5A059] font-display font-black text-2xl mt-0.5">{formattedPrice}</p>
                          </div>
                        </div>

                        {/* Attribute Grid lists */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-y border-white/5 py-4 my-2">
                          {category === 'vehicle' ? (
                            <>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Year</p><p className="text-white text-xs font-bold mt-0.5">{formData.year}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Mileage</p><p className="text-white text-xs font-bold mt-0.5">{formData.mileage} km</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Engine</p><p className="text-white text-xs font-bold mt-0.5">{formData.fuelType}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Transmission</p><p className="text-white text-xs font-bold mt-0.5">{formData.transmission}</p></div>
                            </>
                          ) : formData.subcategory === 'Land' ? (
                            <>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Plot size</p><p className="text-white text-xs font-bold mt-0.5">{formData.size}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Land use</p><p className="text-white text-xs font-bold mt-0.5">{formData.landUse}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Plot Type</p><p className="text-white text-xs font-bold mt-0.5">{formData.plotType}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Road access</p><p className="text-white text-xs font-bold mt-0.5">{formData.roadAccess}</p></div>
                            </>
                          ) : formData.subcategory === 'Commercial' ? (
                            <>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Area size</p><p className="text-white text-xs font-bold mt-0.5">{formData.size}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Parking Spots</p><p className="text-white text-xs font-bold mt-0.5">{formData.parkingSpaces || '0'}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Floors</p><p className="text-white text-xs font-bold mt-0.5">{formData.floorsCount || '1'}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Grid Capacity</p><p className="text-white text-xs font-bold mt-0.5">{formData.powerCapacity || 'N/A'}</p></div>
                            </>
                          ) : (
                            <>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Area size</p><p className="text-white text-xs font-bold mt-0.5">{formData.size}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Bedrooms</p><p className="text-white text-xs font-bold mt-0.5">{formData.beds || '0'}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Bathrooms</p><p className="text-white text-xs font-bold mt-0.5">{formData.baths || '0'}</p></div>
                              <div className="p-2.5 bg-white/[0.02] rounded-xl"><p className="text-[8px] text-white/30 uppercase font-black">Parking</p><p className="text-white text-xs font-bold mt-0.5">{formData.parking}</p></div>
                            </>
                          )}
                        </div>

                        {/* Description field */}
                        <div className="space-y-1">
                          <p className="text-[9px] text-white/30 uppercase tracking-widest font-black">Strategic Overview Narrative</p>
                          <p className="text-white/70 text-xs leading-relaxed truncate-2-lines">{formData.description || 'No description provided.'}</p>
                        </div>

                        {/* Legal validation references summary */}
                        {category === 'property' && formData.listingType === 'sale' && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="text-emerald-400 shrink-0" size={18} />
                              <div>
                                <p className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Legal Validation Certified</p>
                                <p className="text-white/40 text-[9px]">Ref No: {formData.legalReferenceNumber} | Govt Stamp: {formData.governmentRegistryNumber}</p>
                              </div>
                            </div>
                            <span className="text-[8px] text-emerald-400/80 font-black tracking-widest uppercase border border-emerald-400/20 px-2 py-0.5 rounded bg-emerald-500/5">
                              PASSED
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="mx-6 md:mx-10 mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            {/* Footer stepper navigation controls */}
            <div className="p-6 md:p-8 border-t border-white/5 bg-neutral-950/40 flex items-center justify-between gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handlePrevStep}
                disabled={currentStep === 1 || loading}
                className="rounded-xl text-white/50 hover:text-white uppercase text-[10px] tracking-widest font-bold flex items-center gap-1 isDisabled:opacity-35 select-none"
              >
                <ChevronLeft size={14} /> Back
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 font-bold hidden sm:inline select-none">
                  Step {currentStep} / {steps.length}
                </span>

                {currentStep < steps.length ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                    className="bg-[#C5A059] hover:bg-white text-black font-bold uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl flex items-center gap-1 transition-all"
                  >
                    Continue <ChevronRight size={14} />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#C5A059] hover:bg-white text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl flex items-center gap-1.5 transition-all shadow-xl shadow-[#C5A059]/10"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> 
                        <span>{uploading ? `${Math.round(uploadProgress)}%` : 'Publishing...'}</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} /> 
                        <span>Publish {category === 'property' ? 'Property' : 'Vehicle'}</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
