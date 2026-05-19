import { useEffect, useRef, useState, useMemo } from 'react';
import { Property } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ArrowUpRight, BedDouble, Bath, Square, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import L from 'leaflet';

interface MapDiscoveryProps {
  properties: Property[];
  selectedCity?: string;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Jigjiga': [9.35, 42.8],
  'Dire Dawa': [9.60, 41.86],
  'Godey': [5.95, 43.55],
  'Dhagaxbur': [8.20, 43.56],
  'Qabridaha': [7.21, 44.27],
  'Addis Ababa': [9.03, 38.74],
};

const DEFAULT_COORDS: [number, number] = [9.35, 42.8]; // Jigjiga

export default function MapDiscovery({ properties, selectedCity = 'All' }: MapDiscoveryProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

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

  // Compute map center coordinate based on selected city or listed items
  const centerCoords = useMemo(() => {
    if (selectedCity && selectedCity !== 'All' && CITY_COORDINATES[selectedCity]) {
      return CITY_COORDINATES[selectedCity];
    }
    if (properties.length > 0) {
      const firstWithCity = properties.find(p => CITY_COORDINATES[p.city]);
      if (firstWithCity) {
        return CITY_COORDINATES[firstWithCity.city];
      }
    }
    return DEFAULT_COORDS;
  }, [selectedCity, properties]);

  // Handle Simulated AI Recommendation based on geographic clusters
  const analyzeNeighborhood = (city: string) => {
    setAnalyzing(true);
    setAiAnalysis(null);
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Jigjiga': 'AI REPORT: Jigjiga Central is showing premium capital appreciation (est. 14.5% YoY) driven by expanding diaspora investments. High demand exists for multi-family residential units near the Presidential Palace.',
        'Dire Dawa': 'AI REPORT: Dire Dawa properties benefit from the Free Trade Zone transit corridor, rendering warehouses and modern houses extremely lucrative assets with 9.2% average net rental yield projections.',
        'Godey': 'AI REPORT: Godey real estate is in its hyper-growth infancy. New infrastructure development along the Shabelle River front exhibits strong long-term prospects for high-value land acquisition.',
        'Addis Ababa': 'AI REPORT: Addis Ababa houses remain premium flagship assets. Bole and Old Airport districts show resilient luxury pricing index benchmarks with peak luxury demand metrics.',
      };
      setAiAnalysis(responses[city] || 'AI REPORT: Stable regional index. Strong local sentiment and security shields make Somali Region diaspora acquisitions highly favorable for long-term yields.');
      setAnalyzing(false);
    }, 1200);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet instance if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Ultra premium Dark/Muted Minimalist Map Tile Layer (CartoDB Dark Matter)
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      // Add zoom control at bottom right to fit luxurious layout
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    } else {
      // If map exists, pan smoothly to new center coordinate
      mapInstanceRef.current.setView(centerCoords, 12, { animate: true, duration: 1.5 });
    }

    if (selectedCity && selectedCity !== 'All') {
      analyzeNeighborhood(selectedCity);
    } else {
      setAiAnalysis(null);
    }
  }, [centerCoords, selectedCity]);

  // Update listing markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // Map each property to clean coordinates
    properties.forEach((prop, index) => {
      const cityC = CITY_COORDINATES[prop.city] || DEFAULT_COORDS;
      // Add subtle scattering offset to avoid overlapping identical cities
      const scatterOffsetLat = ((index % 5) - 2) * 0.006;
      const scatterOffsetLng = (((index + 3) % 5) - 2) * 0.006;
      const finalCoords: [number, number] = [
        cityC[0] + scatterOffsetLat,
        cityC[1] + scatterOffsetLng
      ];

      // Custom styled HTML Div Marker with luxury look
      const customIcon = L.divIcon({
        className: 'custom-map-price-marker',
        html: `
          <div class="relative group flex flex-col items-center">
            <!-- Pulsing outer luxury gold glow circle -->
            <div class="absolute -inset-1.5 rounded-full bg-[#C5A059]/30 blur-sm group-hover:bg-[#C5A059]/50 transition-all duration-300 animate-ping" style="animation-duration: 2s"></div>
            <!-- Elegant Price tag box -->
            <div class="relative px-3 py-1.5 rounded-lg bg-[#171717] border border-[#C5A059]/40 group-hover:border-[#C5A059] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
              <span class="text-[10px] font-bold tracking-tight text-[#C5A059]">$${(prop.price / 1000).toFixed(0)}k</span>
            </div>
            <!-- Little pointer arrow bottom -->
            <div class="w-2 h-2 bg-[#171717] border-r border-b border-[#C5A059]/40 transform rotate-45 -mt-1 group-hover:border-[#C5A059] transition-all"></div>
          </div>
        `,
        iconSize: [50, 36],
        iconAnchor: [25, 36],
      });

      const marker = L.marker(finalCoords, { icon: customIcon });
      
      marker.on('click', () => {
        setSelectedProperty(prop);
        map.setView(finalCoords, 13, { animate: true });
      });

      marker.addTo(markersLayer);
    });
  }, [properties]);

  return (
    <div className="w-full h-[600px] rounded-[2.5rem] bg-luxury-charcoal/30 overflow-hidden border border-white/5 relative flex flex-col lg:flex-row shadow-2xl">
      
      {/* MAP CANVAS PANEL */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full h-full relative z-0" 
        style={{ minHeight: '380px' }}
      />

      {/* FLOATING LEFT AI GEO INSIGHT LAYER */}
      <div className="absolute top-6 left-6 z-10 w-80 max-w-[calc(100%-3rem)] pointer-events-none">
        <AnimatePresence>
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card pointer-events-auto p-5 rounded-2xl border border-[#C5A059]/20 bg-luxury-black/95 shadow-xl shadow-black/60 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-xl rounded-full" />
              <div className="flex items-center gap-2 text-luxury-gold text-xs font-bold uppercase tracking-widest mb-3">
                <Sparkles size={14} className="animate-pulse" />
                <span>Geographic Intelligence</span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed font-light">{aiAnalysis}</p>
            </motion.div>
          )}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card pointer-events-auto px-4 py-3 rounded-xl border border-white/5 bg-luxury-black/90 flex items-center gap-3 text-white/50 text-xs shadow-lg"
            >
              <div className="w-2 h-2 rounded-full bg-luxury-gold animate-bounce" />
              <span>Analyzing market indices for {selectedCity}...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SLIDE-OVER LUXURY PROPERTY CARD (IF SELECTED ELEMENT) */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute lg:relative lg:inset-y-0 right-4 lg:right-0 bottom-4 lg:bottom-auto z-10 lg:z-auto w-[calc(100%-2rem)] lg:w-96 glass-card bg-luxury-black/95 p-6 border-l border-white/10 lg:border-t-0 lg:border-b-0 lg:border-r-0 lg:flex lg:flex-col lg:justify-between rounded-2xl lg:rounded-none group shadow-2xl lg:shadow-none shrink-0"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                  {selectedProperty.listingType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
                </div>
                <button 
                  onClick={() => setSelectedProperty(null)}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Photo */}
              <div className="aspect-[16/10] w-full rounded-xl overflow-hidden mb-4 relative bg-white/5">
                <img 
                  src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={selectedProperty.title}
                />
              </div>

              {/* Title, Location & Price */}
              <div className="space-y-2 mb-4">
                <h4 className="text-white font-display font-bold text-lg leading-tight truncate group-hover:text-luxury-gold transition-colors">
                  {selectedProperty.title}
                </h4>
                <div className="flex items-center text-white/40 text-xs">
                  <MapPin size={12} className="text-luxury-gold mr-1" />
                  <span>{selectedProperty.location || selectedProperty.city}</span>
                </div>
                <p className="text-xl font-display font-black text-[#C5A059] tabular-nums mt-1">
                  ${selectedProperty.price?.toLocaleString()}
                </p>
              </div>

              {/* Core Specs */}
              <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5 text-center">
                <div className="bg-white/5 p-2 rounded-lg">
                  <BedDouble size={14} className="text-[#C5A059] mx-auto mb-1 opacity-60" />
                  <p className="text-[10px] text-white/60 font-bold">{selectedProperty.beds || '-'} Beds</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <Bath size={14} className="text-[#C5A059] mx-auto mb-1 opacity-60" />
                  <p className="text-[10px] text-white/60 font-bold">{selectedProperty.baths || '-'} Baths</p>
                </div>
                <div className="bg-white/5 p-2 rounded-lg">
                  <Square size={14} className="text-[#C5A059] mx-auto mb-1 opacity-60" />
                  <p className="text-[10px] text-white/60 font-bold truncate">{selectedProperty.size || '-'}</p>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="pt-4 lg:pt-0 border-t border-white/5 lg:border-t-0">
              <Button asChild className="w-full h-12 rounded-xl bg-[#C5A059] text-black font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-[#C5A059]/20 transition-all cursor-pointer">
                <Link to={`/properties/${selectedProperty.id}`}>
                  Analyze Asset <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
