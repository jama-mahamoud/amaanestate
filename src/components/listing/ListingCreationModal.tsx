import React, { useState, useEffect } from 'react';
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
  Loader2, Check, MapPin, Building2, ChevronRight, ChevronLeft, 
  Upload, Car, Home, Compass, Trees, Building, Sparkles, 
  Key, BadgePlus, DollarSign, Image as ImageIcon, CheckCircle2,
  Bed, Bath, Ruler, CarFront, Sofa, Zap, XCircle
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import MapPicker from '../location/MapPicker';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ListingCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ListingCategory;
  onSuccess?: () => void;
  listingToEdit?: any;
  defaultListingType?: ListingType;
}

type StepId = 'purpose' | 'type' | 'location' | 'details' | 'images' | 'review';

export default function ListingCreationModal({ isOpen, onClose, category: propCategory, onSuccess, listingToEdit, defaultListingType }: ListingCreationModalProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: StepId[] = ['purpose', 'type', 'location', 'details', 'images', 'review'];

  const [formData, setFormData] = useState({
    listingType: 'sale' as ListingType,
    assetClass: 'House', // House, Apartment, Land, Commercial, Vehicle
    title: '',
    description: '',
    beds: '',
    baths: '',
    size: '',
    parking: 'No',
    furnished: 'No',
    landUse: 'Residential',
    roadAccess: 'No',
    boundaryDescription: '',
    floorsCount: '',
    powerCapacity: '',
    parkingSpaces: '',
    securitySystems: 'No',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    mileage: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    price: '',
    currency: 'ETB',
    city: 'Jigjiga',
    district: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    phone: '',
    whatsapp: '',
    email: '',
    nearbyPlaces: '',
  });

  const actualCategory = formData.assetClass === 'Vehicle' ? 'vehicle' : 'property';

  useEffect(() => {
    if (isOpen) {
      if (listingToEdit) {
        setFormData({
          assetClass: listingToEdit.subcategory || (listingToEdit.category === 'vehicle' ? 'Vehicle' : 'House'),
          listingType: listingToEdit.listingType || 'sale',
          title: listingToEdit.title || '',
          description: listingToEdit.description || '',
          beds: listingToEdit.features?.beds?.toString() || listingToEdit.beds?.toString() || '',
          baths: listingToEdit.features?.baths?.toString() || listingToEdit.baths?.toString() || '',
          size: listingToEdit.features?.size || listingToEdit.size || '',
          parking: listingToEdit.features?.parking || 'No',
          furnished: listingToEdit.features?.furnished || 'No',
          landUse: listingToEdit.features?.landUse || 'Residential',
          roadAccess: listingToEdit.features?.roadAccess ? 'Yes' : 'No',
          boundaryDescription: listingToEdit.features?.boundaryDescription || '',
          floorsCount: listingToEdit.features?.floorsCount?.toString() || '',
          powerCapacity: listingToEdit.features?.powerCapacity || '',
          parkingSpaces: listingToEdit.features?.parkingSpaces?.toString() || '',
          securitySystems: listingToEdit.features?.securitySystems ? 'Yes' : 'No',
          make: listingToEdit.make || '',
          model: listingToEdit.model || '',
          year: listingToEdit.year?.toString() || new Date().getFullYear().toString(),
          mileage: listingToEdit.mileage || '',
          fuelType: listingToEdit.fuelType || 'Petrol',
          transmission: listingToEdit.transmission || 'Automatic',
          price: listingToEdit.price?.toString() || '',
          currency: listingToEdit.currency || 'ETB',
          city: listingToEdit.city || 'Jigjiga',
          district: listingToEdit.district || '',
          landmark: listingToEdit.landmark || '',
          latitude: listingToEdit.latitude,
          longitude: listingToEdit.longitude,
          phone: listingToEdit.phone || listingToEdit.features?.phone || '',
          whatsapp: listingToEdit.whatsapp || listingToEdit.features?.whatsapp || '',
          email: listingToEdit.email || listingToEdit.features?.email || '',
          nearbyPlaces: listingToEdit.nearbyPlacesString || (Array.isArray(listingToEdit.nearbyPlaces) ? listingToEdit.nearbyPlaces.map((p: any) => `${p.name} (${p.dist || p.distance || '1 km'})`).join(', ') : ''),
        });
        setCurrentStep(0);
      } else {
        setFormData(prev => ({
          ...prev,
          assetClass: propCategory === 'vehicle' ? 'Vehicle' : 'House',
          listingType: defaultListingType || 'sale',
          title: '', description: '', price: '', beds: '', baths: '', size: '',
          make: '', model: '', mileage: '', district: '', landmark: '',
          phone: '', whatsapp: '', email: '', nearbyPlaces: ''
        }));
        setSelectedFiles([]);
        setCurrentStep(0);
        setError(null);
      }
    }
  }, [isOpen, listingToEdit, propCategory, defaultListingType]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step) {
      case 'purpose': return !!formData.listingType;
      case 'type': return !!formData.assetClass;
      case 'location': return !!formData.city && !!formData.district;
      case 'details': 
        if (formData.assetClass === 'Vehicle') return !!formData.make && !!formData.model && !!formData.year && !!formData.price && !!formData.phone;
        return !!formData.price && !!formData.size && !!formData.phone;
      case 'images': return selectedFiles.length > 0 || (listingToEdit && listingToEdit.images?.length > 0);
      case 'review': return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setUploading(true);
    setError(null);

    try {
      const newListingId = listingToEdit ? listingToEdit.id : doc(collection(db, 'listings')).id;
      let uploadedImages = listingToEdit?.metadata?.imageMetas || [];
      let imagesUrls = listingToEdit?.images || [];

      if (selectedFiles.length > 0) {
        uploadedImages = await storageService.uploadListingImages(newListingId, selectedFiles);
        imagesUrls = uploadedImages.map((img: any) => img.url);
      }

      const parsedNearbyPlaces = (formData.nearbyPlaces || '')
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
        .map((item: string) => {
          const parenMatch = item.match(/\(([^)]+)\)/);
          let dist = '';
          let name = item;
          if (parenMatch) {
            dist = parenMatch[1];
            name = item.replace(/\([^)]+\)/, '').trim();
          } else {
            const distMatch = item.match(/(\d+\s*(?:km|m|mins|min|miles|hr|hrs|hour|hours))/i);
            if (distMatch) {
              dist = distMatch[1];
              name = item.replace(distMatch[1], '').replace(/at|near/gi, '').trim();
            }
          }
          return {
            name: name,
            dist: dist || '1 km',
            desc: `Located in close range to ${name}`
          };
        });

      const listingData: any = {
        category: actualCategory,
        title: formData.title || `${formData.assetClass} in ${formData.city}`,
        description: formData.description,
        price: Number(formData.price),
        currency: formData.currency,
        city: formData.city,
        location: formData.district ? `${formData.district}, ${formData.city}` : formData.city,
        listingType: formData.listingType,
        subcategory: formData.assetClass,
        images: imagesUrls,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        nearbyPlaces: parsedNearbyPlaces,
        nearbyPlacesString: formData.nearbyPlaces,
        metadata: { imageMetas: uploadedImages }
      };

      if (actualCategory === 'vehicle') {
        listingData.make = formData.make;
        listingData.model = formData.model;
        listingData.year = Number(formData.year);
        listingData.mileage = formData.mileage;
        listingData.fuelType = formData.fuelType;
        listingData.transmission = formData.transmission;
      } else {
        listingData.size = formData.size;
        listingData.district = formData.district;
        listingData.landmark = formData.landmark;
        listingData.latitude = formData.latitude;
        listingData.longitude = formData.longitude;
        listingData.region = formData.city;
        
        const features: any = { size: formData.size };
        if (formData.assetClass === 'House' || formData.assetClass === 'Apartment') {
          features.beds = Number(formData.beds) || 0;
          features.baths = Number(formData.baths) || 0;
          if (formData.furnished !== 'No') features.furnished = formData.furnished;
          if (formData.parking !== 'No') features.parking = formData.parking;
        } else if (formData.assetClass === 'Land') {
          features.landUse = formData.landUse;
          if (formData.roadAccess === 'Yes') features.roadAccess = true;
          if (formData.boundaryDescription) features.boundaryDescription = formData.boundaryDescription;
        } else if (formData.assetClass === 'Commercial') {
          if (formData.floorsCount) features.floorsCount = Number(formData.floorsCount);
          if (formData.parkingSpaces) features.parkingSpaces = Number(formData.parkingSpaces);
          if (formData.powerCapacity) features.powerCapacity = formData.powerCapacity;
          if (formData.securitySystems === 'Yes') features.securitySystems = true;
        }
        listingData.features = features;
      }

      if (listingToEdit) {
        await listingService.updateListing(listingToEdit.id, listingData, profile?.role === 'admin');
      } else {
        await listingService.createListingWithId(newListingId, listingData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete listing creation.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const renderProgress = () => {
    const progress = ((currentStep + 1) / steps.length) * 100;
    return (
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-luxury-gold shadow-[0_0_15px_rgba(197,160,89,0.5)]"
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-luxury-black border border-white/10 text-white max-w-4xl p-0 overflow-hidden shadow-2xl rounded-3xl">
        <div className="flex flex-col h-[600px] max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                  <BadgePlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">List Your Asset</h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Step {currentStep + 1} of {steps.length}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={20} className="text-white/40" />
              </button>
            </div>
            {renderProgress()}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="max-w-2xl mx-auto"
              >
                
                {/* Step 1: Purpose */}
                {steps[currentStep] === 'purpose' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">What is your goal?</h3>
                      <p className="text-white/40 text-sm">Select whether you want to sell or rent this asset.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'sale', label: 'For Sale', desc: 'One-time purchase', icon: DollarSign },
                        { id: 'rent', label: 'For Rent', desc: 'Recurring lease', icon: Key },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setFormData({ ...formData, listingType: p.id as ListingType });
                            setTimeout(handleNext, 200);
                          }}
                          className={`p-6 rounded-2xl border text-left transition-all ${
                            formData.listingType === p.id 
                            ? 'border-luxury-gold bg-luxury-gold/5' 
                            : 'border-white/5 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                            formData.listingType === p.id ? 'bg-luxury-gold text-black' : 'bg-white/5 text-white/60'
                          }`}>
                            <p.icon size={24} />
                          </div>
                          <h4 className="text-lg font-bold mb-1">{p.label}</h4>
                          <p className="text-xs text-white/40">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Type */}
                {steps[currentStep] === 'type' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">Asset Type</h3>
                      <p className="text-white/40 text-sm">Select the category that best fits your asset.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'House', label: 'House', icon: Home },
                        { id: 'Apartment', label: 'Apartment', icon: Building },
                        { id: 'Land', label: 'Land', icon: Compass },
                        { id: 'Commercial', label: 'Comm.', icon: Building2 },
                        { id: 'Vehicle', label: 'Vehicle', icon: CarFront },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setFormData({ ...formData, assetClass: t.id });
                            setTimeout(handleNext, 200);
                          }}
                          className={`p-5 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                            formData.assetClass === t.id 
                            ? 'border-luxury-gold bg-luxury-gold/5' 
                            : 'border-white/5 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.assetClass === t.id ? 'bg-luxury-gold text-black' : 'bg-white/5 text-white/60'
                          }`}>
                            <t.icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {steps[currentStep] === 'location' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left text-sm">
                      <h3 className="text-2xl font-bold mb-2">Location</h3>
                      <p className="text-white/40">Where is the asset located?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/40 ml-1">City</label>
                          <Select value={formData.city} onValueChange={v => setFormData({...formData, city: v})}>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-luxury-black border-white/10 text-white">
                              {['Mogadishu', 'Hargeisa', 'Jigjiga', 'Bosaso', 'Garowe', 'Kismayo', 'Baidoa'].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/40 ml-1">District</label>
                          <Input value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="e.g. Hodan" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Landmark</label>
                          <Input value={formData.landmark} onChange={e => setFormData({...formData, landmark: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="Near..." />
                        </div>
                        <div className="space-y-1.5">
                          <label id="label-nearby-places-modal" className="text-[10px] uppercase font-bold text-white/40 ml-1">Nearby Places / Landmarks</label>
                          <Input value={formData.nearbyPlaces} onChange={e => setFormData({...formData, nearbyPlaces: e.target.value})} className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="e.g. Airport (5 mins), Grand Mall (2 km)" />
                          <p className="text-[9px] text-white/40 leading-relaxed">Enter popular places separated by commas. Optional but highly recommended.</p>
                        </div>
                      </div>
                      <div className="h-[240px] rounded-2xl overflow-hidden border border-white/10 relative">
                        <MapPicker 
                          latitude={formData.latitude}
                          longitude={formData.longitude}
                          city={formData.city}
                          onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Details */}
                {steps[currentStep] === 'details' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">Details & Price</h3>
                      <p className="text-white/40 text-sm">Provide basic info and the asking price.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Listing Title</label>
                        <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="e.g. Modern Villa" />
                      </div>
                      
                      <div className="space-y-1.5 sm:col-span-2">
                        <label id="label-phone-modal" className="text-[10px] uppercase font-bold text-luxury-gold ml-1">Direct Contact Phone <span className="text-red-400">*</span></label>
                        <Input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="e.g. +251 911 234 567" />
                        <p className="text-[9px] text-white/40 leading-relaxed">Direct contact number for calls.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">WhatsApp Number</label>
                        <Input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="e.g. +251 911 234 567" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Email Address</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="e.g. name@example.com" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Price</label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            value={formData.price} 
                            onChange={e => setFormData({...formData, price: e.target.value})} 
                            className="bg-white/5 border-white/10 h-12 rounded-xl flex-1" 
                            placeholder="Price" 
                          />
                          <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
                            <SelectTrigger className="w-24 bg-white/5 border-white/10 h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-luxury-black border-white/10 text-white">
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="ETB">ETB</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {formData.assetClass !== 'Vehicle' ? (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Size (m²)</label>
                            <Input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="e.g. 150" />
                          </div>
                          {(formData.assetClass === 'House' || formData.assetClass === 'Apartment') && (
                            <>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Beds</label>
                                <Input type="number" value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="0" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Baths</label>
                                <Input type="number" value={formData.baths} onChange={e => setFormData({...formData, baths: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="0" />
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Make</label>
                            <Input value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Model</label>
                            <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Description</label>
                      <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[100px] bg-white/5 border-white/10 rounded-xl resize-none py-3" placeholder="Tell us more..." />
                    </div>
                  </div>
                )}

                {/* Step 5: Images */}
                {steps[currentStep] === 'images' && (
                  <div className="space-y-6">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">Images</h3>
                      <p className="text-white/40 text-sm">Upload up to 8 photos of your asset.</p>
                    </div>
                    <ImageUpload 
                      onImagesChange={files => setSelectedFiles(files)}
                      maxFiles={8}
                      existingImages={listingToEdit?.images || []}
                    />
                  </div>
                )}

                {/* Step 6: Review */}
                {steps[currentStep] === 'review' && (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                        <CheckCircle2 size={32} strokeWidth={1} />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">Verify Listing</h3>
                      <p className="text-white/40 text-sm">Review your data before publishing.</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Asset</p>
                          <p className="font-bold">{formData.title || `${formData.assetClass} in ${formData.city}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Price</p>
                          <p className="font-bold text-luxury-gold">{formatPrice(Number(formData.price), formData.currency)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-4">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Location</p>
                          <p className="text-sm">{formData.district}, {formData.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Type</p>
                          <p className="text-sm font-bold uppercase">{formData.listingType} | {formData.assetClass}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Direct Phone</p>
                          <p className="text-sm font-bold text-luxury-gold">{formData.phone || 'N/A'}</p>
                        </div>
                        {formData.nearbyPlaces && (
                          <div className="text-right max-w-xs">
                            <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Nearby Landmarks</p>
                            <p className="text-xs text-white/70 truncate" title={formData.nearbyPlaces}>{formData.nearbyPlaces}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center">
                        {error}
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-white/10 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 0 || loading}
              className="px-6 h-12 text-white/60 hover:text-white hover:bg-white/5"
            >
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="h-12 px-10 bg-luxury-gold text-black hover:bg-white font-bold"
                >
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || !isStepValid()}
                  className="h-12 px-10 bg-white text-black hover:bg-luxury-gold font-bold"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Publish Listing'}
                </Button>
              )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
