import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { listingService } from '@/services/listingService';
import { uploadFile } from '@/services/uploadService';
import GalleryUpload from '@/components/article/GalleryUpload';
import MapPicker from '@/components/location/MapPicker';
import { formatPrice } from '@/lib/utils';
import { FormWizard } from '@/components/ui/FormWizard';
import { Shield, Info, Check, CheckCircle2, ExternalLink, Loader2, Upload } from 'lucide-react';

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
    currency: 'ETB' as 'ETB' | 'USD',
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

    // Advanced Property Details
    nearbyPlaces: [{ name: '', distance: '', description: '' }],
    verification: {
      titleType: '',
      legalStatus: '',
      taxStatus: '',
      verificationNotes: ''
    },
    features: {
      furnished: false,
      parking: false,
      parkingSpaces: 0,
      waterAccess: false,
      electricityNearby: false,
      securitySystem: false,
      cornerPlot: false,
      roadAccess: false,
      fenced: false,
      floorsCount: 0,
      plotType: '',
      terrain: '',
      zoningType: '',
      landUse: ''
    },
    financing: {
      minDownPayment: 0,
      suggestedInterestRate: 0,
      mortgageDurationDefault: 0
    },
    conciergeExtras: {
      agentResponseTime: '',
      whatsAppContact: '',
      viewingNotes: ''
    }
  });

  // Calculate overall form completion progress
  const steps = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Location' },
    { id: 3, label: 'Property Photos' },
    { id: 4, label: 'Description' },
    { id: 5, label: 'Advanced Details' },
    { id: 6, label: 'Verification' },
    { id: 7, label: 'Preview & Submit' }
  ];

  const handleNextStep = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
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
        return true;
      case 6:
        // All legal verification parameters are completely optional
        return true;
      case 7:
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
            currency: formData.currency,
            city: formData.city,
            location: formData.district ? `${formData.district}, ${formData.city}` : formData.city,
            subcategory: formData.subcategory.toLowerCase(),
            listingType: formData.listingType === 'sale' ? 'sale' : 'rent',
            category: 'property',
            images: formData.images,
            district: formData.district,
            landmark: formData.landmark,
            latitude: formData.latitude,
            longitude: formData.longitude,
            region: formData.city,
            beds: Number(formData.beds),
            baths: Number(formData.baths),
            size: formData.size,
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

        // Append Advanced Details
        payload.nearbyPlaces = formData.nearbyPlaces.filter(p => p.name || p.distance || p.description);
        
        // Add verification only if something is filled
        if (Object.values(formData.verification).some(v => v)) {
            payload.verification = formData.verification;
        }

        // Add features only if something is filled
        const filledFeatures = Object.fromEntries(
            Object.entries(formData.features).filter(([_, v]) => v !== false && v !== 0 && v !== '')
        );
        if (Object.keys(filledFeatures).length > 0) {
            payload.features = { ...payload.features, ...filledFeatures };
        }

        // Add optional metadata
        if (Object.values(formData.financing).some(v => v)) payload.financing = formData.financing;
        if (Object.values(formData.conciergeExtras).some(v => v)) payload.conciergeExtras = formData.conciergeExtras;
        if (formData.district || formData.landmark) {
             payload.locationExtras = {
                 district: formData.district,
                 landmark: formData.landmark,
                 latitude: formData.latitude,
                 longitude: formData.longitude
             };
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
    ? formatPrice(Number(formData.price), formData.currency)
    : 'Not Specified';

  const renderBasicInfo = (data: any, setData: any) => (
    <div className="space-y-6">
      <Input placeholder="Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
    </div>
  );

  const renderLocation = (data: any, setData: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select value={data.city} onChange={e => setData({...data, city: e.target.value})} className="w-full h-14 bg-white/5 border border-white/10 px-4 rounded-2xl text-white">
          <option value="Jigjiga">Jigjiga</option>
          <option value="Dire Dawa">Dire Dawa</option>
        </select>
        <Input placeholder="District" value={data.district} onChange={e => setData({...data, district: e.target.value})} className="h-14 bg-white/5 border-white/10 rounded-2xl" />
      </div>
      <MapPicker city={data.city} latitude={data.latitude} longitude={data.longitude} onChange={(lat, lng) => setData({...data, latitude: lat, longitude: lng})} />
    </div>
  );

  const renderMedia = (data: any, setData: any) => (
    <GalleryUpload value={data.images} onChange={(images) => setData({...data, images})} label="Upload Photos" folder="property_mls" />
  );

  const renderDescription = (data: any, setData: any) => (
    <Textarea placeholder="Describe the property..." value={data.description} onChange={e => setData({...data, description: e.target.value})} className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl" />
  );

  const wizardSteps = [
    { id: 'basic', title: 'Basic Information', component: renderBasicInfo },
    { id: 'location', title: 'Location', component: renderLocation },
    { id: 'media', title: 'Photos', component: renderMedia },
    { id: 'description', title: 'Description', component: renderDescription },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-24">
      <div className="container mx-auto px-4">
        <FormWizard 
          steps={wizardSteps}
          initialData={formData}
          onSaveDraft={(data) => console.log('Draft saved', data)}
          onSubmit={handleSubmit}
          onDataChange={setFormData}
        />
      </div>
    </div>
  );
}
