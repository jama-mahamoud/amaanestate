import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Users, 
  UserPlus, 
  Award, 
  Rocket, 
  Briefcase, 
  HelpCircle, 
  MapPin, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Cpu, 
  Compass, 
  Globe, 
  TrendingUp, 
  Send,
  MessageSquare,
  FileCheck,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';

// Bilingual Somali-by-default translation system
const T = {
  so: {
    badge: 'Isku-xirka Hantida Gobolka',
    heroTitle_1: 'Ku Soo Dhowow',
    heroTitle_2: 'Shabakadda AmaanEstate',
    heroSub: 'Waxaan dhisaynaa shabakaddii ugu horreysay ee dhijitaal ah oo isku xirta milkiilayaasha dhulka iyo guryaha, shirkadaha hantida ma guurtada ah, dallaaliinta, injineerada, maalgashadayaasha, ganacsiyada, iyo dhalinyarada aqoonyahanka ah ee ku nool Soomaaliya, Somaliland, iyo Deegaanka Soomaalida.',
    btnJoin: 'Ku Biir Shabakadda',
    btnAgent: 'Noqo Wakiil',
    btnShare: 'Soo Gudbi Fikradaada',
    
    whyExist: 'Waa Maxay Sababta Aan U Jirno?',
    securingAssets: 'Ilaalinta Hantida Gobolka',
    whyDesc1: 'Muddo dheer, wax kala iibsiga hantida ee gudaha dalka wuxuu ku dhisnaa kalsooni afka ah oo keliya. Si kastaba ha ahaatee, kobaca degdegga ah ee hadda jira wuxuu muujiyay daldaloolo dhanka nidaamka ah oo khatar ku ah badbaadada hantida iyo hufnaanta.',
    whyDesc2: 'AmaanEstate waxaa loo dhisay in lagu xalliyo dhibaatooyinkaas iyadoo la adeegsanayo tignoolajiyada, hufnaanta, nidaamyada hubinta, heshiisyada dhijitaalka ah, iyo maamulka casriga ah ee hantida.',
    challengesTitle: 'Caqabadaha Jira ee aan Xallineyno',

    whoTitle: 'Yaa Ku Biiri Kara AmaanEstate?',
    whoSub: 'Shabakadeenu waa goob mideysan oo u furan dhammaan qaybaha kala duwan ee bulshada iyo dhaqaalaha.',
    
    oppsTitle: 'Fursadaha Shaqo ee Gudaha Shabakadda',
    oppsSub: 'Fursado iyo jagooyin rasmi ah oo loogu talagalay aqoonyahannada raba inay hoggaamiyaan horumarka hantida ee dalka.',
    reqApp: 'Codso Fursaddan',

    youthLabel: 'U Diyaarinta Jiilka Cusub ee Hogaanka',
    youthTitle: 'Kobcinta iyo Fursadaha Dhalinyarada',
    youthDesc: 'Waxaan rumeysanahay in dhalinyaradu ay tahay inay door hormuud ah ka qaataan casriyeynta hantida ma guurtada ah iyo ganacsiga dalka. AmaanEstate ma aha oo keliya suuq guryaha lagu iibiyo, laakiin waa goob lagu dhiso hoggaanka, xirfadaha tignoolajiyada, iyo tababarka dallaalnimada dhijitaalka ah.',
    statTrainees: '400+ Dhalinyaro',
    statTraineesDesc: 'Oo lagu tababaray nidaamka guryaha ee Somaliland, Soomaaliya iyo Deegaanka Soomaalida',
    statInterns: '200+ Interns',
    statInternsDesc: 'Kuwaas oo loo aqoonsaday inay yihiin kormeerayaal iyo caawiyayaal dhijitaal ah',

    roadTitle: 'Heerarka Horumarka Shaqada',
    roadSub: 'Eeg sida aad uga bilaabi karto xubin caadi ah ilaa aad ka noqoto wada-hawlgal rasmi ah oo weyn oo gobolka ka mid ah.',

    ideasLabel: 'Fikradaha Bulshada & Hal-abuurka',
    ideasTitle: 'Fikradaada Waa Mid Muhiim Ah. Shabakadda nala dhis.',
    ideasDesc: 'AmaanEstate waxaa loo dhisay bulshada. Waxaan mar walba soo dhoweyneynaa iskaashiga ganacsi, fikradaha ku saabsan nidaamka, iyo hindisayaasha casriga ah. Aan si wada jir ah u dhisno nidaam sugan oona hufan.',
    protectTitle: 'Ilaalinta Hal-abuurkaaga',
    protectDesc: 'Mawduucyada iskaashi ama dodo dhalinyaro ee la soo gudbiyo waxaa si gaar ah u baaraya Guddiga Fulinta ee AmaanEstate adigoo xogtaada ammaan tahay.',
    formHeader: 'Ku Gudbi Fikradda halkan',
    formSub: 'La wadaag guddiga fulinta ee AmaanEstate talooyin, focuses, ama hindise iskaashi oo aad rabto in la hirgeliyo.',
    labelTitle: 'Mawduuca Fikradda',
    placeTitle: 'tusaale. Isku-xirka lacagaha qurbajoogta ee dhijitaalka ah',
    labelCategory: 'Nooca Fikradda',
    labelContent: 'Sharaxaad Faahfaahsan oo ku saabsan Fikraddaada',
    placeContent: 'Fadlan halkan ku qor faahfaahinta dhibka aad rabto in la xalliyo iyo qaabka aad u haysato...',
    btnSubmit: 'Dir Fikradda',
    btnSubmitting: 'Fikraddaada Ayaa La Dirayaa...',
    successTitle: 'Fikraddaada Waa La Keydiyay!',
    successSub: 'Waad ku mahadsantahay qayb qaadashaada! Fikraddaada waxaa la mariyay nidaam sugan waxaana dib u eegis ku sameyn doona Guddiga Fulinta ee AmaanEstate.',
    btnAnother: 'Gudbi Fikrad Kale',

    impactLabel: 'Waxqabadka iyo Adeegyada aan Bixinno',
    impactTitle: 'Waxqabadka iyo Muhiimada Shabakadda',

    testimonialsLabel: 'Kalsoonida iyo Horumarka',
    testimonialsTitle: 'Wada Jir Ayaan Mustaqbalka U Dhisaynaa',
    testimonialsSub: 'Akhriso fikradaha iyo warbixinnada ay nala wadaageen xubnaha firfircoon ee shabakaddeenna.',

    ctaTitle: 'Ma Diyaar U Tahay Mustaqbalka?',
    ctaDesc: 'AmaanEstate waa dhaqdhaqaaq bulsho oo u taagan dhisidda kalsooni, hufnaan, shaqo-abuur iyo horumarinta hantida gobolka oo dhan.',
    btnExplore: 'Eeg Fursadaha',

    modalRequiredTitle: 'Maamulka Aqoonsiga',
    modalRequiredSubtitle: 'Fadlan ku soo biir ama soo gal nidaamka si aad u isticmaasho adeegyada la xaqiijiyay.',
  },
  en: {
    badge: 'Unifying Regional Asset Ledger',
    heroTitle_1: 'Welcome to',
    heroTitle_2: 'AmaanEstate Network',
    heroSub: 'We are building the first digital ecosystem connecting property owners, real estate companies, brokers, engineers, investors, businesses, and young professionals across Somalia, Somaliland, and the Somali Region.',
    btnJoin: 'Join The Network',
    btnAgent: 'Become An Agent',
    btnShare: 'Share Your Ideas',
    
    whyExist: 'Why We Exist?',
    securingAssets: 'Securing Regional Assets',
    whyDesc1: 'For decades, local transactions within the property and asset fields flourished on spoken trust. However, rapid growth highlights structural gaps that threaten integrity.',
    whyDesc2: 'AmaanEstate was created to solve these critical regional failures—bridging digital verification systems, authentic listings, and strict legal agreements.',
    challengesTitle: 'Critical Ecosystem Challenges',

    whoTitle: 'Who Can Join AmaanEstate?',
    whoSub: 'Our platform acts as a unified digital meeting-point built for all sectors of the modern economy.',
    
    oppsTitle: 'Opportunities Within The Network',
    oppsSub: 'Accredited roles and opportunities designed for professionals ready to lead regional development.',
    reqApp: 'Request Application',

    youthLabel: 'Building Somalias Future Leaders',
    youthTitle: 'Youth Empowerment & PropTech',
    youthDesc: 'We passionately believe young minds must lead the modernization of the property sector. AmaanEstate is more than a marketplace: we build leadership, technical skill pathways, and certified digital broker internships.',
    statTrainees: '400+ Youth',
    statTraineesDesc: 'Ecosystem trainees across Somaliland & Somalia',
    statInterns: '200+ Interns',
    statInternsDesc: 'Accredited digital land recorders & consultants',

    roadTitle: 'Our Elite Career Progression',
    roadSub: 'Watch your career transition from an aspiring member to an influential regional partner.',

    ideasLabel: 'Community Lab',
    ideasTitle: 'Your Ideas Matter. Shape the Ecosystem.',
    ideasDesc: 'AmaanEstate belongs to the community. We actively welcome business collaborations, local integrations, portal feedback, and smart tech proposals. Let\'s engineer the future of property transaction integrity together.',
    protectTitle: 'Zero-Plagiarism Protection',
    protectDesc: 'Submitted partnership suggestions or tech codes undergo confidential screening directly by AmaanExecutive division.',
    formHeader: 'Innovation Board',
    formSub: 'Submit your partnership ideas, system feature recommendations, or developer proposals.',
    labelTitle: 'Focus Concept Title',
    placeTitle: 'e.g. Multi-currency secure payment integration',
    labelCategory: 'Idea Category',
    labelContent: 'Concept pitch & Detailed proposal',
    placeContent: 'Please delineate your suggested approach, its business viability, and expected value...',
    btnSubmit: 'Submit Idea',
    btnSubmitting: 'Transmitting Concept...',
    successTitle: 'Idea Trajectory Registered',
    successSub: 'Thank you for shaping our digital marketplace! Your concept has been secure-logged and queued for review by the AmaanEstate Executive Board.',
    btnAnother: 'Submit Another Suggestion',

    impactLabel: 'Our Operational Volume',
    impactTitle: 'Ecosystem Metrics & Impact',

    testimonialsLabel: 'Ecosystem Praise',
    testimonialsTitle: 'Together We Build The Future',
    testimonialsSub: 'Read perspectives and reports straight from certified active members of our localized groups.',

    ctaTitle: 'Ready To Join The Future?',
    ctaDesc: 'AmaanEstate is more than a marketplace. It is a movement dedicated to building trust, transparency, opportunity, and innovation across the property sector.',
    btnExplore: 'Explore Opportunities',

    modalRequiredTitle: 'Authentication Required',
    modalRequiredSubtitle: 'Please log in or register your account to access verified platform features.',
  }
};

