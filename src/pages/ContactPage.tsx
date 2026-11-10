import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, RefreshCw } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useSEO({
    title: 'Contact Us | AmaanEstate',
    description: 'Get in touch with AmaanEstate real estate support desk.'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setName('');
      setEmail('');
      setMessage('');
      toast.success('Your message has been sent successfully! Our desk will reply within 24 hours.');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          We're Ready to Help
        </h1>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Have an inquiry about a property, land parcel, listing opportunity, or partnership? Send us a message and our support desk will respond shortly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact details */}
        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04] space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Office Information</h3>
          
          <div className="space-y-4 text-xs text-neutral-400">
            <div className="flex items-start gap-3">
              <MapPin className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-white">HQ Address</h4>
                <p className="text-xxs text-neutral-500">Airport Road, near Central Mosque, Jigjiga, Somali Region, Ethiopia</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-white">Phone Support</h4>
                <p className="text-xxs text-neutral-500">[Contact Phone Pending Configuration]</p>
                <p className="text-xxs text-neutral-500">Monday - Saturday (8:00 AM - 6:00 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <h4 className="text-xs font-bold text-white">E-Mail Channel</h4>
                <p className="text-xxs text-neutral-500">[Contact Email Pending Configuration]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 rounded-xl bg-[#0c0c14] border border-white/[0.04]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-2">Send an Inquiry</h3>
            
            <div className="space-y-1">
              <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Your Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="E.g. Saciid Axmed"
                className="bg-[#050508] border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-cyan-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Your Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E.g. saciid@example.com"
                className="bg-[#050508] border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-cyan-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xxs font-semibold uppercase tracking-wider text-neutral-500 font-mono block">Message</label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Please describe your inquiry..."
                className="bg-[#050508] border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-cyan-500/20 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Message</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
