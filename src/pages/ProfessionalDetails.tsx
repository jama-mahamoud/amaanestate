import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Star, MapPin, Briefcase, CheckCircle2, MessageSquare, 
  Phone, Mail, Calendar, Shield, Award, Languages,
  ArrowLeft, Share2, Heart, ExternalLink, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_PROFESSIONAL = {
  id: 'p1',
  name: 'Eng. Ahmed Duale',
  title: 'Senior Civil Engineer',
  category: 'Construction & Engineering',
  skills: ['Structural Design', 'Project Management', 'AutoCAD', 'Surveying', 'Cost Estimation', 'Site Supervision'],
  experienceYears: 12,
  city: 'Jigjiga',
  image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
  rating: 4.9,
  reviewCount: 124,
  availability: 'Available',
  bio: 'With over a decade of experience in the Somali Region, I specialize in the structural design and project management of high-value residential and commercial properties. My mission is to elevate the engineering standards of our region by combining modern international practices with local understanding.',
  isVerified: true,
  languages: ['Somali', 'English', 'Arabic', 'Amharic'],
  certifications: [
    'Registered Professional Engineer - ET',
    'Project Management Professional (PMP)',
    'Structural Safety Certificate'
  ],
  education: 'Master of Civil Engineering - Addis Ababa University',
  completedProjects: 45
};

export default function ProfessionalDetails() {
  const { id } = useParams();
  // In a real app, fetch by id. Using mock for now.
  const pro = MOCK_PROFESSIONAL;

  return (
    <div className="min-h-screen bg-luxury-black pb-20">
      {/* Background Header */}
      <div className="h-64 bg-gradient-to-br from-luxury-gold/20 via-luxury-black to-luxury-black relative pt-20">
        <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
          <Link to="/services" className="text-white/40 hover:text-luxury-gold transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Marketplace
          </Link>
          <div className="flex gap-4">
            <button className="text-white/40 hover:text-white transition-colors"><Share2 size={18} /></button>
            <button className="text-white/40 hover:text-white transition-colors"><Heart size={18} /></button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-8">
            <div className="bg-luxury-charcoal/40 backdrop-blur-2xl p-8 md:p-12 rounded-[4rem] border border-white/10 mb-12">
              <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
                <div className="relative group shrink-0">
                  <img 
                    src={pro.image} 
                    alt={pro.name}
                    className="w-48 h-48 rounded-[3rem] object-cover border-4 border-luxury-black shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  />
                  {pro.isVerified && (
                    <div className="absolute -top-2 -right-2 bg-luxury-gold text-luxury-black rounded-full p-2 shadow-xl border-4 border-luxury-black">
                      <CheckCircle2 size={24} fill="currentColor" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-luxury-gold text-luxury-black border-0 uppercase text-[10px] tracking-widest font-bold px-4 py-1.5">
                      {pro.category}
                    </Badge>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {pro.availability}
                    </div>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 leading-tight">
                    {pro.name}
                  </h1>
                  <p className="text-luxury-gold font-display font-bold text-xl mb-6">{pro.title}</p>
                  
                  <div className="flex flex-wrap gap-6 text-white/40 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-luxury-gold" />
                      <span>{pro.city}, Somali Region</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Star size={18} className="text-luxury-gold fill-luxury-gold" />
                       <span className="text-white font-bold">{pro.rating}</span>
                       <span>({pro.reviewCount} Reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-luxury-gold" />
                      <span>{pro.completedProjects} Projects Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-12">
                <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                  Expert Narrative <div className="h-px flex-1 bg-white/5 ml-8"></div>
                </h3>
                <p className="text-white/60 text-xl leading-[1.8] font-light italic mb-12">
                  "{pro.bio}"
                </p>
                
                <h3 className="text-white text-[10px] uppercase font-bold tracking-[0.4em] mb-10 flex items-center">
                  Specialized Competencies <div className="h-px flex-1 bg-white/5 ml-8"></div>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {pro.skills.map((skill, i) => (
                    <div key={i} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 text-sm hover:border-luxury-gold/50 hover:text-white hover:bg-white/10 transition-all font-medium tracking-tight">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div className="p-10 bg-luxury-charcoal/40 border border-white/5 rounded-[3rem]">
                  <h4 className="text-white font-display font-bold text-xl mb-6 flex items-center gap-3">
                    <Award className="text-luxury-gold" size={20} /> Certifications
                  </h4>
                  <ul className="space-y-4">
                    {pro.certifications.map((cert, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0 text-luxury-gold">
                           <CheckCircle2 size={14} />
                        </div>
                        <span className="text-white/40 text-sm">{cert}</span>
                      </li>
                    ))}
                  </ul>
               </div>
               <div className="p-10 bg-luxury-charcoal/40 border border-white/5 rounded-[3rem]">
                  <h4 className="text-white font-display font-bold text-xl mb-6 flex items-center gap-3">
                    <Languages className="text-luxury-gold" size={20} /> Communication
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {pro.languages.map((lang, i) => (
                      <Badge key={i} variant="outline" className="text-white/60 border-white/10 uppercase text-[10px] tracking-widest font-bold">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest mb-2">Education</p>
                    <p className="text-white/60 text-sm leading-relaxed">{pro.education}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar / Conversion */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-luxury-charcoal/60 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <h3 className="text-2xl font-display font-bold text-white mb-8">Priority Booking</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                        <Briefcase size={18} />
                      </div>
                      <span className="text-white/60 text-sm font-bold">Experience</span>
                    </div>
                    <span className="text-white font-bold">{pro.experienceYears}Y+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                        <ThumbsUp size={18} />
                      </div>
                      <span className="text-white/60 text-sm font-bold">Success Rate</span>
                    </div>
                    <span className="text-white font-bold">98%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-luxury-gold text-luxury-black hover:bg-white transition-all h-16 rounded-2xl font-bold text-lg">
                    <MessageSquare size={20} className="mr-2" /> WhatsApp Expert
                  </Button>
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-16 rounded-2xl font-bold">
                    <Phone size={20} className="mr-2" /> Request Call
                  </Button>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase tracking-[0.2em] font-bold">
                   <Shield size={12} className="text-luxury-gold" /> Confidential Inquiry
                </div>
              </div>

              <div className="p-8 border border-white/5 rounded-[3rem] bg-luxury-charcoal/20 text-center">
                 <h4 className="text-white font-display font-bold mb-4">Are you a Professional?</h4>
                 <p className="text-white/40 text-xs mb-6 leading-relaxed">Join our elite network of verified experts and grow your regional business.</p>
                 <Button asChild variant="link" className="text-luxury-gold h-auto p-0 uppercase font-bold tracking-widest text-[10px]">
                    <a href="/become-pro">Apply to Join &rarr;</a>
                 </Button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