const CHALLENGES = {
  so: [
    { label: 'Kalsooni darro', desc: 'Overcoming fear in peer-to-peer exchanges.' },
    { label: 'Xayeysiisyo been abuur ah', desc: 'Removing phantom advertisements and duplicate posts.' },
    { label: 'Laba jeer iibinta hantida', desc: 'Shielding buyers with blockchain-strength identification.' },
    { label: 'Diiwaangelin liidata', desc: 'Digitizing traditional title deeds on secured ledgers.' },
    { label: 'Dallaaliin aan la aqoonsan', desc: 'Providing accredited certification for trusted professionals.' },
    { label: 'Fursadaha dhalinyarada oo xaddidan', desc: 'Fostering tech-first real estate leadership channels.' }
  ],
  en: [
    { label: 'Lack of trust', desc: 'Overcoming fear in peer-to-peer exchanges.' },
    { label: 'Fake listings', desc: 'Removing phantom advertisements and duplicate posts.' },
    { label: 'Double selling', desc: 'Shielding buyers with blockchain-strength identification.' },
    { label: 'Poor record keeping', desc: 'Digitizing traditional title deeds on secured ledgers.' },
    { label: 'Unverified brokers', desc: 'Providing accredited certification for trusted professionals.' },
    { label: 'Limited opportunities for youth', desc: 'Fostering tech-first real estate leadership channels.' }
  ]
};

