import React, { useState } from 'react';

interface PropertyFormData {
  // Property Fields
  title: string;
  price: string;
  location: string;
  nearbyPlaces: string;
  phone: string;
  currency: string;
  beds: string;
  baths: string;
  showers: string;
  description: string;

  // Broker Section
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;

  // Owner Section (Optional)
  ownerName: string;
  ownerPhone: string;
}

export default function PropertyListingForm() {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    price: '',
    location: '',
    nearbyPlaces: '',
    phone: '',
    currency: 'ETB',
    beds: '1',
    baths: '1',
    showers: '1',
    description: '',
    brokerName: '',
    brokerEmail: '',
    brokerPhone: '',
    ownerName: '',
    ownerPhone: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    setFormData({
      title: '',
      price: '',
      location: '',
      nearbyPlaces: '',
      phone: '',
      beds: '1',
      baths: '1',
      showers: '1',
      description: '',
      brokerName: '',
      brokerEmail: '',
      brokerPhone: '',
      ownerName: '',
      ownerPhone: '',
      currency: 'ETB',
    });
    setFormSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-[#0A0A0A]/85 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl" id="property-listing-form-container">
      <div className="mb-8 border-b border-white/5 pb-6">
        <h2 className="text-2xl md:text-3xl font-display font-medium tracking-tight text-white mb-2" id="property-form-title">
          List Your Property
        </h2>
        <p className="text-white/40 text-xs md:text-sm tracking-wide">
          Enter your property and brokerage details to create a premium listing on AmaanEstate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" id="property-listing-form">
        {/* PROPERTY DETAILS SECTION */}
        <section className="space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#C5A059] border-l-2 border-[#C5A059] pl-3" id="details-section-heading">
            1. Property Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-white/60 text-xs font-semibold tracking-wide">
                Property Title <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Ultra-Modern Luxury Villa"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-white/60 text-xs font-semibold tracking-wide">
                Price <span className="text-[#C5A059]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 25000000"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-[10px] focus:outline-none focus:border-[#C5A059]/50 transition-colors flex-1"
                />
                <select
                  name="currency"
                  required
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-24 h-12 bg-white/5 border border-white/10 rounded-xl px-2 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
                >
                  <option value="ETB">ETB</option>
                  <option value="USD">USD</option>
                  <option value="SOS">SOS</option>
                  <option value="AED">AED</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              <label htmlFor="location" className="text-white/60 text-xs font-semibold tracking-wide">
                Location / Address <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                list="somali-cities"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Jijiga, Ethiopia — Bole Subcity"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
              <datalist id="somali-cities">
                {['Addis Ababa', 'Baidoa', 'Beledweyne', 'Berbera', 'Borama', 'Bosaso', 'Burco', 'Dire Dawa', 'Galkayo', 'Garissa', 'Garowe', 'Hargeisa', 'Jijiga', 'Kismayo', 'Mogadishu', 'Nairobi', 'Wajir'].map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Direct Contact Phone */}
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-white/60 text-xs font-semibold tracking-wide" id="label-phone">
                Direct Contact Phone <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +251 911 234 567"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Nearby Places */}
            <div className="flex flex-col gap-2">
              <label htmlFor="nearbyPlaces" className="text-white/60 text-xs font-semibold tracking-wide" id="label-nearby-places">
                Nearby Places <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="text"
                id="nearbyPlaces"
                name="nearbyPlaces"
                required
                value={formData.nearbyPlaces}
                onChange={handleChange}
                placeholder="e.g., Jijiga Airport, 5 mins from Grand Mall"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Beds, Baths, Showers inline */}
            <div className="grid grid-cols-3 gap-4 col-span-1 md:col-span-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="beds" className="text-white/60 text-[11px] font-semibold tracking-wide uppercase">
                  Beds
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  min="0"
                  value={formData.beds}
                  onChange={handleChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="baths" className="text-white/60 text-[11px] font-semibold tracking-wide uppercase">
                  Baths
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  min="0"
                  value={formData.baths}
                  onChange={handleChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="showers" className="text-white/60 text-[11px] font-semibold tracking-wide uppercase">
                  Showers
                </label>
                <input
                  type="number"
                  id="showers"
                  name="showers"
                  min="0"
                  value={formData.showers}
                  onChange={handleChange}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              <label htmlFor="description" className="text-white/60 text-xs font-semibold tracking-wide">
                Property Description <span className="text-[#C5A059]">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Give a thorough description highlighting key luxury amenities, zoning, views, and materials."
                rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* BROKER / AGENCY SECTION */}
        <section className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#C5A059] border-l-2 border-[#C5A059] pl-3" id="broker-section-heading">
              2. Broker & Agency Details
            </h3>
            <span className="text-white/30 text-[10px] uppercase tracking-wider pl-5">Primary agent contacts are required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Broker Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="brokerName" className="text-white/60 text-xs font-semibold tracking-wide">
                Broker / Agency Name <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="text"
                id="brokerName"
                name="brokerName"
                required
                value={formData.brokerName}
                onChange={handleChange}
                placeholder="e.g., Amaan Premium Realtors"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Broker Phone */}
            <div className="flex flex-col gap-2">
              <label htmlFor="brokerPhone" className="text-white/60 text-xs font-semibold tracking-wide">
                Broker Phone Number <span className="text-[#C5A059]">*</span>
              </label>
              <input
                type="tel"
                id="brokerPhone"
                name="brokerPhone"
                required
                value={formData.brokerPhone}
                onChange={handleChange}
                placeholder="e.g., +251 912 345 678"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Broker Email */}
            <div className="flex flex-col col-span-1 md:col-span-2 gap-2">
              <label htmlFor="brokerEmail" className="text-white/60 text-xs font-semibold tracking-wide">
                Broker Email Address <span className="text-[#C5A059]/60 font-medium">(Optional)</span>
              </label>
              <input
                type="email"
                id="brokerEmail"
                name="brokerEmail"
                value={formData.brokerEmail}
                onChange={handleChange}
                placeholder="brokername@amaanestate.com"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* OWNER SECTION */}
        <section className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-white/50 border-l-2 border-white/20 pl-3" id="owner-section-heading">
              3. Owner Details
            </h3>
            <span className="text-white/30 text-[10px] uppercase tracking-wider pl-5">Optional internal record references</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ownerName" className="text-white/60 text-xs font-semibold tracking-wide">
                Owner Name <span className="text-white/30 font-medium">(Optional)</span>
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Owner's full legal name"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>

            {/* Owner Phone */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ownerPhone" className="text-white/60 text-xs font-semibold tracking-wide">
                Owner Phone <span className="text-white/30 font-medium">(Optional)</span>
              </label>
              <input
                type="tel"
                id="ownerPhone"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="Owner's direct contact"
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* CTA ACTIONS */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={handleClear}
            className="w-full sm:w-auto px-6 h-12 rounded-xl text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
            id="clear-form-button"
          >
            Reset Form
          </button>
          
          <button
            type="submit"
            className="w-full sm:w-auto px-10 h-12 bg-[#C5A059] hover:bg-white text-[#0A0A0A] font-bold uppercase tracking-widest text-[11px] rounded-xl hover:shadow-[0_0_30px_rgba(197,160,89,0.35)] transition-all active:scale-95"
            id="submit-form-button"
          >
            Review and Submit
          </button>
        </div>
      </form>

      {/* SUCCESS POPUP OR CARD VIEW */}
      {formSubmitted && (
        <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-300 space-y-3 animate-fade-in" id="submission-success-summary">
          <p className="text-sm font-bold flex items-center gap-2">
            ✓ Under review: Property form submission payload built successfully!
          </p>
          <div className="bg-black/40 rounded-xl p-4 text-xs font-mono text-emerald-200/80 space-y-1 overflow-x-auto max-h-48 scrollbar">
            <div><strong className="text-white/40">Property:</strong> {formData.title || "n/a"}</div>
            <div><strong className="text-white/40">Price:</strong> {formData.price ? `${Number(formData.price).toLocaleString()} ${formData.currency}` : `0 ${formData.currency}`}</div>
            <div><strong className="text-white/40">Location:</strong> {formData.location || "n/a"}</div>
            <div><strong className="text-white/40">Nearby Places:</strong> {formData.nearbyPlaces || "n/a"}</div>
            <div><strong className="text-white/40">Direct Phone:</strong> {formData.phone || "n/a"}</div>
            <div><strong className="text-white/40">Details:</strong> {formData.beds} Beds | {formData.baths} Baths | {formData.showers} Showers</div>
            <div><strong className="text-white/40">Broker:</strong> {formData.brokerName} ({formData.brokerPhone})</div>
          </div>
        </div>
      )}
    </div>
  );
}
