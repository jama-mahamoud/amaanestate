import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ListingCreationModal from '@/components/listing/ListingCreationModal';

export default function CreateVehicle() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-20 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.02),transparent)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="mb-8">
          <Car className="w-12 h-12 text-[#C5A059] mx-auto mb-4" />
          <h1 className="text-3xl font-display font-medium text-white mb-2">Publish Certified Vehicle</h1>
          <p className="text-white/40 text-xs text-center max-w-md mx-auto">
            List luxury SUVs, heavy duty pickups, commercial building trucks or machinery into the active Amaan marketplace directory.
          </p>
        </div>

        {/* Instantiating ListingCreationModal as an embedded controller component configured for vehicle */}
        <ListingCreationModal 
          isOpen={true} 
          category="vehicle" 
          onClose={() => navigate('/vehicles')}
          onSuccess={() => {
            navigate('/vehicles');
          }}
        />
      </div>
    </div>
  );
}