const JOIN_GROUPS = {
  so: [
    { title: '🏠 Milkiilayaasha Hantida', desc: 'Sug badbaadada hantidaada, xaqiiji lahaanshiyaha rasmiga ah si aad uga hortagto wax isdaba marin, uguna soo bandhig hantidaada si kalsooni leh.' },
    { title: '🤝 Wakiilada & Dallaaliinta', desc: 'Hel hanti rasmi ah oo la xaqiijiyay, isticmaal nidaamka qoraalka heshiisyada rasmiga ah, oo dhis profile leh kalsooni heer sare ah.' },
    { title: '🏗 Injineerada & Naqshadeeyayaasha', desc: 'U soo bandhig bulshada adeegyo rasmi ah oo ku saabsan hubinta dhulka/guryaha, cabbirka sharciga ah, iyo talobixinta naqshadaynta guryaha.' },
    { title: '🏢 Shirkadaha Guryaha & Dhulka', desc: 'Hel dashboard casri ah oo aad ku maamusho shaqadaada, suuq-geyn digital ah, iyo nidaam ammaan ah oo lagu kala iibsado hantida.' },
    { title: '💰 Maalgashadayaasha', desc: 'Hel fursado maalgashi oo horey loo xaqiijiyay, mashaariic waaweyn oo faa\'iido leh, iyo xog dhammaystiran ee suuqa gobolka.' },
    { title: '🌍 Qurbajoogta', desc: 'Ku maalgasho dalka adiga oo aan ka baqayn khasaare ama khiyaano. Xaqiiji dhulka, baabuurta ama guryaha adigoo isticmaalaya heshiisyo sharci ah oo sugan.' },
    { title: '💼 Shaqo-doonka', desc: 'Si toos ah ula xiriir shirkadaha ugu waaweyn ee dhisa guryaha, wakaaladaha guryaha dalka dhexdiisa, iyo shirkadaha naqshadaynta.' },
    { title: '📢 Suuq-geeyayaasha & Hal-abuurayaasha', desc: 'Samee muuqaalo tayo sare leh ee guryaha la iibinayo, ku caawi suuq-geynta dhijitaalka ah, oo hel dakhli fiican.' }
  ],
  en: [
    { title: '🏠 Property Owners', desc: 'Secure your wealth, verify ownership, prevent fraud, and list properties with absolute confidence.' },
    { title: '🤝 Agents & Brokers', desc: 'Access verified exclusive mandates, professional contract engines, and build verified reputation profiles.' },
    { title: '🏗 Engineers & Architects', desc: 'Offer professional site inspection, verification, legal survey, and design consulting options.' },
    { title: '🏢 Real Estate Companies', desc: 'Access enterprise dashboard tools, digital marketing, verified pipelines, and secure transactional frameworks.' },
    { title: '💰 Investors', desc: 'Unlock premium pre-vetted opportunities, high-value developments, and detailed regional statistics.' },
    { title: '🌍 Diaspora Communities', desc: 'Remotely invest without proxy risks. Verify land, vehicles, or properties with legally robust agreements.' },
    { title: '💼 Job Seekers', desc: 'Connect directly with industry-leading developers, brokerage agencies, and design firms.' },
    { title: '📢 Marketers & Media Creators', desc: 'Produce elite property visual tours, run localized digital lead ads, and gain high commission cuts.' }
  ]
};

const OPPORTUNITIES = {
  so: [
    { role: 'Wakiilada Guryaha', scope: 'Maamul guryaha iyo dhulka rasmiga ah ee shirkadaha, fududeey iibka iyo kiraynta, kana faa\'iideyso dakhliyo iyo dhiirigelin dhismeed.', tag: 'Shaqo Firfircoon' },
    { role: 'Wakiilka Gobolka', scope: 'Hoggaami istiraatiijiyadda kobaca ganacsiga, iskaashiga muhiimka ah, iyo dhammaan hawlaha shaqo ee xafiiska gobolka lagu magacaabay.', tag: 'Fursad Sare' },
    { role: 'Isku-duwaha Magaalada', scope: 'Kormeer wakiilada maxaliga ah, agaasim soo gelista hantida cusub ee nidaamka, oo maamul kooxaha aqoonsiga iyo hubinta hantida.', tag: 'Doorka Hogaanka' },
    { role: 'Dallaaliinta rasmiga ah', scope: 'Fududeey kala iibsiga hantida adoo u samaynaya heshiisyo sharci ah, dhijitaalna u beddelaya xogta guryaha iyadoo la adeegsanayo xisaabaadka rasmiga ah.', tag: 'Lidonsiyeed Keliya' },
    { role: 'Kormeerayaasha Hantida', scope: 'Xaqiiji goobta ay hantidu ku taal (GPS-ka), xaaladda jireed ee hantida, saxnaanshaha dukumentiyadeeda, kuna celi qiimeynta rasmiga ah ee nidaamka.', tag: 'Xirfadley' },
    { role: 'Wakiilada Suuq-geynta', scope: 'Abuur muuqaalo iyo qoraalo soo jiidasho leh oo ku saabsan suuq-geynta guryaha maxaliga ah, maamulna macaamiisha raba inay wax iibsadaan.', tag: 'Shaqo Furan / Remote' },
    { role: 'Wada-hawlgalayaasha Ganacsiga', scope: 'Wada-maalgelinta dhismayaasha waaweyn, guryaha ardayda, iyo kaabayaasha casriga ah ee magaalooyinka dalka.', tag: 'Rasmi ahaaan' },
    { role: 'Wada-hawlgalayaasha Mustaqbalka', scope: 'Fur xafiis rasmi ah oo AmaanEstate ah oo ku yaalla magaaladaada, adoo maamulaya heshiisyada iyo xaqiijinta hantida deegaanka.', tag: 'Ballaarinta Adeegyada' }
  ],
  en: [
    { role: 'Property Agents', scope: 'Represent exclusive institutional assets, close high-capacity rentals, and earn structured, scalable commissions.', tag: 'Active Recruitment' },
    { role: 'Regional Representatives', scope: 'Lead business growth strategy, strategic partnerships, and operations across designated state capitals.', tag: 'Elite Mandate' },
    { role: 'City Coordinators', scope: 'Supervise local agents, organize property listings, manage inspectors, and inspect localized acquisitions.', tag: 'Leadership Role' },
    { role: 'Real Estate Brokers', scope: 'Incorporate transactions with legal security, digitize localized listing pipelines, and secure escrow accounts.', tag: 'Licensed Only' },
    { role: 'Property Inspectors', scope: 'Verify geographic coordinates, physical asset conditions, document authenticity, and issue official ratings.', tag: 'Technical' },
    { role: 'Marketing Representatives', scope: 'Create hyper-localized high-retention social content, coordinate tours, and manage digital buyer leads.', tag: 'Flexible/Remote' },
    { role: 'Business Partners', scope: 'Co-invest in high-density development sites, student housing complexes, and major smart-infrastructure.', tag: 'Institutional' },
    { role: 'Future Franchise Partners', scope: 'Establish local AmaanEstate physical office divisions, run verified escrow desks, and secure geographic supremacy.', tag: 'Strategic Expansion' }
  ]
};

