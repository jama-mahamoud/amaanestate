import React from 'react';
import { Search, MapPin, Briefcase, RefreshCw, Star, CheckCircle, SlidersHorizontal } from 'lucide-react';

interface JobFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
  location: string;
  onLocationChange: (val: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (val: string) => void;
  employmentType: string;
  onEmploymentTypeChange: (val: string) => void;
  isVerifiedOnly: boolean;
  onVerifiedChange: (val: boolean) => void;
  onReset: () => void;
  categories: string[];
  locations: string[];
  experienceLevels: string[];
  employmentTypes: string[];
  isMobileFilterOpen: boolean;
  onCloseMobileFilter: () => void;
}

const JobFilter: React.FC<JobFilterProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  location,
  onLocationChange,
  experienceLevel,
  onExperienceLevelChange,
  employmentType,
  onEmploymentTypeChange,
  isVerifiedOnly,
  onVerifiedChange,
  onReset,
  categories,
  locations,
  experienceLevels,
  employmentTypes,
  isMobileFilterOpen,
  onCloseMobileFilter,
}) => {
  const filterContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
          <SlidersHorizontal size={16} className="text-luxury-gold" /> Filters
        </h3>
        <button 
          onClick={onReset}
          className="text-xs text-luxury-gold hover:text-luxury-gold/80 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RefreshCw size={12} /> Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Job Category</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={15} />
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer"
          >
            <option value="All" className="bg-neutral-900 text-white">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Location (Somalia)</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={15} />
          <select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer"
          >
            <option value="All" className="bg-neutral-900 text-white">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc} className="capitalize bg-neutral-900 text-white">{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Experience Level Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Experience Level</label>
        <select
          value={experienceLevel}
          onChange={(e) => onExperienceLevelChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-luxury-gold font-medium cursor-pointer"
        >
          <option value="All" className="bg-neutral-900 text-white">All Experience Levels</option>
          {experienceLevels.map((lvl) => (
            <option key={lvl} value={lvl} className="bg-neutral-900 text-white">{lvl}</option>
          ))}
        </select>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Employment Type</label>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-sm text-white/70">
            <input 
              type="radio" 
              name="employmentType" 
              checked={employmentType === 'All'} 
              onChange={() => onEmploymentTypeChange('All')} 
              className="accent-luxury-gold w-4 h-4 cursor-pointer"
            />
            <span>All Types</span>
          </label>
          {employmentTypes.map((t) => (
            <label key={t} className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-sm text-white/70 capitalize">
              <input 
                type="radio" 
                name="employmentType" 
                checked={employmentType === t} 
                onChange={() => onEmploymentTypeChange(t)} 
                className="accent-luxury-gold w-4 h-4 cursor-pointer"
              />
              <span>{t.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Verified toggle switch */}
      <div className="pt-4 border-t border-white/5">
        <label className="flex items-center justify-between gap-2 p-1.5 hover:bg-white/5 rounded-xl cursor-pointer transition-colors select-none">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-luxury-gold" />
            <div>
              <span className="text-xs font-bold text-white block">Verified Companies Only</span>
              <span className="text-[10px] text-white/50 block leading-tight">Show jobs with validated badges</span>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={isVerifiedOnly} 
            onChange={(e) => onVerifiedChange(e.target.checked)} 
            className="accent-luxury-gold w-4 h-4 rounded cursor-pointer" 
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-lg h-fit sticky top-24">
        {filterContent}
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileFilterOpen && (
        <div 
          onClick={onCloseMobileFilter}
          className="fixed inset-0 bg-[#0a0a0c]/80 z-50 lg:hidden backdrop-blur-sm transition-opacity"
        >
          {/* Mobile Drawer Panel */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 bottom-0 top-0 w-80 max-w-[85vw] bg-super-black border-r border-white/5 p-6 shadow-2xl flex flex-col h-full z-50 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider">AmaanJobs Filter</span>
              <button 
                onClick={onCloseMobileFilter}
                className="p-1 px-3 bg-white/10 hover:bg-white/15 rounded-lg text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};

export default JobFilter;
