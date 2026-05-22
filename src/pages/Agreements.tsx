import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agreementService, Agreement } from '@/services/agreementService';
import { generateAgreementPDF } from '@/lib/agreements';
import { auth } from '@/lib/firebase';
import QRCode from 'qrcode';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  X, 
  CheckCircle,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Upload,
  Edit,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/contexts/SettingsContext';

const DEFAULT_LEGAL_CLAUSES_EN = `1. TITLE OWNERSHIP: Party A represents and guarantees they hold legitimate and unrestrained ownership rights of the designated asset, free of any prior security interest, encumbrance, or ongoing litigation.

2. DISBURSEMENT SCHEDULE: Party B covenants to transfer the designated transaction valuation price upon endorsement hereof according to the scheduled payment terms detailed below.

3. BREACH & PENALITIES: Any material default on covenants by either Party A or Party B shall trigger immediate legal recourse on the regional land registry/commerce legal framework. Late payments or delivery failures bear a cumulative premium fee of 2.5% per week of delay.`;

const DEFAULT_LEGAL_CLAUSES_SO = `1. LAHAANSHAHA CINWAANKA: Dhinaca A wuxuu caddeynayaa oo uu dammaanad qaadayaa inay si sharci ah oo aan xannibaad lahayn u leeyihiin hantida la cayimay, iyadoo ka madax-bannaan wax kasta oo dammaanad ama dacwad socota ah.

2. JADWALKA LACAG-BIXINTA: Dhinaca B wuxuu ballanqaadayaa inuu u wareejiyo qiimaha macaamilka ee loo qoondeeyay marka la saxeexo heshiiskan si waafaqsan shuruudaha lacag-bixinta ee hoos ku xusan.

3. JABINTA & CIQAABAHA: Wax kasta oo ka weecasho ah qodobbada heshiiska ee labada dhinac (A ama B) waxay kicin doonaan dacwad sharci oo degdeg ah oo waafaqsan sharciga iyo nidaamka diiwaangelinta dhulka ee gobolka. Daahitaanka lacag-bixinta ama fashilaadda alaab-keenista waxay keenaysaa ganaax dhan 2.5% toddobaad kasta oo dib-u-dhac ah.`;

const AgreementTypes = [
  { value: 'propertySale', label: 'Property Sale Agreement' },
  { value: 'propertyRental', label: 'Property Rental Agreement' },
  { value: 'vehicleSale', label: 'Vehicle Sale Agreement' },
  { value: 'vehicleRental', label: 'Vehicle Rental Agreement' },
  { value: 'brokerCommission', label: 'Broker Commission Agreement' },
];