const CARREER_STEPS = {
  so: [
    { title: 'Ku Biir Shabakadda', desc: 'Abuur profile-kaaga, xaqiijina aqoonsigaaga si aad u noqoto xubin firfircoo.', tier: 'Heerka 1' },
    { title: 'Noqo Wakiil', desc: 'Ka shaqee iibinta iyo kiraynta guryaha adoo dakhli fiican ka helaya.', tier: 'Heerka 2' },
    { title: 'Wakiil Sare', desc: 'Maamul mashaariic hantiyeed oo waaweyn, kuna caawi wakiilada cusub tababarkooda.', tier: 'Heerka 3' },
    { title: 'Isku-duwaha Magaalada', desc: 'Hoggaami fududeynta iibka magaaladaada iyo kooxaha kormeerka hantida.', tier: 'Heerka 4' },
    { title: 'Wakiilka Gobolka', desc: 'Anshaxi heshiisyada sharci ee gobolka oo dhan kuna biir go\'aamada waaweyn.', tier: 'Heerka 5' },
    { title: 'Wada-hawlgal Goboleed', desc: 'Heshiisyo rasmi ah la gal shirkadaha waaweyn adoo dakhli ka helaya nidaamka guud.', tier: 'Xarunta Sare' }
  ],
  en: [
    { title: 'Join Network', desc: 'Initialize entry, create profile, and undergo a quick digital integrity vetting.', tier: 'Tier 1' },
    { title: 'Agent', desc: 'Earn commissions from local listings, facilitate sales, and achieve localized success.', tier: 'Tier 2' },
    { title: 'Senior Agent', desc: 'Manage higher value portfolios, and mentor new agents within the community.', tier: 'Tier 3' },
    { title: 'City Coordinator', desc: 'Lead regional listing pipelines and coordinate structural verification teams.', tier: 'Tier 4' },
    { title: 'Regional Rep', desc: 'Approve official real estate agreements and scale regional operations.', tier: 'Tier 5' },
    { title: 'Regional Partner', desc: 'Direct corporate joint ventures and share native platform revenue splits.', tier: 'Elite Hub' }
  ]
};

const STATS = {
  so: [
    { label: 'Guryo & Dhul la Xaqiijiyay', val: '4,500+' },
    { label: 'Heshiisyo Dhijitaal ah', val: '1,200+' },
    { label: 'Wakiilo Firfircoon', val: '350+' },
    { label: 'Suuqyada Gobolka', val: '12+' },
    { label: 'Fursadaha Dhalinyarada', val: '500+' },
    { label: 'Iskaashiga Ganacsiga', val: '45+' }
  ],
  en: [
    { label: 'Verified Properties', val: '4,500+' },
    { label: 'Digital Agreements', val: '1,200+' },
    { label: 'Active Agents', val: '350+' },
    { label: 'Regional Markets', val: '12+' },
    { label: 'Youth Opportunities', val: '500+' },
    { label: 'Business Partners', val: '45+' }
  ]
};

const TESTIMONIALS = {
  so: [
    {
      name: 'Abdikadir Guleid',
      role: 'Dhisaha Hantida Gobolka • Garowe',
      content: 'AmaanEstate waxay dib u soo celisay kalsoonida dhabta ah ee u dhaxaysa bulshada iyo shirkadaha. Macaamiishayada qurbajoogta ah hadda si kalsooni leh ayay u bixiyaan lacagaha iyagoo og in hantidu ay mari karto xaqiijin sharci ah.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Muna Yusuf',
      role: 'Isku-duwaha Gobolka • Hargeisa',
      content: 'Ku biirista shabakadda Amaan waxay ii furtay wadooyin shaqo oo aad u muhiim ah. Muddo bilooyin ah gudahood, waxaan bilaabay kormeerka iyo diiwaangelinta guryaha ee gobolkayga.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
    }
  ],
  en: [
    {
      name: 'Abdikadir Guleid',
      role: 'Real Estate Developer • Garowe',
      content: 'AmaanEstate has restored standard trust in developers. Our buyers from the diaspora now pay with zero hesitation knowing the property is legally audited.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Muna Yusuf',
      role: 'Regional Coordinator • Hargeisa',
      content: 'Joining the Amaan network opened up professional pathways I never dreamed of. Within months I was coordinating physical audits for major regional developers.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150'
    }
  ]
};

const ICONS = [
  <Building2 className="text-[#C5A059]" size={24} />,
  <Users className="text-[#C5A059]" size={24} />,
  <Cpu className="text-[#C5A059]" size={24} />,
  <Building2 className="text-[#C5A059]" size={24} />,
  <TrendingUp className="text-[#C5A059]" size={24} />,
  <Globe className="text-[#C5A059]" size={24} />,
  <Briefcase className="text-[#C5A059]" size={24} />,
  <Sparkles className="text-[#C5A059]" size={24} />
];

