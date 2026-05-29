import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Bed, Bath, Ruler, Car, ShieldCheck, 
  ArrowLeft, ArrowRight, Loader2, CheckCircle2, DollarSign,
  Upload, Info, Check, Phone, Mail, FileText, Compass,
  Sparkles, Trash2, HelpCircle, Wifi, Droplet, Zap, Shield, Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listingService } from '@/services/listingService';
import { storageService } from '@/services/storageService';
import { uploadFile } from '@/services/uploadService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/listing/ImageUpload';
import MapPicker from '@/components/location/MapPicker';
import { toast } from 'sonner';

type PropertyType = 'House' | 'Apartment' | 'Land' | 'Commercial' | 'Villa' | 'Vehicle';
type ListingType = 'sale' | 'rent';

interface FormState {
  // Step 1: Basics
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  description: string;

  // Step 2: Location
  country: string;
  region: string;
  city: string;
  district: string;
  streetAddress: string;
  latitude: number | undefined;
  longitude: number | undefined;

  // Step 3: Details
  bedrooms: string;
  bathrooms: string;
  areaSize: string;
  parkingSpaces: string;
  furnished: 'Furnished' | 'Unfurnished' | 'N/A';
  yearBuilt: string;
  features: {
    wifi: boolean;
    water: boolean;
    electricity: boolean;
    security: boolean;
    garage: boolean;
    balcony: boolean;
    garden: boolean;
    airConditioning: boolean;
  };

  // Step 5: Pricing & Contact
  currency: 'USD' | 'ETB' | 'SLS' | 'EUR';
  price: string;
  phone: string;
  whatsapp: string;
  email: string;
  preferredContact: 'WhatsApp' | 'Phone' | 'Email';

  // Step 6: Verification & Agreement
  termsAccepted: boolean;
  digitalSignature: string;
}

const INITIAL_STATE: FormState = {
  title: '',
  propertyType: 'House',
  listingType: 'sale',
  description: '',
  country: 'Kenya',
  region: 'Nairobi',
  city: 'Nairobi',
  district: '',
  streetAddress: '',
  latitude: undefined,
  longitude: undefined,
  bedrooms: '',
  bathrooms: '',
  areaSize: '',
  parkingSpaces: '',
  furnished: 'Unfurnished',
  yearBuilt: '',
  features: {
    wifi: false,
    water: false,
    electricity: false,
    security: false,
    garage: false,
    balcony: false,
    garden: false,
    airConditioning: false,
  },
  currency: 'USD',
  price: '',
  phone: '',
  whatsapp: '',
  email: '',
  preferredContact: 'WhatsApp',
  termsAccepted: false,
  digitalSignature: '',
};

