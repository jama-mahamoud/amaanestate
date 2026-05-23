import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingService } from '@/services/listingService';
import { Loader2, AlertCircle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ListingCreationModal from '@/components/listing/ListingCreationModal';

export default function EditVehicle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchListing = async () => {
      if (!id) return;
      try {
        const data = await listingService.getListingById(id);
        if (active && data && data.category === 'vehicle') {
          setListing(data);
        }
      } catch (err) {
        console.error("Failed to fetch vehicle details for editing:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchListing();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4 text-white">
        <div className="glass-card p-10 rounded-[2rem] border border-white/10 text-center max-w-md shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
          <p className="text-white/60 text-sm mb-6">
            The listing document ID may have been deleted, or does not represent a valid vehicle asset.
          </p>
          <Button asChild className="bg-[#C5A059] text-black">
            <Link to="/vehicles">Back to Vehicles List</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-20 text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(197,160,89,0.02),transparent)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-medium text-white mb-2">Edit Vehicle Registry</h1>
          <p className="text-white/40 text-xs text-center max-w-md mx-auto">
            Review registration parameters, mileage logs and legal status for: <strong className="text-white">{listing.title}</strong>
          </p>
        </div>

        {/* Instantiating ListingCreationModal as an embedded controller component configured for vehicle */}
        <ListingCreationModal 
          isOpen={true} 
          category="vehicle" 
          listingToEdit={listing}
          onClose={() => navigate(`/vehicles/${id}`)}
          onSuccess={() => {
            navigate(`/vehicles/${id}`);
          }}
        />
      </div>
    </div>
  );
}