export default function NetworkPage() {
  const { user } = useAuth();
  const { language } = useSettings();
  const navigate = useNavigate();

  // Somali takes absolute default and primary precedence
  const isSomali = language === 'so' || language !== 'en';
  const currT = isSomali ? T.so : T.en;

  // Modal Control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Verification Needed');
  const [modalSubtitle, setModalSubtitle] = useState('');
  const [modalSuccessAction, setModalSuccessAction] = useState<{ type: string; data?: any } | null>(null);

  // Innovation Hub submission form state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('Suggestion');
  const [ideaContent, setIdeaContent] = useState('');
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [ideaSubmittedSuccessfully, setIdeaSubmittedSuccessfully] = useState(false);

  // Application Form State
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [appRole, setAppRole] = useState('');
  const [appFullName, setAppFullName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appMotivation, setAppMotivation] = useState('');
  const [isAppSubmitting, setIsAppSubmitting] = useState(false);
  const [appSubmitted, setAppSubmitted] = useState(false);

  const handleOpenApplication = (role: string) => {
    setAppRole(role);
    setAppFormOpen(true);
  };

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFullName.trim() || !appEmail.trim() || !appMotivation.trim()) {
      toast.error(isSomali ? "Fadlan buuxi faahfaahintaada." : "Please fill out all required fields.");
      return;
    }

    setIsAppSubmitting(true);
    
    setTimeout(() => {
      setIsAppSubmitting(false);
      setAppSubmitted(true);
      
      const text = `*New Application Request*\n\n*Role:* ${appRole}\n*Name:* ${appFullName}\n*Email:* ${appEmail}\n*Phone:* ${appPhone || 'N/A'}\n\n*Motivation:*\n${appMotivation}`;
      const waUrl = `https://wa.me/251910012795?text=${encodeURIComponent(text)}`;
      
      toast.success(isSomali ? "Si guul leh ayaa loo diray!" : "Submitted successfully!");
      
      setTimeout(() => {
        window.open(waUrl, '_blank');
        setAppFormOpen(false);
        setAppSubmitted(false);
        setAppFullName('');
        setAppEmail('');
        setAppPhone('');
        setAppMotivation('');
      }, 1500);

    }, 800);
  };

  // References for navigation
  const ideasSectionRef = useRef<HTMLDivElement>(null);
  const opportunitiesSectionRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Generic Gated Click Handler
  const handleGatedAction = (actionType: string, actionData?: any) => {
    if (!user) {
      if (actionType === 'SUBMIT_IDEA') {
        setModalTitle(isSomali ? 'Soo Gudbi Fikraddaada' : 'Submit Your Innovation');
        setModalSubtitle(isSomali 
          ? 'Fadlan dooro batoonka hoose si aad u soo gasho ama u diiwaangeliso maamulka aqoonsiga si aad fikirkaaga u kaydiso.' 
          : 'Please sign in or create an account to officially register your idea inside the AmaanEstate Innovation Hub.'
        );
      } else if (actionType === 'JOIN_NETWORK') {
        setModalTitle(isSomali ? 'Ku Biir Shabakadda' : 'Join The Network');
        setModalSubtitle(isSomali 
          ? 'Ku soo biir shabakadda ugu ballaaran hantida ma guurtada ah adoo samaysanaya profile xaqiijisan.' 
          : 'Sign in or register to join the digital ecosystem and connect with industry leaders.'
        );
      } else if (actionType === 'BECOME_AGENT') {
        setModalTitle(isSomali ? 'Noqo Wakiil Rasmi ah' : 'Become An Official Agent');
        setModalSubtitle(isSomali 
          ? 'Ku caawi suuq-geynta iyo diiwaangelinta guryaha adoo dakhli fiican helaya. Gal nidaamka si aad u bilowdo.' 
          : 'Access verified exclusive mandates and start earning professional commissions by logging in.'
        );
      }
      setModalSuccessAction({ type: actionType, data: actionData });
      setModalOpen(true);
    } else {
      executeAction(actionType, actionData);
    }
  };

  const executeAction = async (type: string, data?: any) => {
    if (type === 'SUBMIT_IDEA') {
      await saveIdeaToFirestore();
    } else if (type === 'JOIN_NETWORK') {
      toast.success(isSomali 
        ? "Ku soo dhowow! Hadda waxaad tahay xubin ka tirsan Shabakadda AmaanEstate." 
        : "Welcome! You are already an integrated member of the AmaanEstate Network."
      );
    } else if (type === 'BECOME_AGENT') {
      navigate('/agents/register');
    }
  };

  const handleModalSuccess = () => {
    if (modalSuccessAction) {
      executeAction(modalSuccessAction.type, modalSuccessAction.data);
      setModalSuccessAction(null);
    }
  };

  const saveIdeaToFirestore = async () => {
    if (!ideaTitle.trim() || !ideaContent.trim()) {
      toast.error(isSomali ? "Fadlan buuxi dhammaan meelaha maran." : "Please fill out all idea fields before submitting.");
      return;
    }

    setIsSubmittingIdea(true);
    try {
      // Send to FormSubmit
      const response = await fetch('https://formsubmit.co/b65456d54379959a0d4af14c9ba036ae', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          focusTitle: ideaTitle,
          category: ideaCategory,
          suggestion: ideaContent,
          _captcha: "false"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit via FormSubmit');
      }
      
      setIdeaSubmittedSuccessfully(true);
      setIdeaTitle('');
      setIdeaContent('');
      toast.success(isSomali ? "Mahadsanid! Fariintaada waa la helay." : "Thank you! Your message was received.");
    } catch (err: any) {
      toast.error(isSomali ? "Waan pashalnay! Fadlan mar kale isku day." : "Unable to submit idea. Please try again.");
      console.error(err);
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  const handleIdeaFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaContent.trim()) {
      toast.error(isSomali ? "Fadlan qor ciwaanka iyo fikraddaada." : "Please fill out all idea fields.");
      return;
    }
    handleGatedAction('SUBMIT_IDEA');
  };

  const activeJoinGroups = isSomali ? JOIN_GROUPS.so : JOIN_GROUPS.en;
  const activeOpportunities = isSomali ? OPPORTUNITIES.so : OPPORTUNITIES.en;
  const activeSteps = isSomali ? CARREER_STEPS.so : CARREER_STEPS.en;
  const activeStats = isSomali ? STATS.so : STATS.en;
  const activeTestimonials = isSomali ? TESTIMONIALS.so : TESTIMONIALS.en;
  const activeChallenges = isSomali ? CHALLENGES.so : CHALLENGES.en;

  return (
    <div className="min-h-screen bg-[#070707] text-white pt-28 pb-20 overflow-x-hidden selection:bg-[#C5A059] selection:text-black">
      
      {/* 1. Hero Section */}
      <section className="relative container mx-auto px-4 mb-24 md:mb-32">
        <div className="absolute inset-0 -top-40 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C5A059]/10 rounded-full blur-[120px]" />
          <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px]" />
        </div>

        <div className="text-center relative z-10 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <Sparkles className="text-[#C5A059]" size={14} />
            <span className="text-[10px] text-white/70 uppercase tracking-[0.25em] font-bold">{currT.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-8xl font-display font-light text-white tracking-tighter leading-none"
          >
            {currT.heroTitle_1} <br />
            <span className="bg-gradient-to-r from-amber-200 via-[#C5A059] to-amber-600 bg-clip-text text-transparent font-medium">
              {currT.heroTitle_2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-white/60 text-base md:text-xl font-light leading-relaxed max-w-2xl mx-auto"
          >
            {currT.heroSub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-4"
          >
            <Button 
              onClick={() => handleOpenApplication('Network Member')}
              className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-black px-8 h-14 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(197,160,89,0.2)]"
            >
              <UserPlus className="mr-2" size={15} /> {currT.btnJoin}
            </Button>
            <Button 
              onClick={() => handleGatedAction('BECOME_AGENT')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 h-14 rounded-2xl font-bold text-white text-xs uppercase tracking-wider transition-all"
            >
              {currT.btnAgent}
            </Button>
            <Button 
              variant="link"
              onClick={() => scrollToRef(ideasSectionRef)}
              className="text-white/60 hover:text-[#C5A059] text-xs font-bold uppercase tracking-wider transition-all"
            >
              {currT.btnShare} <ArrowRight className="ml-1 inline" size={14} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 2. Mission Section */}
      <section className="container mx-auto px-4 mb-28 md:mb-40 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{isSomali ? "UJeedka Guud" : "Our Core Paradigm"}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight leading-tight">
            {currT.whyExist} <br />
            <span className="text-white/40">{currT.securingAssets}</span>
          </h2>
          <div className="space-y-4 text-white/50 font-light leading-relaxed">
            <p>{currT.whyDesc1}</p>
            <p>{currT.whyDesc2}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-[#C5A059]/5 rounded-full blur-[80px]" />
          <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-extrabold mb-6">{currT.challengesTitle}</h3>
          
          <ul className="space-y-4">
            {activeChallenges.map((item, idx) => (
              <li key={idx} className="flex gap-4">
                <div className="bg-red-500/10 text-red-400 p-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0">
                  <X size={12} />
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm tracking-tight">{item.label}</h4>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-white/80">
            <CheckCircle2 className="text-[#C5A059]" size={18} />
            <p className="text-xs font-mono">
              {isSomali 
                ? "Waxaan ku xallinaa tignoolajiyada, hufnaanta, iyo heshiisyada dhijitaalka ah." 
                : "We resolve these with technology, transparency, and digital agreements."}
            </p>
          </div>
        </motion.div>
      </section>

      {/* 3. Who Can Join */}
      <section className="container mx-auto px-4 mb-28 md:mb-40">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{isSomali ? "Albaabada u Furan Bulshada" : "Inclusive Ecosystem"}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.whoTitle}
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            {currT.whoSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeJoinGroups.map((group, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-neutral-900/40 p-6 rounded-[2rem] border border-white/5 hover:border-[#C5A059]/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#C5A059]/10 transition-colors">
                {ICONS[idx % ICONS.length]}
              </div>
              <h3 className="text-white font-semibold text-base tracking-tight mb-2 group-hover:text-[#C5A059] transition-colors">{group.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{group.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Opportunities Section */}
      <section ref={opportunitiesSectionRef} className="container mx-auto px-4 mb-28 md:mb-40">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{isSomali ? "Minaaradaha Shaqo" : "Platform Vacancies"}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.oppsTitle}
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            {currT.oppsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeOpportunities.map((opp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="bg-[#101010] p-6 rounded-3xl border border-white/5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/25 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider font-extrabold">
                    {opp.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base tracking-tight">{opp.role}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{opp.scope}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleOpenApplication(opp.role)}
                  className="w-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center justify-between hover:text-[#C5A059] transition-all"
                >
                  <span>{currT.reqApp}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Youth Empowerment Section */}
      <section className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-y border-white/5 py-24 mb-28 md:mb-40">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{currT.youthLabel}</span>
            <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight leading-none">
              {currT.youthTitle}
            </h2>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              {currT.youthDesc}
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <h4 className="text-xl font-bold text-white">{currT.statTrainees}</h4>
                <p className="text-xs text-white/40 mt-1">{currT.statTraineesDesc}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <h4 className="text-xl font-bold text-white">{currT.statInterns}</h4>
                <p className="text-xs text-white/40 mt-1">{currT.statInternsDesc}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-2">
              <span className="text-2xl">🎓</span>
              <h4 className="font-bold text-white">{isSomali ? "Hubinta iyo Xaqiijinta" : "Integrity Vetting"}</h4>
              <p className="text-xs text-white/40">
                {isSomali 
                  ? "U tababaridda dhalinyarada kormeerayaasha ah habka xaqiijinta dhulka iyo hantida rasmiga ah." 
                  : "Guiding young inspectors with localized land verification frameworks."}
              </p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-2 translate-y-4">
              <span className="text-2xl">💡</span>
              <h4 className="font-bold text-white">{isSomali ? "Hal-abuurka Tignoolajiyada" : "Startup Hubs"}</h4>
              <p className="text-xs text-white/40">
                {isSomali 
                  ? "Bixinta agabka u dambeeyay ee daruuraha darteed mashaariicda PropTech dhalinyarada." 
                  : "Incentivizing PropTech startups with modern cloud resources."}
              </p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-2">
              <span className="text-2xl">📜</span>
              <h4 className="font-bold text-white">{isSomali ? "Aqoonta Sharciga Hantida" : "Legal Literacy"}</h4>
              <p className="text-xs text-white/40">
                {isSomali 
                  ? "Barashada xuquuqda waraaqaha iyo diiwaangelinta guryaha heerarka gobolada dhammaan." 
                  : "Equipping youth with comprehensive understanding of real estate property deeds."}
              </p>
            </div>
            <div className="bg-[#121212] border border-white/5 p-6 rounded-3xl space-y-2 translate-y-4">
              <span className="text-2xl">🚀</span>
              <h4 className="font-bold text-white">{isSomali ? "Jidka Guusha Codsiyada" : "Elite Pipelines"}</h4>
              <p className="text-xs text-white/40">
                {isSomali 
                  ? "Ku xirista dhalinyarada dadaasha ah ee ka soo baxday tababarada shirkadaha horumarinta waaweyn." 
                  : "Placing high-performing agents with institutional developers."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Career Growth Roadmap */}
      <section className="container mx-auto px-4 mb-28 md:mb-40">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{isSomali ? "Dariiqa Horumarka" : "Accreditation Path"}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.roadTitle}
          </h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            {currT.roadSub}
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500/10 via-[#C5A059]/45 to-amber-500/10 -translate-y-1/2 hidden lg:block" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative z-10">
            {activeSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2rem] hover:border-[#C5A059]/30 transition-all text-center relative group"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center font-mono text-[#C5A059] font-extrabold text-xs mx-auto mb-4 group-hover:bg-[#C5A059] group-hover:text-black transition-all">
                  {idx + 1}
                </div>
                <span className="text-[9px] bg-white/5 text-[#C5A059] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest font-extrabold">
                  {step.tier}
                </span>
                <h4 className="text-white font-bold text-sm tracking-tight mt-3 mb-1.5">{step.title}</h4>
                <p className="text-white/40 text-[11px] leading-relaxed max-w-[150px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Ideas & Innovation Hub */}
      <section ref={ideasSectionRef} className="container mx-auto px-4 mb-28 md:mb-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{currT.ideasLabel}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.ideasTitle}
          </h2>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            {currT.ideasDesc}
          </p>

          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex gap-3.5 items-start">
            <Shield className="text-[#C5A059] shrink-0 mt-1" size={18} />
            <div className="space-y-1">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">{currT.protectTitle}</h4>
              <p className="text-xs text-white/30 leading-relaxed">{currT.protectDesc}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#0e0e0e] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#C5A059]/5 rounded-full blur-2xl pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {!ideaSubmittedSuccessfully ? (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-white font-bold text-xl tracking-tight">{currT.formHeader}</h3>
                  <p className="text-xs text-white/40 mt-1">{currT.formSub}</p>
                </div>

                <iframe name="hidden_idea_iframe" id="hidden_idea_iframe" style={{ display: 'none' }}></iframe>
                <form 
                  action="https://formsubmit.co/b65456d54379959a0d4af14c9ba036ae"
                  method="POST"
                  target="hidden_idea_iframe"
                  onSubmit={() => {
                    setIsSubmittingIdea(true);
                    setTimeout(() => {
                      setIsSubmittingIdea(false);
                      setIdeaSubmittedSuccessfully(true);
                      setIdeaTitle('');
                      setIdeaContent('');
                      toast.success(currT.btnSubmit);
                    }, 1000);
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="_captcha" value="false" />
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">{currT.labelTitle}</label>
                    <Input 
                      name="focusTitle"
                      placeholder={currT.placeTitle} 
                      value={ideaTitle}
                      onChange={e => setIdeaTitle(e.target.value)}
                      className="bg-white/5 border-white/5 h-12 rounded-xl focus:ring-[#C5A059]/10 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">{currT.labelCategory}</label>
                      <select 
                        name="category"
                        value={ideaCategory}
                        onChange={e => setIdeaCategory(e.target.value)}
                        className="w-full bg-[#161616] border border-[#222] h-12 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#C5A059]/30 font-bold"
                      >
                        <option value="Suggestion">{isSomali ? "Talo" : "Suggestion"}</option>
                        <option value="Feedback">{isSomali ? "Aragti ama Gobola-tobin" : "Feedback"}</option>
                        <option value="New Business Idea">{isSomali ? "Fikrad Guryo Cusub" : "New Business Idea"}</option>
                        <option value="Platform Improvement">{isSomali ? "Horey-u-qaadka Nidaamka" : "Platform Improvement"}</option>
                        <option value="Partnership Proposal">{isSomali ? "Hindise Iskaashi" : "Partnership Proposal"}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">{currT.labelContent}</label>
                    <Textarea 
                      name="suggestion"
                      placeholder={currT.placeContent}
                      value={ideaContent}
                      onChange={e => setIdeaContent(e.target.value)}
                      className="bg-white/5 border-white/5 rounded-2xl min-h-[140px] text-xs focus:ring-[#C5A059]/10"
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmittingIdea}
                    className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-black h-12 rounded-xl font-bold uppercase tracking-wider text-xs font-mono"
                  >
                    {isSubmittingIdea ? currT.btnSubmitting : currT.btnSubmit}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/25 animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-2xl tracking-tight">{currT.successTitle}</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                    {currT.successSub}
                  </p>
                </div>
                <Button 
                  onClick={() => setIdeaSubmittedSuccessfully(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs h-10 px-6 rounded-xl border border-white/10"
                >
                  {currT.btnAnother}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 8. Impact Statistics Section */}
      <section className="container mx-auto px-4 mb-28 md:mb-40 bg-neutral-900/20 border border-white/5 rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{currT.impactLabel}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.impactTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 text-center">
          {activeStats.map((stat, idx) => (
            <div key={idx} className="space-y-2 group">
              <div className="text-3xl md:text-4xl font-display font-medium text-[#C5A059] tracking-tighter transition-transform group-hover:scale-105 duration-300">
                {stat.val}
              </div>
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-extrabold max-w-[120px] mx-auto leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Testimonials & Spotlights */}
      <section className="container mx-auto px-4 mb-28 md:mb-40">
        <div className="text-center mb-16 space-y-3">
          <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">{currT.testimonialsLabel}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-white tracking-tight">
            {currT.testimonialsTitle}
          </h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            {currT.testimonialsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {activeTestimonials.map((test, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-neutral-900/35 border border-white/5 p-8 rounded-[2rem] space-y-6 flex flex-col justify-between"
            >
              <p className="text-white/70 text-sm italic leading-relaxed font-light">"{test.content}"</p>
              
              <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                <img 
                  src={test.avatar} 
                  alt={test.name} 
                  className="w-11 h-11 rounded-full object-cover border border-white/10" 
                />
                <div>
                  <h4 className="text-white font-bold text-sm tracking-tight">{test.name}</h4>
                  <p className="text-[10px] text-[#C5A059] uppercase tracking-widest mt-0.5 font-bold">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="container mx-auto px-4 text-center max-w-3xl space-y-8 relative z-10">
        <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto border border-[#C5A059]/20">
          <Globe className="animate-spin duration-3000" size={24} />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl md:text-6xl font-display font-light text-white tracking-tighter">
            {currT.ctaTitle}
          </h2>
          <p className="text-white/50 text-base font-light max-w-lg mx-auto leading-relaxed">
            {currT.ctaDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button 
            onClick={() => handleOpenApplication('Network Member')}
            className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-black px-8 h-12 rounded-xl font-bold uppercase tracking-wider text-xs"
          >
            {currT.btnJoin}
          </Button>
          <Button 
            onClick={() => handleGatedAction('BECOME_AGENT')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 h-12 rounded-xl font-bold text-white text-xs uppercase tracking-wider text-xs"
          >
            {currT.btnAgent}
          </Button>
          <Button 
            onClick={() => scrollToRef(opportunitiesSectionRef)}
            className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider block sm:inline"
          >
            {currT.btnExplore}
          </Button>
        </div>
      </section>

      {/* Application Form Modal */}
      <AnimatePresence>
        {appFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAppFormOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#101010] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 overflow-hidden"
            >
              <button 
                onClick={() => setAppFormOpen(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <span className="text-[10px] text-[#C5A059] font-extrabold uppercase tracking-[0.3em] font-mono">
                  {isSomali ? "Codsiga Booska" : "Role Application"}
                </span>
                <h3 className="text-2xl font-light text-white tracking-tight mt-2">
                  {appRole}
                </h3>
                <p className="text-sm text-white/50 mt-1">
                  {isSomali ? "Fadlan buuxi foomkan si aad u codsato. Waxaan kugu xiri doonaa WhatsApp-ka." : "Fill out this form to apply. You will be redirected to WhatsApp to send your application."}
                </p>
              </div>

              {appSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center border border-[#C5A059]/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {isSomali ? "Waa Loo Mahadcelinayaa!" : "Thank You!"}
                  </h4>
                  <p className="text-white/50 text-sm">
                    {isSomali ? "Dib u geynta WhatsApp..." : "Redirecting to WhatsApp..."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplicationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">
                      {isSomali ? "Magaca Buuxa (Loo baahan yahay)" : "Full Name (Required)"}
                    </label>
                    <Input 
                      required
                      placeholder={isSomali ? "Magacaaga" : "Your Name"}
                      value={appFullName}
                      onChange={e => setAppFullName(e.target.value)}
                      className="bg-white/5 border-[#222] h-12 rounded-xl focus:border-[#C5A059]/30 text-sm text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">
                        {isSomali ? "Iimaylka (Loo baahan yahay)" : "Email (Required)"}
                      </label>
                      <Input 
                        required
                        type="email"
                        placeholder="email@example.com"
                        value={appEmail}
                        onChange={e => setAppEmail(e.target.value)}
                        className="bg-white/5 border-[#222] h-12 rounded-xl focus:border-[#C5A059]/30 text-sm text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">
                        {isSomali ? "Telefoonka (Xulasho)" : "Phone (Optional)"}
                      </label>
                      <Input 
                        type="tel"
                        placeholder="+252..."
                        value={appPhone}
                        onChange={e => setAppPhone(e.target.value)}
                        className="bg-white/5 border-[#222] h-12 rounded-xl focus:border-[#C5A059]/30 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold block">
                      {isSomali ? "Fariinta (Loo baahan yahay)" : "Message / Motivation (Required)"}
                    </label>
                    <Textarea 
                      required
                      placeholder={isSomali ? "Maxaad u dooneysaa booskan?" : "Why would you like to apply?"}
                      value={appMotivation}
                      onChange={e => setAppMotivation(e.target.value)}
                      className="bg-white/5 border-[#222] h-24 rounded-xl focus:border-[#C5A059]/30 text-sm text-white resize-none py-3"
                    />
                  </div>

                  <div className="pt-4">
                    <Button 
                      type="submit"
                      disabled={isAppSubmitting}
                      className="w-full bg-[#C5A059] hover:bg-[#C5A059]/90 text-black h-12 rounded-xl font-bold uppercase tracking-wider text-xs"
                    >
                      {isAppSubmitting 
                        ? (isSomali ? "Waa Socdaa..." : "Processing...") 
                        : (isSomali ? "Codso Hadda" : "Submit Application")}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gated Integration AuthModal */}
      <AuthModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleModalSuccess}
        title={modalTitle}
        subtitle={modalSubtitle}
      />
    </div>
  );
}
