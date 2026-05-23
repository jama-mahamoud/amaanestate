import { useEffect, useRef, useState, useMemo } from 'react';
import { Property } from '@/types';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ArrowUpRight, BedDouble, Bath, Square, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import L from 'leaflet';

interface MapDiscoveryProps {
  properties: Property[];
  selectedCity?: string;
  hoveredPropertyId?: string | null;
  onHoverMarker?: (id: string | null) => void;
  onCardHighlight?: (id: string) => void;
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

const getPropertyCoords = (prop: Property, index: number): [number, number] => {
  if (prop.latitude !== undefined && prop.longitude !== undefined) {
    return [prop.latitude, prop.longitude];
  }
  const cityC = CITY_COORDINATES[prop.city] || DEFAULT_COORDS;
  const scatterOffsetLat = ((index % 8) - 4) * 0.004;
  const scatterOffsetLng = (((index + 2) % 8) - 4) * 0.004;
  return [cityC[0] + scatterOffsetLat, cityC[1] + scatterOffsetLng];
};

export default function MapDiscovery({ 
  properties, 
  selectedCity = 'All', 
  hoveredPropertyId = null,
  onHoverMarker,
  onCardHighlight
}: MapDiscoveryProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
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
      try {
        const map = L.map(mapContainerRef.current, {
          center: centerCoords,
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        // Ultra premium Dark/Muted Minimalist Map Tile Layer (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20,
        }).addTo(map);

        // Add zoom control at bottom right to fit luxurious layout
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);

        map.on('zoomend', () => {
          setZoomLevel(map.getZoom());
        });

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      } catch (err) {
        console.error("Leaflet map initialization failed in MapDiscovery:", err);
      }
    } else {
      // If map exists, pan smoothly to new center coordinate
      try {
        mapInstanceRef.current.setView(centerCoords, 12, { animate: true, duration: 1.5 });
      } catch (e) {
        console.warn("Leaflet setView failed in MapDiscovery:", e);
      }
    }

    if (selectedCity && selectedCity !== 'All') {
      analyzeNeighborhood(selectedCity);
    } else {
      setAiAnalysis(null);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Leaflet map removal encountered error:", e);
        }
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, [centerCoords, selectedCity]);

  // Custom visual clustering and individual pins positioning effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Clear previous markers
    markersLayer.clearLayers();

    // Determine custom clustering spatial thresholds based on zoom
    let threshold = 0;
    if (zoomLevel < 11) {
      threshold = 0.08;
    } else if (zoomLevel === 11) {
      threshold = 0.04;
    } else if (zoomLevel === 12) {
      threshold = 0.015;
    } else if (zoomLevel === 13) {
      threshold = 0.007;
    } // Zoom >= 14 gets 0 threshold: raw coordinate dispersion

    interface MapCluster {
      center: [number, number];
      items: Property[];
    }

    const clusters: MapCluster[] = [];

    properties.forEach((prop, index) => {
      const coords = getPropertyCoords(prop, index);

      if (threshold > 0) {
        // Find existing cluster within distance threshold
        const closeCluster = clusters.find(c => {
          const latDiff = Math.abs(c.center[0] - coords[0]);
          const lngDiff = Math.abs(c.center[1] - coords[1]);
          return latDiff < threshold && lngDiff < threshold;
        });

        if (closeCluster) {
          closeCluster.items.push(prop);
          // Recalculate barycenter
          const size = closeCluster.items.length;
          closeCluster.center = [
            (closeCluster.center[0] * (size - 1) + coords[0]) / size,
            (closeCluster.center[1] * (size - 1) + coords[1]) / size
          ];
        } else {
          clusters.push({
            center: coords,
            items: [prop]
          });
        }
      } else {
        // Individual coordinate presentation
        clusters.push({
          center: coords,
          items: [prop]
        });
      }
    });

    // Render clusters/items to map layer
    clusters.forEach((clust, idx) => {
      if (clust.items.length > 1) {
        // Render Cluster Marker
        const clusterHtml = `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-3.5 rounded-full bg-[#C5A059]/15 blur-sm animate-pulse" style="animation-duration: 3s"></div>
            <div class="absolute -inset-1.5 rounded-full bg-[#C5A059]/10 animate-ping" style="animation-duration: 2s"></div>
            <div class="relative px-4 py-2 rounded-full bg-black border-2 border-[#C5A059] flex items-center gap-2 shadow-2xl transition-transform duration-200 hover:scale-110">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] whitespace-nowrap">
                ${clust.items.length} Assets
              </span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          className: 'custom-map-cluster-marker',
          html: clusterHtml,
          iconSize: [80, 44],
          iconAnchor: [40, 22]
        });

        const clusterMarker = L.marker(clust.center, { icon: clusterIcon });
        
        clusterMarker.on('click', () => {
          map.setView(clust.center, Math.min(18, zoomLevel + 2), { animate: true });
        });

        clusterMarker.addTo(markersLayer);

      } else {
        // Render Single Property Pin
        const prop = clust.items[0];
        const isHovered = hoveredPropertyId === prop.id;

        const pinHtml = `
          <div class="relative flex flex-col items-center">
            ${isHovered ? `
              <div class="absolute -inset-4 rounded-full bg-luxury-gold/30 blur-md animate-ping"></div>
              <div class="absolute -inset-2.5 rounded-full bg-luxury-gold/25 blur-sm"></div>
            ` : `
              <div class="absolute -inset-2 rounded-full bg-[#C5A059]/15 blur-sm group-hover:bg-[#C5A059]/35 transition-all duration-350"></div>
            `}
            
            <div class="relative px-3.5 py-2 rounded-xl border flex items-center justify-center shadow-2xl transition-all duration-350 ${
              isHovered 
                ? 'bg-[#C5A059] border-white text-black scale-110 z-50 -translate-y-1.5 shadow-luxury-gold/30' 
                : 'bg-neutral-900/95 border-[#C5A059]/30 text-[#C5A059] hover:border-[#C5A059] hover:-translate-y-1'
            }">
              <span class="text-[10px] font-mono leading-none font-bold tracking-tight">
                ${prop.currency === 'USD' ? `$${(prop.price / 1000).toFixed(0)}k` : `${(prop.price / 1000).toFixed(0)}k ETB`}
              </span>
            </div>
            <div class="w-2.5 h-2.5 transform rotate-45 -mt-1.5 border-r border-b shadow-md transition-all duration-350 ${
              isHovered 
                ? 'bg-[#C5A059] border-white text-black scale-110' 
                : 'bg-neutral-900/95 border-[#C5A059]/30'
            }"></div>
          </div>
        `;

        const pinIcon = L.divIcon({
          className: `custom-map-price-marker ${isHovered ? 'z-50' : 'z-20'}`,
          html: pinHtml,
          iconSize: [54, 38],
          iconAnchor: [27, 38]
        });

        const marker = L.marker(clust.center, { 
          icon: pinIcon,
          zIndexOffset: isHovered ? 1000 : 0
        });

        marker.on('click', () => {
          setSelectedProperty(prop);
          map.setView(clust.center, Math.max(14, zoomLevel), { animate: true });
          if (onCardHighlight) {
            onCardHighlight(prop.id);
          }
        });

        marker.on('mouseover', () => {
          onHoverMarker?.(prop.id);
        });

        marker.on('mouseout', () => {
          onHoverMarker?.(null);
        });

        marker.addTo(markersLayer);
      }
    });

  }, [properties, zoomLevel, hoveredPropertyId]);

  return (
    <div className="w-full h-[600px] rounded-[2.5rem] bg-luxury-charcoal/30 overflow-hidden border border-white/5 relative flex flex-col lg:flex-row shadow-2xl">
      
      {/* MAP CANVAS PANEL */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 w-full h-full relative z-0" 
        style={{ minHeight: '380px' }}
      />

      {/* FLOATING LEFT AI GEO INSIGHT LAYER */}
      <div className="absolute top-6 left-6 z-[400] w-80 max-w-[calc(100%-3rem)] pointer-events-none">
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
                  {formatPrice(selectedProperty.price, selectedProperty.currency)}
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