export default function Agreements() {
  const { language, t } = useSettings();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // State for drawing pad
  const [sigTypeA, setSigTypeA] = useState<'type' | 'draw'>('type');
  const [sigTypeB, setSigTypeB] = useState<'type' | 'draw'>('type');
  const [sigTypeW1, setSigTypeW1] = useState<'type' | 'draw'>('type');
  const [sigTypeW2, setSigTypeW2] = useState<'type' | 'draw'>('type');
  const [sigTypeW3, setSigTypeW3] = useState<'type' | 'draw'>('type');
  
  const canvasRefA = useRef<HTMLCanvasElement | null>(null);
  const canvasRefB = useRef<HTMLCanvasElement | null>(null);
  const canvasRefW1 = useRef<HTMLCanvasElement | null>(null);
  const canvasRefW2 = useRef<HTMLCanvasElement | null>(null);
  const canvasRefW3 = useRef<HTMLCanvasElement | null>(null);
  const [drawingA, setDrawingA] = useState(false);
  const [drawingB, setDrawingB] = useState(false);
  const [drawingW1, setDrawingW1] = useState(false);
  const [drawingW2, setDrawingW2] = useState(false);
  const [drawingW3, setDrawingW3] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    agreementType: 'propertySale' as 'propertySale' | 'propertyRental' | 'vehicleSale' | 'vehicleRental' | 'brokerCommission',
    agreementTitle: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'ETB',
    paymentTerms: '',
    
    // Party A
    partyA_fullName: '',
    partyA_phone: '',
    partyA_email: '',
    partyA_nationalId: '',
    partyA_address: '',
    partyA_typedSignature: '',
    partyA_drawnSignature: '',

    // Party B
    partyB_fullName: '',
    partyB_phone: '',
    partyB_email: '',
    partyB_nationalId: '',
    partyB_address: '',
    partyB_typedSignature: '',
    partyB_drawnSignature: '',

    // Witnesses
    witness1FullName: '',
    witness1TypedSignature: '',
    witness1DrawnSignature: '',
    witness2FullName: '',
    witness2TypedSignature: '',
    witness2DrawnSignature: '',
    witness3FullName: '',
    witness3TypedSignature: '',
    witness3DrawnSignature: '',

    // Asset
    propertyId: '',
    propertyTitle: '',
    propertyCategory: 'Property' as 'Property' | 'Rental' | 'Land',
    propertyType: 'Apartment',
    propertyCity: '',
    propertyDistrict: '',
    propertyPrice: '',
    propertyTerms: '',

    vehicleId: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear().toString(),
    vehiclePlateNumber: '',
    vehiclePrice: '',
    
    commissionTerms: '',

    legalClauses: DEFAULT_LEGAL_CLAUSES_EN
  });

  // QR Code and contract number states
  const [previewId, setPreviewId] = useState<string>('');
  const [contractNumber, setContractNumber] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Generate unique ID, Contract number and QR Code automatically when preview is triggered
  useEffect(() => {
    if (preview) {
      let currentId = previewId;
      if (!currentId) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        currentId = Array.from({ length: 20 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setPreviewId(currentId);
      }

      const year = formData.date ? formData.date.split('-')[0] : new Date().getFullYear().toString();
      const partialId = currentId.slice(0, 8).toUpperCase();
      const contractNo = `AE-${year}-${partialId}`;
      setContractNumber(contractNo);

      const verificationUrl = `${window.location.origin}/verify/${currentId}?contract=${contractNo}&status=Pending%20Approval&date=${formData.date}`;
      
      QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#1e293b', // Professional deep slate
          light: '#ffffff'
        }
      })
      .then(url => {
        setQrCodeDataUrl(url);
      })
      .catch(err => {
        console.error("Failed to generate QR Code on overview page:", err);
      });
    } else {
      // Clear out on preview exit so a fresh one is built next turn
      setPreviewId('');
      setContractNumber('');
      setQrCodeDataUrl('');
    }
  }, [preview, formData.date, previewId]);

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `agreement-qr-${previewId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Set default Title when agreement type changes
  const handleTypeChange = (value: typeof formData.agreementType, langOverride?: string) => {
    let title = '';
    const currentLang = langOverride || language;
    switch(value) {
      case 'propertySale':
        title = currentLang === 'so' ? 'Heshiiska Dhabta ah ee Iibka Hantida Guryaha' : 'Deed of Absolute Sale for Real Estate Asset';
        break;
      case 'propertyRental':
        title = currentLang === 'so' ? 'Heshiiska Kireynta Degaanka & Ganacsiga ee Labada Dhinac' : 'Bilateral Residential & Commercial Tenancy Lease';
        break;
      case 'vehicleSale':
        title = currentLang === 'so' ? 'Heshiiska Iibka & Wareejinta Gaadiidka ee Labada Dhinac' : 'Bilateral Motor Vehicle Sale & Transfer Lease';
        break;
      case 'vehicleRental':
        title = currentLang === 'so' ? 'Leas-ka Kumeelgaadhka ah & Ilaalinta Gaadiidka' : 'Motor Vehicle Short-Term Lease & Care Covenant';
        break;
      case 'brokerCommission':
        title = currentLang === 'so' ? 'Heshiiska Rasmiga ah ee Dillaalnimada & Kharashka Macaamilka' : 'Official Brokerage Commission & Transaction Fee Deed';
        break;
    }
    setFormData(prev => ({
      ...prev,
      agreementType: value,
      agreementTitle: title
    }));
  };

  // Run dynamic title generator and legal clauses sync when language or type changes
  useEffect(() => {
    handleTypeChange(formData.agreementType, language);
    
    // Check and sync legal clauses
    if (language === 'so') {
      if (formData.legalClauses === DEFAULT_LEGAL_CLAUSES_EN || !formData.legalClauses) {
        setFormData(prev => ({ ...prev, legalClauses: DEFAULT_LEGAL_CLAUSES_SO }));
      }
    } else {
      if (formData.legalClauses === DEFAULT_LEGAL_CLAUSES_SO || !formData.legalClauses) {
        setFormData(prev => ({ ...prev, legalClauses: DEFAULT_LEGAL_CLAUSES_EN }));
      }
    }
  }, [language]);

  // Mouse / Touch drawing logic for Party A Signature
  const startDrawingA = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefA.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setDrawingA(true);
  };

  const drawA = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingA) return;
    const canvas = canvasRefA.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearCanvasA = () => {
    const canvas = canvasRefA.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, partyA_drawnSignature: '' }));
  };

  const saveCanvasA = () => {
    const canvas = canvasRefA.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, partyA_drawnSignature: base64 }));
  };

  // Draw logic for Party B Signature
  const startDrawingB = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefB.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setDrawingB(true);
  };

  const drawB = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingB) return;
    const canvas = canvasRefB.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearCanvasB = () => {
    const canvas = canvasRefB.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, partyB_drawnSignature: '' }));
  };

  const saveCanvasB = () => {
    const canvas = canvasRefB.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, partyB_drawnSignature: base64 }));
  };

  // Drawing logic for Witness 1 Signature
  const startDrawingW1 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefW1.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setDrawingW1(true);
  };

  const drawW1 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingW1) return;
    const canvas = canvasRefW1.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearCanvasW1 = () => {
    const canvas = canvasRefW1.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, witness1DrawnSignature: '' }));
  };

  const saveCanvasW1 = () => {
    const canvas = canvasRefW1.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, witness1DrawnSignature: base64 }));
  };

  // Drawing logic for Witness 2 Signature
  const startDrawingW2 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefW2.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setDrawingW2(true);
  };

  const drawW2 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingW2) return;
    const canvas = canvasRefW2.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearCanvasW2 = () => {
    const canvas = canvasRefW2.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, witness2DrawnSignature: '' }));
  };

  const saveCanvasW2 = () => {
    const canvas = canvasRefW2.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, witness2DrawnSignature: base64 }));
  };

  // Drawing logic for Witness 3 Signature
  const startDrawingW3 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRefW3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setDrawingW3(true);
  };

  const drawW3 = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingW3) return;
    const canvas = canvasRefW3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const clearCanvasW3 = () => {
    const canvas = canvasRefW3.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, witness3DrawnSignature: '' }));
  };

  const saveCanvasW3 = () => {
    const canvas = canvasRefW3.current;
    if (!canvas) return;
    const base64 = canvas.toDataURL('image/png');
    setFormData(prev => ({ ...prev, witness3DrawnSignature: base64 }));
  };

  // Convert current form input state into clean object fitting database schema
  const constructAgreementObject = (): Agreement => {
    const partyA = {
      fullName: formData.partyA_fullName,
      phone: formData.partyA_phone,
      email: formData.partyA_email,
      nationalId: formData.partyA_nationalId,
      address: formData.partyA_address,
      signatureUrl: sigTypeA === 'type' ? '' : (formData.partyA_drawnSignature || ''),
    };

    const partyB = {
      fullName: formData.partyB_fullName,
      phone: formData.partyB_phone,
      email: formData.partyB_email,
      nationalId: formData.partyB_nationalId,
      address: formData.partyB_address,
      signatureUrl: sigTypeB === 'type' ? '' : (formData.partyB_drawnSignature || ''),
    };

    const witness1 = {
      fullName: formData.witness1FullName || '',
      signatureUrl: sigTypeW1 === 'type' ? '' : (formData.witness1DrawnSignature || ''),
    };

    const witness2 = {
      fullName: formData.witness2FullName || '',
      signatureUrl: sigTypeW2 === 'type' ? '' : (formData.witness2DrawnSignature || ''),
    };

    const witness3 = {
      fullName: formData.witness3FullName || '',
      signatureUrl: sigTypeW3 === 'type' ? '' : (formData.witness3DrawnSignature || ''),
    };

    let assetInfo: any = {};
    if (formData.agreementType.startsWith('property')) {
      assetInfo.property = {
        propertyId: formData.propertyId,
        propertyTitle: formData.propertyTitle,
        category: formData.propertyCategory,
        type: formData.propertyType,
        city: formData.propertyCity,
        district: formData.propertyDistrict,
        price: Number(formData.propertyPrice) || 0,
        paymentTerms: formData.propertyTerms
      };
    } else if (formData.agreementType.startsWith('vehicle')) {
      assetInfo.vehicle = {
        vehicleId: formData.vehicleId,
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        year: Number(formData.vehicleYear) || new Date().getFullYear(),
        plateNumber: formData.vehiclePlateNumber,
        price: Number(formData.vehiclePrice) || 0
      };
    } else {
      assetInfo.commissionTerms = formData.commissionTerms;
    }

    return {
      agreementId: '', // populated at submit
      agreementType: formData.agreementType,
      agreementTitle: formData.agreementTitle,
      date: formData.date,
      currency: formData.currency,
      parties: { partyA, partyB },
      witness1FullName: witness1.fullName,
      witness1Signature: witness1.signatureUrl,
      witness2FullName: witness2.fullName,
      witness2Signature: witness2.signatureUrl,
      witness3FullName: witness3.fullName,
      witness3Signature: witness3.signatureUrl,
      assetInfo,
      legalClauses: formData.legalClauses,
      status: 'Pending Approval',
      submittedBy: '',
      submittedAt: '',
      createdAt: ''
    };
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    const errors: string[] = [];

    // Validations
    if (!formData.agreementTitle.trim()) errors.push(t("Agreement Title is required."));
    if (!formData.partyA_fullName.trim()) errors.push(t("Party A (Seller/Owner) Full Name is required."));
    if (!formData.partyA_phone.trim()) errors.push(t("Party A Contact Phone is required."));
    if (!formData.partyB_fullName.trim()) errors.push(t("Party B (Buyer/Tenant) Full Name is required."));
    if (!formData.partyB_phone.trim()) errors.push(t("Party B Contact Phone is required."));

    // Validate details depending on asset
    if (formData.agreementType.startsWith('property')) {
      if (!formData.propertyTitle.trim()) errors.push(t("Property Name/Title is required."));
      if (!formData.propertyCity.trim()) errors.push(t("Property City is required."));
      if (!formData.propertyPrice || Number(formData.propertyPrice) <= 0) errors.push(t("A valid property valuation price is required."));
    } else if (formData.agreementType.startsWith('vehicle')) {
      if (!formData.vehicleMake.trim() || !formData.vehicleModel.trim()) errors.push(t("Vehicle Automobile Make and Model are required."));
      if (!formData.vehiclePlateNumber.trim()) errors.push(t("Vehicle License Plate is required."));
      if (!formData.vehiclePrice || Number(formData.vehiclePrice) <= 0) errors.push(t("A valid vehicle transaction price is required."));
    } else if (formData.agreementType === 'brokerCommission') {
      if (!formData.commissionTerms.trim()) errors.push(t("Broker Details / Commission Terms cannot be blank."));
    }

    // Check signatures
    if (sigTypeA === 'type' && !formData.partyA_typedSignature.trim()) {
      errors.push(t("Party A must type in their binding signature name."));
    }
    if (sigTypeB === 'type' && !formData.partyB_typedSignature.trim()) {
      errors.push(t("Party B must type in their binding signature name."));
    }

    // Validate witnesses
    if (!formData.witness1FullName.trim()) errors.push(t("Witness 1 Full Name * is required."));
    if (sigTypeW1 === 'type' && !formData.witness1TypedSignature.trim()) {
      errors.push(t("Witness 1 must type in their binding signature name."));
    }
    if (!formData.witness2FullName.trim()) errors.push(t("Witness 2 Full Name * is required."));
    if (sigTypeW2 === 'type' && !formData.witness2TypedSignature.trim()) {
      errors.push(t("Witness 2 must type in their binding signature name."));
    }
    if (!formData.witness3FullName.trim()) errors.push(t("Witness 3 Full Name * is required."));
    if (sigTypeW3 === 'type' && !formData.witness3TypedSignature.trim()) {
      errors.push(t("Witness 3 must type in their binding signature name."));
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 350, behavior: 'smooth' });
      return;
    }

    setPreview(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleFinalSubmit = async () => {
    if (!currentUser) {
      alert("Authentication Error: You must be logged in to save an agreement.");
      return;
    }

    setLoading(true);
    try {
      const agreementData = constructAgreementObject();
      const subId = await agreementService.submitAgreement({
        ...agreementData,
        qrCode: qrCodeDataUrl,
      }, previewId);
      setSubmittedId(subId);
      setPreview(false);
    } catch (err: any) {
      console.error(err);
      alert(`Submission error: ${err.message || 'Check database validation and custom security rules rules.'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFAndShare = () => {
    try {
      const agreementObj = constructAgreementObject();
      agreementObj.agreementId = previewId || 'DRAFT-DEED-PENDING';
      agreementObj.qrCode = qrCodeDataUrl;
      const doc = generateAgreementPDF(agreementObj);
      doc.save(`${formData.agreementTitle.replace(/\s+/g, '_')}_Draft.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF document.");
    }
  };

  const printDocument = () => {
    try {
      const agreementObj = constructAgreementObject();
      agreementObj.agreementId = previewId || 'DRAFT-PRINT';
      agreementObj.qrCode = qrCodeDataUrl;
      const doc = generateAgreementPDF(agreementObj);
      window.open(doc.output('bloburl'), '_blank');
    } catch (e) {
      console.error(e);
      alert("Error initiating print system.");
    }
  };

  if (submittedId) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white px-4">
        <div className="max-w-xl mx-auto glass-card bg-emerald-950/20 border border-emerald-500/30 p-10 rounded-[2rem] text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={44} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-white">{t("Submitted Successfully")}</h1>
            <p className="text-sm text-emerald-400/80 font-mono">{t("Status: Pending Approval")}</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl text-left space-y-4">
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t("System Record Registered")}</p>
            <div>
              <span className="text-xs text-white/50 block">{t("Agreement Record ID")}</span>
              <span className="text-sm font-mono text-luxury-gold select-all font-bold">{submittedId}</span>
            </div>
            <div>
              <span className="text-xs text-white/50 block">{t("Audit Track Status")}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mt-1">
                ● {t("Pending Officer Review")}
              </span>
            </div>
          </div>

          <p className="text-sm text-white/60">
            {t("Your legal agreement documents have been logged securely. You can direct the municipal administration division or real estate desk in charge of verification to sign off using the administrator console.")}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full bg-[#C5A059] hover:bg-[#B48F48] text-black h-12 rounded-xl font-bold uppercase tracking-wider text-xs">
              {t("Go to Dashboard")}
            </Button>
            <Button variant="outline" onClick={() => { setSubmittedId(null); setPreview(false); }} className="w-full border-white/10 text-white/70 h-12 rounded-xl text-xs uppercase tracking-wider font-bold">
              {t("Draft Another Agreement")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (preview) {
    const previewObj = constructAgreementObject();
    const isProperty = formData.agreementType.startsWith('property');
    const isVehicle = formData.agreementType.startsWith('vehicle');

    // Find the current scheme label
    const activeSchemeLabel = AgreementTypes.find(a => a.value === formData.agreementType)?.label || '';

    return (
      <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setPreview(false)} 
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
            >
              <ArrowLeft size={16} /> {t("Back to Edit")}
            </button>
            <span className="text-xs font-mono text-white/40">{t("DRAFT DOCUMENT - PREVIEW STATE")}</span>
          </div>

          {/* Legal Document Style Block */}
          <div className="bg-white border-2 border-[#C5A059] p-12 rounded-[2rem] text-black space-y-8 shadow-2xl relative overflow-hidden font-serif">
            
            {/* Stamp Logo Overlay */}
            <div className="absolute top-10 right-10 flex flex-col items-end">
              <span className="font-sans font-bold text-lg text-neutral-800 tracking-wider">AMAANESTATE</span>
              <span className="font-sans text-[8px] text-neutral-400 tracking-widest block font-bold">{t("LEDGER REGISTRY DEED")}</span>
              <div className="mt-2 border-2 border-dashed border-red-500/40 text-red-500/60 font-sans text-[9px] font-bold p-1 px-2 rotate-12 rounded block uppercase">
                {t("Provisional Draft")}
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase underline text-center">
                {formData.agreementTitle || t("Bilateral Agreement Contract")}
              </h1>
              <p className="text-center font-sans text-xs text-neutral-500">
                {t("Witnessed & Logged on the secure AmaanEstate Administrative Grid on:")} <strong>{formData.date}</strong>
              </p>
            </div>

            {/* CONTRACT INFO */}
            <div className="space-y-3 font-sans text-sm">
              <h3 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1 uppercase tracking-wider text-xs font-sans">
                {t("I. Contract Category Specifications")}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600">
                <p><strong>{t("Deed Scheme Type:")}</strong> {t(activeSchemeLabel)}</p>
                <p>
                  <strong>{t("Current Valuation Total:")}</strong>{' '}
                  {isProperty ? `${formData.propertyPrice} ${formData.currency}` : isVehicle ? `${formData.vehiclePrice} ${formData.currency}` : t("As Specififed Below")}
                </p>
              </div>
            </div>

            {/* PARTIES BLOCK */}
            <div className="space-y-4 font-sans text-sm">
              <h3 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1 uppercase tracking-wider text-xs">
                {t("II. Contracting Sovereign Parties")}
              </h3>
              <div className="grid grid-cols-2 gap-8">
                {/* Party A */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-600 space-y-1">
                  <span className="font-bold text-neutral-800 block text-[10px] uppercase tracking-wider">{t("PARTY A (Grantor/Seller)")}</span>
                  <p><strong>{t("Name:")}</strong> {formData.partyA_fullName}</p>
                  <p><strong>{t("Phone:")}</strong> {formData.partyA_phone}</p>
                  <p><strong>{t("Email:")}</strong> {formData.partyA_email || 'N/A'}</p>
                  <p><strong>{t("Registry ID No:")}</strong> {formData.partyA_nationalId || 'N/A'}</p>
                  <p><strong>{t("Domicile:")}</strong> {formData.partyA_address}</p>
                </div>
                {/* Party B */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-600 space-y-1">
                  <span className="font-bold text-neutral-800 block text-[10px] uppercase tracking-wider">{t("PARTY B (Grantee/Client)")}</span>
                  <p><strong>{t("Name:")}</strong> {formData.partyB_fullName}</p>
                  <p><strong>{t("Phone:")}</strong> {formData.partyB_phone}</p>
                  <p><strong>{t("Email:")}</strong> {formData.partyB_email || 'N/A'}</p>
                  <p><strong>{t("Registry ID No:")}</strong> {formData.partyB_nationalId || 'N/A'}</p>
                  <p><strong>{t("Domicile:")}</strong> {formData.partyB_address}</p>
                </div>
              </div>
            </div>

            {/* ASSET SUBJECT */}
            <div className="space-y-3 font-sans text-sm">
              <h3 className="font-bold text-neutral-800 border-b border-neutral-200 pb-1 uppercase tracking-wider text-xs">
                {t("III. Object Asset Specifications")}
              </h3>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-xs text-neutral-600">
                {isProperty && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <p><strong>{t("Property Unique ID:")}</strong> {formData.propertyId || 'PENDING'}</p>
                    <p><strong>{t("Property Title/Lodge:")}</strong> {formData.propertyTitle}</p>
                    <p><strong>{t("Covenant Status:")}</strong> {t("Covenant Status:")} {t(formData.propertyCategory)}</p>
                    <p><strong>{t("Structure Specification:")}</strong> {t(formData.propertyType) || formData.propertyType}</p>
                    <p><strong>{t("Metropolis City:")}</strong> {formData.propertyCity}</p>
                    <p><strong>{t("District Address:")}</strong> {formData.propertyDistrict}</p>
                  </div>
                )}
                {isVehicle && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <p><strong>{t("Vehicle Tracker No:")}</strong> {formData.vehicleId || 'PENDING'}</p>
                    <p><strong>{t("Automobile Maker:")}</strong> {formData.vehicleMake}</p>
                    <p><strong>{t("Model / Specific:")}</strong> {formData.vehicleModel}</p>
                    <p><strong>{t("Manufacturing Year:")}</strong> {formData.vehicleYear}</p>
                    <p><strong>{t("Registration Plate:")}</strong> {formData.vehiclePlateNumber}</p>
                  </div>
                )}
                {formData.agreementType === 'brokerCommission' && (
                  <p className="whitespace-pre-line leading-relaxed">
                    {formData.commissionTerms}
                  </p>
                )}
              </div>
            </div>

            {/* LEGAL COVENANTS */}
            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <h3 className="font-sans font-bold text-neutral-800 border-b border-neutral-200 pb-1 uppercase tracking-wider text-xs">
                {t("IV. General Legal Covenants & Assurances")}
              </h3>
              <p className="whitespace-pre-line italic">
                {formData.legalClauses}
              </p>
            </div>

            {/* SIGNATURE RENDERING */}
            <div className="border-t border-neutral-300 pt-6 space-y-4">
              <h4 className="font-sans font-bold text-neutral-800 uppercase tracking-widest text-[9px] text-center">
                {t("V. Binding Endorsements & Proof of Intent")}
              </h4>
              <div className="grid grid-cols-2 gap-8 text-center">
                {/* Party A */}
                <div className="space-y-2">
                  <span className="font-sans text-[9px] text-neutral-400 block font-bold">{t("PARTY A SIGNATURE")}</span>
                  <div className="h-16 bg-neutral-50/50 rounded-xl border border-neutral-200 flex items-center justify-center p-2">
                    {sigTypeA === 'type' ? (
                      <span className="font-mono italic text-lg text-blue-800 tracking-wide select-none font-bold">
                        {formData.partyA_typedSignature}
                      </span>
                    ) : (
                      formData.partyA_drawnSignature ? (
                        <img src={formData.partyA_drawnSignature} className="max-h-full max-w-full object-contain filter invert opacity-90" alt="Party A signature" />
                      ) : (
                        <span className="text-[10px] text-neutral-400">{t("Blank Drawn Signature")}</span>
                      )
                    )}
                  </div>
                  <span className="font-sans text-[10px] font-bold text-neutral-700">{formData.partyA_fullName}</span>
                </div>

                {/* Party B */}
                <div className="space-y-2">
                  <span className="font-sans text-[9px] text-neutral-400 block font-bold">{t("PARTY B SIGNATURE")}</span>
                  <div className="h-16 bg-neutral-50/50 rounded-xl border border-neutral-200 flex items-center justify-center p-2">
                    {sigTypeB === 'type' ? (
                      <span className="font-mono italic text-lg text-blue-800 tracking-wide select-none font-bold">
                        {formData.partyB_typedSignature}
                      </span>
                    ) : (
                      formData.partyB_drawnSignature ? (
                        <img src={formData.partyB_drawnSignature} className="max-h-full max-w-full object-contain filter invert opacity-90" alt="Party B signature" />
                      ) : (
                        <span className="text-[10px] text-neutral-400">{t("Blank Drawn Signature")}</span>
                      )
                    )}
                  </div>
                  <span className="font-sans text-[10px] font-bold text-neutral-700">{formData.partyB_fullName}</span>
                </div>
              </div>
              {/* Witnesses */}
              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                {[1, 2, 3].map(w => (
                  <div key={w} className="space-y-2">
                    <span className="font-sans text-[9px] text-neutral-400 block font-bold">{t(`Witness ${w}: Full Name + Signature`)}</span>
                    <div className="h-12 bg-neutral-50/50 rounded-xl border border-neutral-200 flex items-center justify-center p-1">
                      {(w === 1 ? sigTypeW1 : w === 2 ? sigTypeW2 : sigTypeW3) === 'type' ? (
                        <span className="font-mono italic text-sm text-blue-800 tracking-wide select-none font-bold truncate">
                          {formData[`witness${w}TypedSignature` as keyof typeof formData]}
                        </span>
                      ) : (
                        formData[`witness${w}DrawnSignature` as keyof typeof formData] ? (
                          <img src={formData[`witness${w}DrawnSignature` as keyof typeof formData] as string} className="max-h-full max-w-full object-contain filter invert opacity-90" alt={`Witness ${w} signature`} />
                        ) : (
                          <span className="text-[8px] text-neutral-400">{t("Blank Signature")}</span>
                        )
                      )}
                    </div>
                    <span className="font-sans text-[9px] font-bold text-neutral-600 truncate block">{formData[`witness${w}FullName` as keyof typeof formData]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* VI. OFFICIAL LEDGER VERIFICATION QR CODE SECTION */}
            <div className="border-t border-neutral-300 pt-6 space-y-4 font-sans text-sm">
              <h4 className="font-sans font-bold text-neutral-800 uppercase tracking-widest text-[9px] text-center">
                {t("VI. Digital Registry Ledger Verification")}
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center justify-center relative transition-transform duration-300 hover:scale-105">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} className="w-full h-full object-contain" alt="Agreement QR Code" />
                  ) : (
                    <div className="animate-pulse w-full h-full bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-400 font-mono">
                      Generating QR...
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full bg-amber-100 border border-amber-200 text-amber-800 font-sans">
                      ● {t("Provisional Registry (Pending Approval)")}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-neutral-600 text-xs">
                    <p><strong className="text-neutral-900">{t("Deed Record ID:")}</strong> {previewId}</p>
                    <p><strong className="text-neutral-900">{t("Contract Number:")}</strong> {contractNumber}</p>
                    <p><strong className="text-neutral-900">{t("Registered Date:")}</strong> {formData.date}</p>
                    <p><strong className="text-neutral-900">{t("Verification Scheme:")}</strong> {t("AmaanEstate Secured Cryptographic Ledger")}</p>
                  </div>
                  
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={downloadQRCode}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/25 text-white font-sans text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/15 duration-200 transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      {t("Download QR Code")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* PREVIEW BOTTOM SWITCH ACTION BUTTONS */}
          <div className="glass-card bg-neutral-900/80 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <Button 
              variant="outline" 
              onClick={() => setPreview(false)} 
              className="border-white/10 text-white hover:bg-white/10 w-full sm:w-auto font-bold uppercase tracking-wider text-xs h-11 rounded-lg"
            >
              {t("Back to Edit")}
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline"
                onClick={printDocument}
                className="border-white/15 text-white/90 hover:bg-neutral-800 h-11 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                <Printer size={14} className="mr-2" /> {t("Print")}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={downloadPDFAndShare}
                className="border-white/15 text-white/90 hover:bg-neutral-800 h-11 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                <Download size={14} className="mr-2" /> {t("Download PDF")}
              </Button>
              
              <Button 
                onClick={handleFinalSubmit} 
                disabled={loading} 
                className="bg-[#C5A059] hover:bg-[#B48F48] text-black h-11 rounded-lg text-xs font-bold uppercase tracking-wider px-6"
              >
                {loading ? <Loader2 className="animate-spin" /> : t("Submit for Approval")}
              </Button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxury-black text-white px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HERO */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight">
            {t("Agreement Registry & Legal Documentation")}
          </h1>
          <p className="text-sm md:text-base text-white/60 max-w-2xl mx-auto font-sans leading-relaxed">
            {t("Create, preview, print, and submit secure legal agreements for verification on AmaanEstate.")}
          </p>
        </div>

        {/* STEP 1: DROPDOWN SELECT DIRECTLY ON TOP */}
        <div className="glass-card bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 shadow-xl">
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest block">{t("STEP 1 - Selecting Agreement Scheme")}</span>
          <div className="space-y-1">
            <label className="text-sm font-sans block text-white/80 font-medium">{t("Select Agreement Type")}</label>
            <select 
              value={formData.agreementType} 
              onChange={e => handleTypeChange(e.target.value as any)}
              className="bg-neutral-900 border border-white/10 rounded-xl h-12 px-4 w-full text-white/95 text-sm focus:outline-none focus:border-[#C5A059] transition-all"
            >
              {AgreementTypes.map(tOption => (
                <option key={tOption.value} value={tOption.value}>{t(tOption.label)}</option>
              ))}
            </select>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-red-400 block uppercase tracking-widest">{t("Verification Constraints Required:")}</span>
            <ul className="list-disc list-inside text-xs text-red-200 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* STEP 2: DYNAMIC COMPREHENSIVE FORM */}
        <form onSubmit={handlePreview} className="glass-card bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-10 shadow-2xl relative">
          
          {/* SECTION A: AGREEMENT DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">B</span>
              <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Agreement Covenant Details")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Agreement Title *")}</span>
                <Input 
                  required 
                  value={formData.agreementTitle} 
                  onChange={e => setFormData({ ...formData, agreementTitle: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Deed Transaction Date *")}</span>
                <Input 
                  required 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Currency Unit *")}</span>
                <select 
                  value={formData.currency} 
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="bg-neutral-900/60 border border-white/5 rounded-lg h-11 px-4 w-full text-white text-sm"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Default Asset Price Type *")}</span>
                <Input 
                  disabled
                  value={formData.agreementType === 'brokerCommission' ? (language === 'so' ? 'Qiimaha Dillaalka ee hoos ku qoran' : 'Broker Rate Specified Below') : (language === 'so' ? 'Kala-guurka Qaybta D' : 'Dynamic from Section D')} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white/50 cursor-not-allowed text-xs" 
                />
              </div>
            </div>
          </div>

          {/* SECTION B: PARTY A (Seller / Owner) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">B</span>
              <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Party A (Grantor / Owner)")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Full Legal Name *")}</span>
                <Input 
                  required 
                  placeholder={t("e.g. Abdirahman Yusuf")} 
                  value={formData.partyA_fullName} 
                  onChange={e => setFormData({ ...formData, partyA_fullName: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Contact Phone *")}</span>
                <Input 
                  required 
                  placeholder={t("e.g. +252 61 5XXXXXX")} 
                  value={formData.partyA_phone} 
                  onChange={e => setFormData({ ...formData, partyA_phone: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Email Address")}</span>
                <Input 
                  type="email" 
                  placeholder={t("e.g. partyA@example.com")} 
                  value={formData.partyA_email} 
                  onChange={e => setFormData({ ...formData, partyA_email: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("National ID Card Number")}</span>
                <Input 
                  placeholder={t("e.g. NID-842719")} 
                  value={formData.partyA_nationalId} 
                  onChange={e => setFormData({ ...formData, partyA_nationalId: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>
            </div>

            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <span className="text-[10px] uppercase font-bold text-white/40">{t("Domicile / Address *")}</span>
              <Input 
                required 
                placeholder={t("e.g. Mogadishu Airport Zone, Wadajir, Somalia")} 
                value={formData.partyA_address} 
                onChange={e => setFormData({ ...formData, partyA_address: e.target.value })} 
                className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
              />
            </div>

            {/* Party A Signature Element */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">{t("Party A Binding Endorsement Signature")}</span>
                <div className="flex bg-neutral-950/60 p-1 rounded-lg text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => setSigTypeA('type')} 
                    className={`px-3 py-1 rounded-md transition-colors ${sigTypeA === 'type' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                  >
                    {t("Type Signature")}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSigTypeA('draw')} 
                    className={`px-3 py-1 rounded-md transition-colors ${sigTypeA === 'draw' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                  >
                    {t("Draw Signature")}
                  </button>
                </div>
              </div>

              {sigTypeA === 'type' ? (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-white/30">{t("Type Full Name for Digital Script *")}</span>
                  <Input 
                    placeholder={t("Type name here (e.g. Abdirahman Yusuf)")} 
                    value={formData.partyA_typedSignature}
                    onChange={e => setFormData({ ...formData, partyA_typedSignature: e.target.value })}
                    className="bg-white/5 h-11 text-white placeholder:text-neutral-600"
                  />
                  {formData.partyA_typedSignature && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] block text-white/30 tracking-widest uppercase mb-1">{t("Cursive Representation")}</span>
                      <span className="font-mono italic text-2xl text-luxury-gold select-none tracking-wider font-bold">
                        {formData.partyA_typedSignature}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-white/30">{t("Draw inside the dark pad below")}</span>
                  <div className="bg-neutral-950 border border-white/10 rounded-xl relative overflow-hidden h-32 flex items-center justify-center">
                    <canvas 
                      ref={canvasRefA}
                      width={400}
                      height={128}
                      onMouseDown={startDrawingA}
                      onMouseMove={drawA}
                      onMouseUp={() => { setDrawingA(false); saveCanvasA(); }}
                      onMouseLeave={() => { setDrawingA(false); }}
                      onTouchStart={startDrawingA}
                      onTouchMove={drawA}
                      onTouchEnd={() => { setDrawingA(false); saveCanvasA(); }}
                      className="w-full h-full cursor-crosshair touch-none"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        type="button" 
                        onClick={clearCanvasA} 
                        className="p-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-[9px] font-bold hover:bg-red-500/20 transition-all uppercase"
                      >
                        {t("Reset Canvas")}
                      </button>
                    </div>
                  </div>
                  {formData.partyA_drawnSignature && (
                    <span className="text-[9px] text-[#C5A059] font-mono block">✔ {t("Vectored path captured. Ready to bind.")}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION C: PARTY B (Buyer / Tenant) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">C</span>
              <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Party B (Grantee / Client)")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Full Legal Name *")}</span>
                <Input 
                  required 
                  placeholder={t("e.g. Halima Ahmed")} 
                  value={formData.partyB_fullName} 
                  onChange={e => setFormData({ ...formData, partyB_fullName: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Contact Phone *")}</span>
                <Input 
                  required 
                  placeholder={t("e.g. +252 61 7XXXXXX")} 
                  value={formData.partyB_phone} 
                  onChange={e => setFormData({ ...formData, partyB_phone: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("Email Address")}</span>
                <Input 
                  type="email" 
                  placeholder={t("e.g. partyB@example.com")} 
                  value={formData.partyB_email} 
                  onChange={e => setFormData({ ...formData, partyB_email: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40">{t("National ID Card Number")}</span>
                <Input 
                  placeholder={t("e.g. NID-108259")} 
                  value={formData.partyB_nationalId} 
                  onChange={e => setFormData({ ...formData, partyB_nationalId: e.target.value })} 
                  className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                />
              </div>
            </div>

            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <span className="text-[10px] uppercase font-bold text-white/40">{t("Domicile / Address *")}</span>
              <Input 
                required 
                placeholder={t("e.g. Hodan District, Mogadishu, Somalia")} 
                value={formData.partyB_address} 
                onChange={e => setFormData({ ...formData, partyB_address: e.target.value })} 
                className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
              />
            </div>

            {/* Party B Signature Element */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">{t("Party B Binding Endorsement Signature")}</span>
                <div className="flex bg-neutral-950/60 p-1 rounded-lg text-[10px] font-bold">
                  <button 
                    type="button" 
                    onClick={() => setSigTypeB('type')} 
                    className={`px-3 py-1 rounded-md transition-colors ${sigTypeB === 'type' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                  >
                    {t("Type Signature")}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSigTypeB('draw')} 
                    className={`px-3 py-1 rounded-md transition-colors ${sigTypeB === 'draw' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                  >
                    {t("Draw Signature")}
                  </button>
                </div>
              </div>

              {sigTypeB === 'type' ? (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-white/30">{t("Type Full Name for Digital Script *")}</span>
                  <Input 
                    placeholder={t("Type name here (e.g. Halima Ahmed)")} 
                    value={formData.partyB_typedSignature}
                    onChange={e => setFormData({ ...formData, partyB_typedSignature: e.target.value })}
                    className="bg-white/5 h-11 text-white placeholder:text-neutral-600"
                  />
                  {formData.partyB_typedSignature && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <span className="text-[10px] block text-white/30 tracking-widest uppercase mb-1">{t("Cursive Representation")}</span>
                      <span className="font-mono italic text-2xl text-luxury-gold select-none tracking-wider font-bold">
                        {formData.partyB_typedSignature}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-white/30">{t("Draw inside the dark pad below")}</span>
                  <div className="bg-neutral-950 border border-white/10 rounded-xl relative overflow-hidden h-32 flex items-center justify-center">
                    <canvas 
                      ref={canvasRefB}
                      width={400}
                      height={128}
                      onMouseDown={startDrawingB}
                      onMouseMove={drawB}
                      onMouseUp={() => { setDrawingB(false); saveCanvasB(); }}
                      onMouseLeave={() => { setDrawingB(false); }}
                      onTouchStart={startDrawingB}
                      onTouchMove={drawB}
                      onTouchEnd={() => { setDrawingB(false); saveCanvasB(); }}
                      className="w-full h-full cursor-crosshair touch-none"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button 
                        type="button" 
                        onClick={clearCanvasB} 
                        className="p-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-[9px] font-bold hover:bg-red-500/20 transition-all uppercase"
                      >
                        {t("Reset Canvas")}
                      </button>
                    </div>
                  </div>
                  {formData.partyB_drawnSignature && (
                    <span className="text-[9px] text-[#C5A059] font-mono block">✔ {t("Vectored path captured. Ready to bind.")}</span>
                  )}
                </div>
              )}
            </div>
            {/* WITNESS VERIFICATION SECTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">W</span>
                <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Witness Verification Section")}</h3>
              </div>

              {[1, 2, 3].map((w) => (
                <div key={w} className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70">{t(`Witness ${w}`)}</span>
                    <div className="flex bg-neutral-950/60 p-1 rounded-lg text-[10px] font-bold">
                      <button 
                        type="button" 
                        onClick={() => w === 1 ? setSigTypeW1('type') : w === 2 ? setSigTypeW2('type') : setSigTypeW3('type')}
                        className={`px-3 py-1 rounded-md transition-colors ${(w===1 ? sigTypeW1 : w===2 ? sigTypeW2 : sigTypeW3) === 'type' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                      >
                        {t("Type Signature")}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => w === 1 ? setSigTypeW1('draw') : w === 2 ? setSigTypeW2('draw') : setSigTypeW3('draw')}
                        className={`px-3 py-1 rounded-md transition-colors ${(w===1 ? sigTypeW1 : w===2 ? sigTypeW2 : sigTypeW3) === 'draw' ? 'bg-[#C5A059] text-black' : 'text-white/60'}`}
                      >
                        {t("Draw Signature")}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t(`Witness ${w} Full Name *`)}</span>
                    <Input 
                      required 
                      placeholder={t(`Type Witness ${w} Full Name *`)} 
                      value={formData[`witness${w}FullName` as keyof typeof formData]} 
                      onChange={e => setFormData({ ...formData, [`witness${w}FullName`]: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 rounded-lg text-white" 
                    />
                  </div>

                  {(w === 1 ? sigTypeW1 : w === 2 ? sigTypeW2 : sigTypeW3) === 'type' ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-white/30">{t("Type Full Name for Digital Script *")}</span>
                      <Input 
                        placeholder={t("Type name here")} 
                        value={formData[`witness${w}TypedSignature` as keyof typeof formData]}
                        onChange={e => setFormData({ ...formData, [`witness${w}TypedSignature`]: e.target.value })}
                        className="bg-white/5 h-11 text-white placeholder:text-neutral-600"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-white/30">{t("Draw inside the dark pad below")}</span>
                      <div className="bg-neutral-950 border border-white/10 rounded-xl relative overflow-hidden h-32 flex items-center justify-center">
                        <canvas 
                          ref={w === 1 ? canvasRefW1 : w === 2 ? canvasRefW2 : canvasRefW3}
                          width={400}
                          height={128}
                          onMouseDown={w === 1 ? startDrawingW1 : w === 2 ? startDrawingW2 : startDrawingW3}
                          onMouseMove={w === 1 ? drawW1 : w === 2 ? drawW2 : drawW3}
                          onMouseUp={w === 1 ? () => { setDrawingW1(false); saveCanvasW1(); } : w === 2 ? () => { setDrawingW2(false); saveCanvasW2(); } : () => { setDrawingW3(false); saveCanvasW3(); }}
                          onMouseLeave={w === 1 ? () => { setDrawingW1(false); } : w === 2 ? () => { setDrawingW2(false); } : () => { setDrawingW3(false); }}
                          onTouchStart={w === 1 ? startDrawingW1 : w === 2 ? startDrawingW2 : startDrawingW3}
                          onTouchMove={w === 1 ? drawW1 : w === 2 ? drawW2 : drawW3}
                          onTouchEnd={w === 1 ? () => { setDrawingW1(false); saveCanvasW1(); } : w === 2 ? () => { setDrawingW2(false); saveCanvasW2(); } : () => { setDrawingW3(false); saveCanvasW3(); }}
                          className="w-full h-full cursor-crosshair touch-none"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button 
                            type="button" 
                            onClick={w === 1 ? clearCanvasW1 : w === 2 ? clearCanvasW2 : clearCanvasW3} 
                            className="p-1 px-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-[9px] font-bold hover:bg-red-500/20 transition-all uppercase"
                          >
                            {t("Reset Canvas")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

                    {/* SECTION D: ASSET DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">D</span>
              <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Section D: Subject Asset Specifications")}</h3>
            </div>

            {/* If Property agreement chosen */}
            {formData.agreementType.startsWith('property') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Property Code / Identifier")}</span>
                    <Input 
                      placeholder={t("e.g. AP-94021")} 
                      value={formData.propertyId} 
                      onChange={e => setFormData({ ...formData, propertyId: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Property Name / Core Title *")}</span>
                    <Input 
                      required
                      placeholder={t("e.g. Luxury Penthouse Suite B-2")} 
                      value={formData.propertyTitle} 
                      onChange={e => setFormData({ ...formData, propertyTitle: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Category Range")}</span>
                    <select 
                      value={formData.propertyCategory} 
                      onChange={e => setFormData({ ...formData, propertyCategory: e.target.value as any })}
                      className="bg-neutral-900 border border-white/5 rounded-lg h-11 px-4 w-full text-white text-xs"
                    >
                      <option value="Property">{t("Commercial / Residential Property")}</option>
                      <option value="Rental">{t("Leased Tenancy Unit")}</option>
                      <option value="Land">{t("Secured Plot Land Area")}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Structure Form (Apartment, Land Plot, etc)")}</span>
                    <Input 
                      placeholder={t("e.g. Duplex Villa")} 
                      value={formData.propertyType} 
                      onChange={e => setFormData({ ...formData, propertyType: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Metropolis City *")}</span>
                    <Input 
                      required
                      placeholder={t("e.g. Mogadishu")} 
                      value={formData.propertyCity} 
                      onChange={e => setFormData({ ...formData, propertyCity: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Administrative District")}</span>
                    <Input 
                      placeholder={t("e.g. Hodan")} 
                      value={formData.propertyDistrict} 
                      onChange={e => setFormData({ ...formData, propertyDistrict: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Exchange Valuation Price")} ({formData.currency}) *</span>
                    <Input 
                      required
                      type="number" 
                      placeholder={t("e.g. 185000")} 
                      value={formData.propertyPrice} 
                      onChange={e => setFormData({ ...formData, propertyPrice: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Payment Instalments / Terms Description")}</span>
                    <Input 
                      placeholder={t("e.g. 30% Down, 70% Bank Escrow Transfer")} 
                      value={formData.propertyTerms} 
                      onChange={e => setFormData({ ...formData, propertyTerms: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Vehicle agreement chosen */}
            {formData.agreementType.startsWith('vehicle') && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Vehicle ID / Chassis Ref")}</span>
                    <Input 
                      placeholder={t("e.g. CHASSIS-N028741")} 
                      value={formData.vehicleId} 
                      onChange={e => setFormData({ ...formData, vehicleId: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Automobile Manufacturer (Make) *")}</span>
                    <Input 
                      required
                      placeholder={t("e.g. Toyota")} 
                      value={formData.vehicleMake} 
                      onChange={e => setFormData({ ...formData, vehicleMake: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Model Name *")}</span>
                    <Input 
                      required
                      placeholder={t("e.g. Land Cruiser")} 
                      value={formData.vehicleModel} 
                      onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Production Year")}</span>
                    <Input 
                      type="number" 
                      placeholder={t("e.g. 2024")} 
                      value={formData.vehicleYear} 
                      onChange={e => setFormData({ ...formData, vehicleYear: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/40">{t("Official License Plate *")}</span>
                    <Input 
                      required
                      placeholder={t("e.g. JUBALAND-840")} 
                      value={formData.vehiclePlateNumber} 
                      onChange={e => setFormData({ ...formData, vehiclePlateNumber: e.target.value })} 
                      className="bg-white/5 border-white/5 h-11 text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-white/40">{t("Agreed Car Valuation Price")} ({formData.currency}) *</span>
                  <Input 
                    required
                    type="number" 
                    placeholder={t("e.g. 52000")} 
                    value={formData.vehiclePrice} 
                    onChange={e => setFormData({ ...formData, vehiclePrice: e.target.value })} 
                    className="bg-white/5 border-white/5 h-11 text-white" 
                  />
                </div>
              </div>
            )}

            {/* Broker Commission agreement selected */}
            {formData.agreementType === 'brokerCommission' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#C5A059]">{t("Broker Commission Terms & Compensations *")}</span>
                  <Textarea 
                    required 
                    placeholder={t("Provide description of broker duties, affiliated real estate listings, payment percentages, and conditional terms...")} 
                    value={formData.commissionTerms} 
                    onChange={e => setFormData({ ...formData, commissionTerms: e.target.value })} 
                    className="bg-white/5 border-white/5 h-32 rounded-lg text-white" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: LEGAL CLAUSES */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-2">
              <span className="px-2.5 py-1 bg-luxury-gold/10 text-[#C5A059] text-[10px] font-bold rounded-lg font-mono">E</span>
              <h3 className="text-sm uppercase font-bold tracking-widest text-[#C5A059]">{t("Section E: Covenant Legal Clauses")}</h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-white/40">{t("Covenant Stipulations *")}</span>
              <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                {t("Review and alter standard legal protections directly inside the document. Ensure exact payment deadlines and breach guidelines are specified according to local commerce bylaws.")}
              </p>
              <Textarea 
                required 
                value={formData.legalClauses} 
                onChange={e => setFormData({ ...formData, legalClauses: e.target.value })} 
                className="bg-white/5 border-white/5 min-h-[12rem] rounded-xl text-xs font-mono text-white/90 leading-relaxed" 
              />
            </div>
          </div>

          {/* BUTTONS AT BOTTOM RIGHT OF FORM */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-white/5 pt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="border-white/10 text-white hover:bg-white/10 w-full sm:w-auto font-bold uppercase tracking-wider text-xs h-12 rounded-xl"
            >
              {t("Cancel")}
            </Button>
            <Button 
              type="submit" 
              className="bg-[#C5A059] hover:bg-[#B48F48] text-black w-full sm:w-auto font-bold uppercase tracking-wider text-xs h-12 rounded-xl px-8 shadow-lg transition-transform"
            >
              {t("Preview Agreement")} <ArrowRight size={14} className="ml-2 inline-block" />
            </Button>
          </div>  </div>

        </form>
      </div>
    </div>
  );
}
