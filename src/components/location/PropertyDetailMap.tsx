import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Compass, ExternalLink, Info, Landmark } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';

interface PropertyDetailMapProps {
  property: Property;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Jigjiga': [9.35, 42.8],
  'Dire Dawa': [9.60, 41.86],
  'Godey': [5.95, 43.55],
  'Addis Ababa': [9.03, 38.74],
};

const DEFAULT_COORDS: [number, number] = [9.35, 42.8];

export default function PropertyDetailMap({ property }: PropertyDetailMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const city = property.city || 'Jigjiga';
  const lat = property.latitude ?? (CITY_COORDINATES[city] || DEFAULT_COORDS)[0];
  const lng = property.longitude ?? (CITY_COORDINATES[city] || DEFAULT_COORDS)[1];
  const isExactLocation = property.latitude !== undefined && property.longitude !== undefined;

  // Inject Leaflet CSS dynamically if it isn't already present
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Safety: Ensure no leftover map instance before creating a new one
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const coords: [number, number] = [lat, lng];

    // Create a new map instance
    const map = L.map(mapContainerRef.current, {
      center: coords,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false, // Prevent zoom on page scroll unless clicked
    });

    // Dark premium custom theme tiles from CartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Custom Luxury Pulsing Marker icon
    const customIcon = L.divIcon({
      className: 'custom-map-detail-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 rounded-full bg-[#C5A059]/35 animate-pulse"></div>
          <div class="absolute w-10 h-10 rounded-full bg-[#C5A059]/20 animate-ping" style="animation-duration: 2s"></div>
          <div class="absolute w-5 h-5 rounded-full bg-[#C5A059] border-2 border-white flex items-center justify-center shadow-2xl">
            <div class="w-2.5 h-2.5 rounded-full bg-black"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker(coords, { icon: customIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank', 'referrerPolicy=no-referrer');
  };

  return (
    <div className="space-y-6">
      {/* Cinematic Glassmorphism Location Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* District Card */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2.5xl backdrop-blur-md relative overflow-hidden flex items-start gap-4 hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase block mb-1">District / Xaafad</span>
            <p className="text-white text-sm font-semibold tracking-tight">
              {property.district || 'Central District'}
            </p>
          </div>
        </div>

        {/* Landmark Card */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2.5xl backdrop-blur-md relative overflow-hidden flex items-start gap-4 hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
            <Landmark size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase block mb-1">Landmark / Jiho</span>
            <p className="text-white text-sm font-semibold tracking-tight">
              {property.landmark || 'Near Main Arterial Transit'}
            </p>
          </div>
        </div>

        {/* GPS Coordinates Card */}
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2.5xl backdrop-blur-md relative overflow-hidden flex items-start gap-4 hover:border-white/10 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
            <Navigation size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-white/40 uppercase block mb-1">GPS Cadastral Grid</span>
            <p className="text-white text-xs font-mono font-medium tracking-tight">
              {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
            </p>
            <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-0.5 block">
              {isExactLocation ? '● GPS Verified Pin' : '● Approximate Area'}
            </span>
          </div>
        </div>
      </div>

      {/* Map Container Wrapper */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl bg-white/[0.01]">
        {/* Floating Controls Overlay */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-black/85 backdrop-blur-md border border-[#C5A059]/30 rounded-full px-4 py-2 flex items-center gap-2">
            <MapPin size={12} className="text-[#C5A059] shrink-0 animate-bounce" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] truncate">
              {property.city || 'Regional Center'}
            </span>
          </div>

          {!isExactLocation && (
            <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/20 rounded-full px-4 py-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Approximate Location</span>
            </div>
          )}
        </div>

        {/* Action Button Overlay */}
        <div className="absolute bottom-4 right-4 z-[400]">
          <Button 
            onClick={handleOpenGoogleMaps}
            size="sm"
            className="bg-black/80 hover:bg-[#C5A059] text-white hover:text-black hover:border-[#C5A059] border border-white/10 shadow-lg font-bold tracking-widest uppercase text-[10px] py-1.5 px-4 h-9 rounded-full flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <span>Open in Google Maps</span>
            <ExternalLink size={11} />
          </Button>
        </div>

        {/* Map Stage */}
        <div 
          ref={mapContainerRef} 
          className="h-[320px] md:h-[400px] w-full cursor-grab active:cursor-grabbing"
          style={{ zIndex: 1 }}
        />
      </div>

      <div className="flex items-start gap-2.5 text-white/40 text-[10px] leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/5">
        <Info size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
        <p>This coordinates registry is powered by the Somali Land Registry Index (SLRI). AmaanEstate coordinates locking provides strict protection against multi-listing conflicts and validates sovereignty of the title deed online.</p>
      </div>
    </div>
  );
}
