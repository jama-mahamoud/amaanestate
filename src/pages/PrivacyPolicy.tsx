import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-32 pb-20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold">
                <Shield size={32} />
            </div>
            <h1 className="text-4xl font-display font-bold">Privacy Policy</h1>
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-white/60">Last updated: May 20, 2026</p>
          <p>At AmaanEstate, we take your privacy seriously. This policy outlines how we handle your data.</p>
          <h2>Information Collection</h2>
          <p>We collect essential information to facilitate real estate and vehicle transactions securely.</p>
          <h2>Data Protection</h2>
          <p>Your data is stored securely using industry-standard practices.</p>
          <h2>Service Provider Information</h2>
          <p>Data shared with verified brokers is used strictly for facilitating the requested services.</p>
        </div>
      </div>
    </div>
  );
}