export default function PropertyListingFormPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const editId = searchParams.get('edit') || searchParams.get('id') || id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  
  // Media Files states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  
  // Upload and Submission Progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdListingId, setCreatedListingId] = useState<string>('');

  // Editing existing loaded values
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingImagesList, setExistingImagesList] = useState<string[]>([]);
  const [existingOwnershipUrl, setExistingOwnershipUrl] = useState<string>('');
  const [existingIdentityUrl, setExistingIdentityUrl] = useState<string>('');

  // Authentication Gate check
  useEffect(() => {
    if (!user) {
      toast.info('Please log in to register and list assets.');
      navigate('/login?redirect=/list-property');
    }
  }, [user, navigate]);

  // Load listing if in Edit Mode
  useEffect(() => {
    if (editId) {
      const loadListingForEdit = async () => {
        try {
          const listing: any = await listingService.getListingById(editId);
          if (listing) {
            setIsEditMode(true);
            
            // Map asset category/subcategory back to propertyType select
            let pType: PropertyType = 'House';
            if (listing.category === 'vehicle') pType = 'Vehicle';
            else if (listing.subcategory) {
              const sub = listing.subcategory.toLowerCase();
              if (sub.includes('house')) pType = 'House';
              else if (sub.includes('apartment')) pType = 'Apartment';
              else if (sub.includes('land')) pType = 'Land';
              else if (sub.includes('commercial')) pType = 'Commercial';
              else if (sub.includes('villa')) pType = 'Villa';
            }

            setFormData({
              title: listing.title || '',
              propertyType: pType,
              listingType: listing.listingType || 'sale',
              description: listing.description || '',
              country: listing.metadata?.country || 'Kenya',
              region: listing.region || '',
              city: listing.city || '',
              district: listing.district || '',
              streetAddress: listing.location || '',
              latitude: listing.latitude,
              longitude: listing.longitude,
              bedrooms: listing.beds?.toString() || listing.features?.beds?.toString() || '',
              bathrooms: listing.baths?.toString() || listing.features?.baths?.toString() || '',
              areaSize: listing.size?.replace(/[^\d.]/g, '') || listing.features?.size?.replace(/[^\d.]/g, '') || '',
              parkingSpaces: listing.features?.parkingSpaces?.toString() || '',
              furnished: listing.features?.furnished ? 'Furnished' : 'Unfurnished',
              yearBuilt: listing.features?.complianceYear || listing.complianceYear || '',
              features: {
                wifi: !!listing.features?.wifi,
                water: !!listing.features?.waterAccess,
                electricity: !!listing.features?.electricityNearby,
                security: !!listing.features?.securitySystem,
                garage: !!listing.features?.parking,
                balcony: !!listing.features?.balcony,
                garden: !!listing.features?.garden,
                airConditioning: !!listing.features?.airConditioning,
              },
              currency: (listing.currency as any) || 'USD',
              price: listing.price?.toString() || '',
              phone: listing.phone || '',
              whatsapp: listing.whatsapp || '',
              email: listing.email || '',
              preferredContact: (listing.metadata?.preferredContact as any) || 'WhatsApp',
              termsAccepted: true,
              digitalSignature: listing.metadata?.digitalSignature || '',
            });

            if (listing.images && listing.images.length > 0) {
              setExistingImagesList(listing.images);
            }
            if (listing.legalOwnershipCertificateUrl) {
              setExistingOwnershipUrl(listing.legalOwnershipCertificateUrl);
            }
            if (listing.sellerNationalIdUrl) {
              setExistingIdentityUrl(listing.sellerNationalIdUrl);
            }
          }
        } catch (err) {
          console.error('Error loading listing to edit:', err);
          toast.error('Failed to retrieve listing details.');
        }
      };
      loadListingForEdit();
    }
  }, [editId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (key: keyof FormState['features']) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  // Map Coordinates validation & address sync
  const handleMapChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleMapAddressChange = (addressData: { city?: string; district?: string; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      city: addressData.city || prev.city,
      district: addressData.district || prev.district,
      streetAddress: addressData.address || prev.streetAddress,
    }));
  };

  // Custom Step Verification before advancing
  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim().length >= 5 && formData.description.trim().length >= 15;
      case 2:
        return formData.city.trim().length > 0 && formData.region.trim().length > 0;
      case 3:
        if (formData.propertyType === 'Vehicle' || formData.propertyType === 'Land') return true;
        return formData.bedrooms !== '' && formData.bathrooms !== '' && formData.areaSize !== '';
      case 4:
        return isEditMode ? true : imageFiles.length > 0;
      case 5:
        return formData.price !== '' && Number(formData.price) > 0 && formData.phone.trim().length >= 8;
      case 6:
        return formData.termsAccepted && (isEditMode ? true : (ownershipFile !== null && identityFile !== null));
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.warning('Please complete all required fields on this step with genuine data.');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    console.log("handleFinalSubmit triggered");
    
    if (!user) {
      console.error("No user found");
      toast.error("You must be logged in to publish a listing.");
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress(10);
    setUploadStatus('Preparing secure listing payload...');
    console.log("Submitting with data:", formData);

    try {
      let finalImages: string[] = isEditMode ? [...existingImagesList] : [];
      let finalOwnershipUrl = existingOwnershipUrl;
      let finalIdentityUrl = existingIdentityUrl;

      // Class and category mappings
      const subcategory = formData.propertyType.toLowerCase();
      const category = (formData.propertyType === 'Vehicle' ? 'vehicle' : formData.propertyType === 'Land' ? 'land' : 'property');

      // 1. Upload Images to Cloudinary if new ones selected
      if (imageFiles.length > 0) {
        setUploadStatus('Compressing and uploading property imagery assets (Cloudinary)...');
        setUploadProgress(30);
        
        // Pass fake or temporary listing ID since it might not be generated yet, or generate one
        const tempListingId = editId || `temp_${Date.now()}`;
        const uploadedImages = await storageService.uploadListingImages(tempListingId, imageFiles, (progMap) => {
          const average = Object.values(progMap).reduce((p, c) => p + c, 0) / imageFiles.length;
          setUploadProgress(30 + Math.floor(average * 0.4)); // mapping progress between 30% and 70%
        });
        
        const newImageUrls = uploadedImages.map(img => img.url);
        if (isEditMode) {
          finalImages = [...finalImages, ...newImageUrls];
        } else {
          finalImages = newImageUrls;
        }
      }

      // 2. Upload legal files if attached
      if (ownershipFile) {
        setUploadStatus('Uploading ownership land-grant / title certificates...');
        setUploadProgress(75);
        finalOwnershipUrl = await uploadFile(ownershipFile, `listings/legal/${user.uid}/ownership`);
      }

      if (identityFile) {
        setUploadStatus('Uploading national identity credentials...');
        setUploadProgress(85);
        finalIdentityUrl = await uploadFile(identityFile, `listings/legal/${user.uid}/identity`);
      }

      setUploadStatus('Synchronizing real-time databases and establishing trust index...');
      setUploadProgress(95);

      const featuresObj: Record<string, any> = {
        beds: Number(formData.bedrooms) || 0,
        baths: Number(formData.bathrooms) || 0,
        size: `${formData.areaSize} m²`,
        furnished: formData.furnished === 'Furnished',
        parking: formData.features.garage,
        parkingSpaces: Number(formData.parkingSpaces) || 0,
        waterAccess: formData.features.water,
        electricityNearby: formData.features.electricity,
        securitySystem: formData.features.security,
        balcony: formData.features.balcony,
        garden: formData.features.garden,
        airConditioning: formData.features.airConditioning,
        wifi: formData.features.wifi,
        complianceYear: formData.yearBuilt || null,
      };

      const listingPayload: any = {
        title: formData.title,
        description: formData.description,
        category: category,
        subcategory: subcategory,
        price: Number(formData.price),
        currency: formData.currency,
        city: formData.city,
        location: formData.streetAddress || `${formData.district}, ${formData.city}`,
        listingType: formData.listingType,
        images: finalImages,
        beds: Number(formData.bedrooms) || null,
        baths: Number(formData.bathrooms) || null,
        size: `${formData.areaSize} m²`,
        complianceYear: formData.yearBuilt || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        district: formData.district,
        region: formData.region,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        legalOwnershipCertificateUrl: finalOwnershipUrl,
        sellerNationalIdUrl: finalIdentityUrl,
        features: featuresObj,
        metadata: {
          country: formData.country,
          preferredContact: formData.preferredContact,
          digitalSignature: formData.digitalSignature,
          isAdvancedListing: true,
          submittedAt: new Date().toISOString(),
        }
      };

      let resultId = '';
      if (isEditMode && editId) {
        setUploadStatus('Applying delta state changes to registry...');
        console.log("Updating listing:", editId);
        const success = await listingService.updateListing(editId, listingPayload);
        if (!success) {
          throw new Error('Verification database update rejected check inputs.');
        }
        resultId = editId;
      } else {
        setUploadStatus('Publishing registry node and computing score indices...');
        console.log("Creating listing");
        const newId = await listingService.createListing(listingPayload);
        if (!newId) {
          throw new Error('Database registry server rejected listing creation.');
        }
        resultId = newId;
      }

      setUploadProgress(100);
      setCreatedListingId(resultId);
      setIsSuccess(true);
      toast.success(isEditMode ? 'Listing certificates updated successfully' : 'Your listing request has been queued for moderation.');
    } catch (err: any) {
      console.error('Final Listing submission error:', err);
      // Attempt to parse if it's the JSON stringified from handleFirestoreError
      let errorMessage = err.message || 'Verification check failed.';
      try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.error) errorMessage = parsedError.error;
      } catch (e) {
        // ignore parse error
      }
      toast.error(`Submission Rejection: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsMeta = [
    { number: 1, label: 'Basics', icon: <Building2 size={16} /> },
    { number: 2, label: 'Location', icon: <MapPin size={16} /> },
    { number: 3, label: 'Details', icon: <Compass size={16} /> },
    { number: 4, label: 'Media', icon: <Upload size={16} /> },
    { number: 5, label: 'Pricing', icon: <DollarSign size={16} /> },
    { number: 6, label: 'Verification', icon: <ShieldCheck size={16} /> },
    { number: 7, label: 'Review', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-luxury-black py-20 px-4 md:px-8 text-white relative flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.02),transparent)] pointer-events-none" />

      {/* Decorative Brand Header */}
      <div className="w-full max-w-5xl mb-12 flex items-center justify-between z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-luxury-gold transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-right">
          <p className="text-[10px] text-luxury-gold font-black uppercase tracking-[0.4em] mb-1">AmaanEstate Host</p>
          <p className="text-[8px] text-white/20 uppercase tracking-widest">Property Listing</p>
        </div>
      </div>

      <div className="w-full max-w-5xl text-center mb-10 z-10">
        <p className="text-luxury-gold text-xs font-black uppercase tracking-[0.3em] mb-2">List Your Property</p>
        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
          {isEditMode ? 'Modify Listing Details' : 'List Your Premium Property'}
        </h1>
        <p className="text-white/40 text-sm max-w-lg mx-auto mt-2 font-light">
          Create and publish your verified property listing to East Africa’s largest audience.
        </p>
      </div>

      {/* Progress Wizard Scroller */}
      <div className="w-full max-w-5xl mb-12 hidden md:block z-10">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5 -translate-y-1/2 -z-10" />
          <div 
            className="absolute top-1/2 left-0 h-[1px] bg-luxury-gold -translate-y-1/2 -z-10 transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (stepsMeta.length - 1)) * 100}%` }}
          />

          {stepsMeta.map(step => (
            <button
              key={step.number}
              disabled={step.number > currentStep && !isStepValid(step.number - 1)}
              onClick={() => setCurrentStep(step.number)}
              className={`flex flex-col items-center gap-3 relative focus:outline-none transition-colors group cursor-pointer`}
            >
              <div 
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  currentStep === step.number 
                    ? 'bg-luxury-gold border-luxury-gold text-black shadow-lg shadow-luxury-gold/20 scale-110' 
                    : currentStep > step.number 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : 'bg-white/5 border-white/10 text-white/30 group-hover:border-white/20'
                }`}
              >
                {currentStep > step.number ? <Check size={14} /> : step.icon}
              </div>
              <span className={`text-[9px] uppercase font-bold tracking-widest ${
                currentStep === step.number ? 'text-luxury-gold' : 'text-white/30'
              }`}>
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile progress display */}
      <div className="md:hidden w-full max-w-lg bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 text-center text-xs tracking-wider uppercase font-bold text-white/50 flex justify-between items-center z-10">
        <span>Step {currentStep} of {stepsMeta.length}</span>
        <span className="text-luxury-gold">{stepsMeta[currentStep - 1].label}</span>
      </div>

      {/* Success View Screen */}
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl glass-card rounded-[3rem] p-12 text-center border border-white/5 relative overflow-hidden z-10 shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-display font-medium tracking-tight mb-4">
              {isEditMode ? 'Listing Successfully Updated!' : 'Property Listing Published'}
            </h2>
            <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed mb-10 font-light">
              {isEditMode 
                ? 'Your property updates have been successfully saved and are now live.'
                : 'Our listing moderators will review your verification files and documents. Your listing should go live to the public shortly.'
              }
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="bg-white/5 border border-white/10 hover:bg-white/10 h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-widest text-white/80 hover:text-white"
              >
                Access Dashboard
              </Button>
              <Button 
                onClick={() => navigate(`/properties/${createdListingId}`)} 
                className="bg-luxury-gold text-black hover:bg-white h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-lg shadow-luxury-gold/10"
              >
                View Asset Profile
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl z-10 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-24 h-24 bg-luxury-gold/5 blur-3xl pointer-events-none rounded-full" />
            
            {/* Steps Container */}
            <div className="space-y-8 flex-1 min-h-[400px]">

              {/* STEP 1: Property Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 1 — Property Basics</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Provide general property details, type, and descriptive information</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 ml-1">Property Title *</label>
                    <Input 
                      placeholder="e.g. Luxurious 5-Bedroom Villa at Sha'ab Area" 
                      name="title"
                      value={formData.title}
                      onChange={handleTextChange}
                      required
                      className="bg-white/5 border-white/5 h-14 rounded-xl text-white placeholder:text-white/10 text-sm focus:ring-luxury-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 ml-1">Property Type *</label>
                      <Select 
                        value={formData.propertyType}
                        onValueChange={(val) => handleSelectChange('propertyType', val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-xl text-white">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/15 text-white">
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Land">Land Plot</SelectItem>
                          <SelectItem value="Commercial">Commercial Office / Mall</SelectItem>
                          <SelectItem value="Villa">Villa Estate</SelectItem>
                          <SelectItem value="Vehicle">Vehicle Details</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 ml-1">Listing Type *</label>
                      <Select 
                        value={formData.listingType}
                        onValueChange={(val) => handleSelectChange('listingType', val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-xl text-white">
                          <SelectValue placeholder="Listing intent" />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/15 text-white">
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 ml-1">Description (Min 15 char) *</label>
                    <Textarea 
                      placeholder="Describe your property's style, design, unique layout details, local highlights, and amenities..." 
                      name="description"
                      value={formData.description}
                      onChange={handleTextChange}
                      required
                      className="bg-white/5 border-white/5 min-h-[140px] rounded-xl text-white placeholder:text-white/10 text-sm focus:ring-luxury-gold"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Mapping */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 2 — Location Details</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Enter the location details and select the address on the map</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Country *</label>
                      <Input 
                        name="country"
                        value={formData.country}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Region / Province *</label>
                      <Input 
                        placeholder="e.g. Coast" 
                        name="region"
                        value={formData.region}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-white/10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">City *</label>
                      <Input 
                        placeholder="e.g. Nairobi" 
                        name="city"
                        value={formData.city}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-white/10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">District / Neighborhood</label>
                      <Input 
                        placeholder="e.g. Kilimani" 
                        name="district"
                        value={formData.district}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-white/10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Street Address</label>
                      <Input 
                        placeholder="e.g. Peponi Road" 
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-white/10 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 ml-1">Your Property Location</label>
                      <p className="text-[8px] text-luxury-gold uppercase tracking-widest font-black">
                        {formData.latitude ? 'Location Selected' : 'Select Location on Map'}
                      </p>
                    </div>
                    
                    <div className="rounded-2xl border border-white/5 bg-white/[0.01]">
                      <MapPicker 
                        city={formData.city}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onChange={handleMapChange}
                        onAddressChange={handleMapAddressChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Property Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 3 — Property Details</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Specify dimensions, layouts, and additional characteristics</p>
                  </div>

                  {formData.propertyType === 'Vehicle' ? (
                    <div className="p-8 bg-white/5 border border-white/5 rounded-2xl text-center">
                      <Car size={32} className="text-luxury-gold mx-auto mb-3" />
                      <p className="text-sm font-bold text-white mb-2">Vehicle Details</p>
                      <p className="text-xs text-white/40 leading-relaxed font-light">
                        Provide a description and detailed specifications. Additional information such as mileage and engine options can be added during verification.
                      </p>
                    </div>
                  ) : formData.propertyType === 'Land' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Plot Area Size (m²) *</label>
                          <Input 
                            type="number"
                            placeholder="e.g. 400" 
                            name="areaSize"
                            value={formData.areaSize}
                            onChange={handleTextChange}
                            required
                            className="bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Zoning Designation</label>
                          <Select 
                            value={formData.furnished}
                            onValueChange={(val) => handleSelectChange('furnished', val)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/5 h-12 rounded-xl text-white">
                              <SelectValue placeholder="Furnished option" />
                            </SelectTrigger>
                            <SelectContent className="bg-luxury-black border-white/15 text-white">
                              <SelectItem value="N/A">Commercial Zoning</SelectItem>
                              <SelectItem value="Furnished">Residential Zoning</SelectItem>
                              <SelectItem value="Unfurnished">Agriculture Zoning</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1 flex items-center gap-1.5">
                            <Bed size={12} className="text-luxury-gold/70 shrink-0" /> Bedrooms *
                          </label>
                          <Input 
                            type="number"
                            placeholder="3" 
                            name="bedrooms"
                            value={formData.bedrooms}
                            onChange={handleTextChange}
                            required
                            className="bg-white/[0.02] border-white/5 hover:border-white/10 focus-visible:border-luxury-gold/30 focus-visible:ring-luxury-gold/5 h-10 rounded-xl text-white text-xs transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1 flex items-center gap-1.5">
                            <Bath size={12} className="text-luxury-gold/70 shrink-0" /> Bathrooms *
                          </label>
                          <Input 
                            type="number"
                            placeholder="2" 
                            name="bathrooms"
                            value={formData.bathrooms}
                            onChange={handleTextChange}
                            required
                            className="bg-white/[0.02] border-white/5 hover:border-white/10 focus-visible:border-luxury-gold/30 focus-visible:ring-luxury-gold/5 h-10 rounded-xl text-white text-xs transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1 flex items-center gap-1.5">
                            <Ruler size={12} className="text-luxury-gold/70 shrink-0" /> Size (m²) *
                          </label>
                          <Input 
                            type="number"
                            placeholder="250" 
                            name="areaSize"
                            value={formData.areaSize}
                            onChange={handleTextChange}
                            required
                            className="bg-white/[0.02] border-white/5 hover:border-white/10 focus-visible:border-luxury-gold/30 focus-visible:ring-luxury-gold/5 h-10 rounded-xl text-white text-xs transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1 flex items-center gap-1.5">
                            <Car size={12} className="text-luxury-gold/70 shrink-0" /> Parking Spaces
                          </label>
                          <Input 
                            type="number"
                            placeholder="1" 
                            name="parkingSpaces"
                            value={formData.parkingSpaces}
                            onChange={handleTextChange}
                            className="bg-white/[0.02] border-white/5 hover:border-white/10 focus-visible:border-luxury-gold/30 focus-visible:ring-luxury-gold/5 h-10 rounded-xl text-white text-xs transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1">Furnishing</label>
                          <Select 
                            value={formData.furnished}
                            onValueChange={(val: any) => handleSelectChange('furnished', val)}
                          >
                            <SelectTrigger className="bg-white/[0.02] border-white/5 hover:border-white/10 h-10 rounded-xl text-white text-xs transition-all duration-200">
                              <SelectValue placeholder="Furnished status" />
                            </SelectTrigger>
                            <SelectContent className="bg-luxury-black border-white/15 text-white">
                              <SelectItem value="Furnished">Fully Furnished</SelectItem>
                              <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1">Year Constructed</label>
                          <Input 
                            placeholder="e.g. 2024" 
                            name="yearBuilt"
                            value={formData.yearBuilt}
                            onChange={handleTextChange}
                            className="bg-white/[0.02] border-white/5 hover:border-white/10 focus-visible:border-luxury-gold/30 focus-visible:ring-luxury-gold/5 h-10 rounded-xl text-white placeholder:text-white/10 text-xs transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities checklist */}
                  <div>
                    <label className="text-[9px] uppercase font-bold tracking-widest text-white/45 ml-1 block mb-3">Amenities & Features</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-3.5">
                      {Object.keys(formData.features).map((fKey) => {
                        const hasF = formData.features[fKey as keyof FormState['features']];
                        const featureIcons: Record<string, React.ReactNode> = {
                          wifi: <Wifi size={13} />,
                          water: <Droplet size={13} />,
                          electricity: <Zap size={13} />,
                          security: <Shield size={13} />,
                          garage: <Car size={13} />,
                          balcony: <Building2 size={13} />,
                          garden: <Sparkles size={13} />,
                          airConditioning: <Compass size={13} />,
                        };
                        return (
                          <button
                            key={fKey}
                            type="button"
                            onClick={() => handleFeatureToggle(fKey as keyof FormState['features'])}
                            className={`p-3 rounded-xl border text-left transition-all duration-300 flex items-center justify-between gap-2.5 group cursor-pointer ${
                              hasF 
                                ? 'bg-luxury-gold/5 border-luxury-gold/30 text-white shadow-[0_4px_16px_rgba(197,160,89,0.06)]' 
                                : 'bg-white/[0.02] border-white/5 text-white/40 hover:border-white/10 hover:bg-white/[0.04]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`p-1.5 rounded-lg shrink-0 transition-colors ${hasF ? 'bg-luxury-gold/15 text-luxury-gold' : 'bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/50'}`}>
                                {featureIcons[fKey] || <Check size={12} />}
                              </span>
                              <span className={`text-[10px] font-semibold tracking-wide capitalize truncate transition-colors ${hasF ? 'text-white/90' : 'text-white/45 group-hover:text-white/70'}`}>
                                {fKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </span>
                            </div>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              hasF ? 'bg-luxury-gold border-luxury-gold text-black' : 'border-white/10 group-hover:border-white/20'
                            }`}>
                              {hasF && <Check size={8} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Media Upload */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 4 — Photos</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Upload high-resolution property photos. The first photo will be used as the cover banner.</p>
                  </div>

                  {isEditMode && existingImagesList.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Currently Published Assets</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {existingImagesList.map((imgUrl, idx) => (
                          <div key={imgUrl} className="aspect-square rounded-2xl border border-white/5 overflow-hidden relative group">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                onClick={() => setExistingImagesList(prev => prev.filter(item => item !== imgUrl))}
                                className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            {idx === 0 && (
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-luxury-gold text-black text-[7px] uppercase font-black tracking-widest">
                                Primary Hero
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <ImageUpload 
                    onImagesChange={(files) => setImageFiles(files)} 
                    maxFiles={10} 
                    label="Upload Beautiful Property Photos"
                  />
                </div>
              )}

              {/* STEP 5: Pricing & Contacts */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 5 — Pricing & Contact Info</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Set your listing price and preferred contact details</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2 col-span-1">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Currency *</label>
                      <Select 
                        value={formData.currency}
                        onValueChange={(val: any) => handleSelectChange('currency', val)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-xl text-white">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="bg-luxury-black border-white/15 text-white">
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="ETB">ETB (Birr)</SelectItem>
                          <SelectItem value="SLS">SLS (Shilling)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Price *</label>
                      <Input 
                        type="number"
                        placeholder="e.g. 150000" 
                        name="price"
                        value={formData.price}
                        onChange={handleTextChange}
                        required
                        className="bg-white/5 border-white/5 h-14 rounded-xl text-white text-sm font-bold placeholder:text-white/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Phone Number *</label>
                      <Input 
                        placeholder="+252 63 ..." 
                        name="phone"
                        value={formData.phone}
                        onChange={handleTextChange}
                        required
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">WhatsApp Number</label>
                      <Input 
                        placeholder="+254 7..." 
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Email Address</label>
                      <Input 
                        type="email"
                        placeholder="info@ayaanestate.com" 
                        name="email"
                        value={formData.email}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Preferred Contact Method</label>
                    <div className="flex gap-4">
                      {['WhatsApp', 'Phone', 'Email'].map((method) => {
                        const active = formData.preferredContact === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => handleSelectChange('preferredContact', method)}
                            className={`flex-1 py-4 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                              active 
                                ? 'bg-luxury-gold/5 border-luxury-gold text-luxury-gold' 
                                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/[0.04]'
                            }`}
                          >
                            {method}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Verification & Agreement */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-luxury-gold mb-1">Step 6 — Verification Documents</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Upload your ownership deed or title document, and a government ID to help us verify your listing.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center text-center justify-between gap-4">
                      <FileText size={28} className="text-luxury-gold" />
                      <div>
                        <p className="text-xs font-bold text-white mb-1">Property Deed or Title Certificate</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Upload certified document (PDF, PNG or JPG up to 10MB)</p>
                      </div>
                      
                      {ownershipFile ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] uppercase font-black font-sans">
                          <Check size={12} /> {ownershipFile.name.substring(0, 15)}...
                          <button onClick={() => setOwnershipFile(null)} className="ml-1 text-white hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      ) : existingOwnershipUrl ? (
                        <div className="flex items-center gap-2 bg-luxury-gold/10 px-4 py-2 border border-luxury-gold/20 text-luxury-gold rounded-lg text-[9px] uppercase font-black font-sans">
                          <Check size={12} /> certificate_signed.pdf
                          <label className="ml-2 py-0.5 px-1 bg-white/5 text-white/[0.4] rounded text-[7px] cursor-pointer" onClick={() => setExistingOwnershipUrl('')}>Replace</label>
                        </div>
                      ) : (
                        <Button asChild className="bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-widest h-12 w-full rounded-xl">
                          <label>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => setOwnershipFile(e.target.files?.[0] || null)}
                              accept=".pdf,image/*" 
                            />
                            Select Document
                          </label>
                        </Button>
                      )}
                    </div>

                    <div className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center text-center justify-between gap-4">
                      <ShieldCheck size={28} className="text-luxury-gold" />
                      <div>
                        <p className="text-xs font-bold text-white mb-1">Government ID or Passport</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Upload scanner image or passport photo file</p>
                      </div>

                      {identityFile ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] uppercase font-black font-sans">
                          <Check size={12} /> {identityFile.name.substring(0, 15)}...
                          <button onClick={() => setIdentityFile(null)} className="ml-1 text-white hover:text-red-400"><Trash2 size={12} /></button>
                        </div>
                      ) : existingIdentityUrl ? (
                        <div className="flex items-center gap-2 bg-luxury-gold/10 px-4 py-2 border border-luxury-gold/20 text-luxury-gold rounded-lg text-[9px] uppercase font-black font-sans">
                          <Check size={12} /> id_verified.jpg
                          <label className="ml-2 py-0.5 px-1 bg-white/5 text-white/[0.4] rounded text-[7px] cursor-pointer" onClick={() => setExistingIdentityUrl('')}>Replace</label>
                        </div>
                      ) : (
                        <Button asChild className="bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center cursor-pointer text-[10px] font-black uppercase tracking-widest h-12 w-full rounded-xl">
                          <label>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => setIdentityFile(e.target.files?.[0] || null)}
                              accept=".pdf,image/*" 
                            />
                            Attach Scan
                          </label>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="flex items-start gap-4 cursor-pointer text-white/50 hover:text-white transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.termsAccepted} 
                        onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                        className="mt-1 accent-luxury-gold"
                      />
                      <span className="text-xs leading-relaxed font-light">
                        I hereby declare that all provided documents, title certificates, and visual representations of the property are accurate and authentic. I consent to the standard listing terms and real-estate directory conditions of East Africa.
                      </span>
                    </label>

                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 ml-1">Digital Signature</label>
                      <Input 
                        placeholder="Type your full legal name to confirm listing terms" 
                        name="digitalSignature"
                        value={formData.digitalSignature}
                        onChange={handleTextChange}
                        className="bg-white/5 border-white/5 h-12 rounded-xl text-white text-sm font-sans italic tracking-wider focus:ring-luxury-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Full Review & Submit */}
              {currentStep === 7 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-gold font-bold text-luxury-gold mb-1">Step 7 — Review & Publish</h3>
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Review your details and documents before publishing your listing</p>
                  </div>

                  {/* Summary Card */}
                  <div className="glass-card p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex justify-between items-start border-b border-white/5 pb-4">
                      <div>
                        <h4 className="text-xl font-bold font-display text-white">{formData.title || 'Untitled Property Listing'}</h4>
                        <p className="text-[10px] uppercase font-black tracking-widest text-luxury-gold mt-1">
                          {formData.propertyType} • For {formData.listingType === 'sale' ? 'Sale' : 'Rent'}
                        </p>
                      </div>
                      <p className="text-2xl font-display font-medium text-white font-mono">
                        {formData.currency} {Number(formData.price || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-white/60 font-light leading-relaxed">
                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Property Address</p>
                        <p className="flex items-center gap-2"><MapPin size={12} className="text-luxury-gold shrink-0" /> {formData.streetAddress}, {formData.city}, East Africa</p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Size & Layout</p>
                        <p>
                          {formData.propertyType === 'Vehicle' ? 'Class Mobility Designation' : 
                           formData.propertyType === 'Land' ? `Plot Area size: ${formData.areaSize} m²` : 
                           `${formData.bedrooms} Bedrooms • ${formData.bathrooms} Bathrooms • ${formData.areaSize} m²`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/30">Narrative Summary</p>
                      <p className="text-xs text-white/50 leading-relaxed font-light italic truncate max-w-full" title={formData.description}>{formData.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                      <div className="text-center bg-white/5 p-4 rounded-2xl">
                        <p className="text-[8px] uppercase tracking-widest text-white/35 font-bold mb-1">Photos</p>
                        <p className="text-lg font-bold font-mono text-white">{isEditMode ? existingImagesList.length + imageFiles.length : imageFiles.length}</p>
                      </div>
                      <div className="text-center bg-white/5 p-4 rounded-2xl">
                        <p className="text-[8px] uppercase tracking-widest text-white/35 font-bold mb-1">Documents</p>
                        <p className="text-lg font-bold text-emerald-400">Included</p>
                      </div>
                      <div className="text-center bg-white/5 p-4 rounded-2xl">
                        <p className="text-[8px] uppercase tracking-widest text-white/35 font-bold mb-1">Contact Choice</p>
                        <p className="text-xs font-bold text-luxury-gold truncate">{formData.preferredContact}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-luxury-gold/5 border border-luxury-gold/20 rounded-2xl flex items-start gap-4">
                    <Sparkles className="text-luxury-gold shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Upon publishing, your listing will be reviewed by our moderation team before going live on East Africa's premier directory map to maintain maximum security and trust.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Stepper Controllers */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5 z-10 gap-4">
              {currentStep > 1 ? (
                <Button
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  variant="outline"
                  className="h-14 px-8 border-white/5 bg-white/5 rounded-2xl text-[10px] uppercase font-black tracking-widest hover:text-white"
                >
                  <ArrowLeft size={14} className="mr-2" /> Previous Step
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 7 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-luxury-gold text-black hover:bg-white h-14 px-8 rounded-2xl text-[10px] uppercase font-black tracking-widest scale-100 hover:scale-102 transition-transform shadow-lg shadow-luxury-gold/5"
                >
                  Next Step <ArrowRight size={14} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 h-16 px-12 rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-2xl flex items-center gap-3 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>{isEditMode ? 'Apply Updates' : 'Publish Property Listing'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {isSubmitting && (
              <div className="absolute inset-0 bg-luxury-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 z-50">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-white/5" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-luxury-gold border-r-luxury-gold animate-spin" />
                  <div className="absolute inset-4 rounded-2xl bg-white/5 flex items-center justify-center text-luxury-gold font-mono text-xs font-bold">
                    {uploadProgress}%
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">Publishing Listing...</h4>
                <p className="text-white/40 text-xs animate-pulse max-w-sm font-sans tracking-wide">{uploadStatus}</p>
              </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
