import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, Info, Locate, Search, Loader2, Compass, AlertTriangle, 
  CheckCircle2, AlertCircle, Sparkles, X, Check
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface MapPickerProps {
  city: string;
  latitude: number | undefined;
  longitude: number | undefined;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (addressData: { city?: string; district?: string; address?: string }) => void;
}

interface NeighborhoodPreset {
  city: string;
  district: string;
  coords: [number, number];
}

// Highly reliable premium offline mapping presets for zero-latency lookups across the Somali region
const SYSTEM_NEIGHBORHOOD_PRESETS: NeighborhoodPreset[] = [
  // Hargeisa
  { city: 'Hargeisa', district: 'Jigiga Yar', coords: [9.5785, 44.0538] },
  { city: 'Hargeisa', district: 'Sha\'ab Area', coords: [9.5612, 44.0620] },
  { city: 'Hargeisa', district: 'Ibrahim Koodbuur', coords: [9.5822, 44.0754] },
  { city: 'Hargeisa', district: '26 June', coords: [9.5671, 44.0841] },
  { city: 'Hargeisa', district: 'Gacan Libaax', coords: [9.5532, 44.0920] },
  { city: 'Hargeisa', district: 'Maxamed Mooge', coords: [9.5350, 44.0812] },
  { city: 'Hargeisa', district: '31 May', coords: [9.5620, 44.1120] },
  { city: 'Hargeisa', district: 'Ahmed Dhagax', coords: [9.5441, 44.0482] },
  
  // Mogadishu
  { city: 'Mogadishu', district: 'Hodan', coords: [2.0521, 45.3125] },
  { city: 'Mogadishu', district: 'Wadajir', coords: [2.0163, 45.2952] },
  { city: 'Mogadishu', district: 'Shibis', coords: [2.0551, 45.3480] },
  { city: 'Mogadishu', district: 'Bondhere', coords: [2.0462, 45.3411] },
  { city: 'Mogadishu', district: 'Kaaran', coords: [2.0710, 45.3780] },
  { city: 'Mogadishu', district: 'Hamar Weyne', coords: [2.0310, 45.3372] },
  { city: 'Mogadishu', district: 'Waberi', coords: [2.0291, 45.3210] },
  { city: 'Mogadishu', district: 'Howlwadaag', coords: [2.0460, 45.3190] },
  { city: 'Mogadishu', district: 'Darkenley', coords: [2.0120, 45.2750] },
  
  // Jigjiga / Jijiga
  { city: 'Jigjiga', district: 'Xaafada 10aad', coords: [9.3560, 42.7930] },
  { city: 'Jigjiga', district: 'Xaafada 5aad', coords: [9.3480, 42.8050] },
  { city: 'Jigjiga', district: 'Xaafada 3aad', coords: [9.3420, 42.8000] },
  { city: 'Jigjiga', district: 'Kebele 06', coords: [9.3520, 42.8120] },
  { city: 'Jigjiga', district: 'Kebele 04', coords: [9.3600, 42.7850] },
  
  // Garowe
  { city: 'Garowe', district: 'Garsoor', coords: [8.4060, 48.4750] },
  { city: 'Garowe', district: 'Hodan', coords: [8.3980, 48.4890] },
  { city: 'Garowe', district: 'Jillab', coords: [8.4120, 48.4600] },
  
  // Borama
  { city: 'Borama', district: 'Sheikh Osman', coords: [9.9320, 43.1900] },
  { city: 'Borama', district: 'Baha-Dhamal', coords: [9.9250, 43.1720] },
  { city: 'Borama', district: 'Sh. Ali Jowhar', coords: [9.9400, 43.1810] },
  
  // Berbera
  { city: 'Berbera', district: 'Darole', coords: [10.4350, 45.0080] },
  { city: 'Berbera', district: 'Sahel', coords: [10.4420, 45.0220] },
  
  // Burco
  { city: 'Burco', district: 'Oktoobar', coords: [9.5210, 45.5410] },
  { city: 'Burco', district: 'Alla-Aamin', coords: [9.5150, 45.5250] },
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Jijiga': [9.35, 42.8],
  'Hargeisa': [9.56, 44.06],
  'Burco': [9.52, 45.53],
  'Berbera': [10.44, 45.01],
  'Borama': [9.93, 43.18],
  'Mogadishu': [2.04, 45.34],
  'Garowe': [8.40, 48.48],
  'Bosaso': [11.28, 49.18],
  'Kismayo': [-0.35, 42.54],
  'Galkayo': [6.76, 47.43],
  'Beledweyne': [4.73, 45.20],
  'Addis Ababa': [9.03, 38.74],
  'Dire Dawa': [9.60, 41.86],
  'Nairobi': [-1.29, 36.82],
  'Wajir': [1.75, 40.05],
  'Garissa': [-0.45, 39.64],
  'Jigjiga': [9.35, 42.8]
};

const DEFAULT_COORDS: [number, number] = [9.35, 42.8]; // Jijiga

export default function MapPicker({ city, latitude, longitude, onChange, onAddressChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom User-experience states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  
  // Readable Address representation rather than GPS coordinates
  const [friendlyAddress, setFriendlyAddress] = useState<string>('');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [highlightMap, setHighlightMap] = useState(false);

  // Offline approximation lookup based on coordinates
  const findNearestOfflinePreset = (lat: number, lng: number): NeighborhoodPreset | null => {
    let nearest: NeighborhoodPreset | null = null;
    let minDistance = Infinity;
    
    for (const preset of SYSTEM_NEIGHBORHOOD_PRESETS) {
      const dLat = preset.coords[0] - lat;
      const dLng = preset.coords[1] - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      // Ensure search radius is within roughly 15km
      if (dist < minDistance && dist < 0.15) {
        minDistance = dist;
        nearest = preset;
      }
    }
    return nearest;
  };

  const fetchAddress = async (lat: number, lng: number) => {
    setIsResolvingAddress(true);
    setGpsError(null);
    
    // Set immediate offline fallback approximation to keep UX lightning-fast
    const nearest = findNearestOfflinePreset(lat, lng);
    if (nearest) {
      setFriendlyAddress(`${nearest.city} — ${nearest.district}`);
    } else {
      setFriendlyAddress(`Position [${lat.toFixed(4)}, ${lng.toFixed(4)}]`);
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { timeout: 7000 }
      );
      const { address, display_name } = response.data;
      
      const resCity = address.city || address.town || address.village || address.county || city || '';
      const resDistrict = address.suburb || address.district || address.neighbourhood || (nearest ? nearest.district : '');
      
      // Clean display label
      let cleanLabel = '';
      if (resCity && resDistrict) {
        cleanLabel = `${resCity} — ${resDistrict}`;
      } else if (resCity) {
        cleanLabel = resCity;
      } else {
        const trimmedAddress = display_name ? display_name.split(',').slice(0, 2).join(',') : '';
        cleanLabel = trimmedAddress || `Lock [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
      }

      setFriendlyAddress(cleanLabel);
      
      const newAddress = {
        city: resCity,
        district: resDistrict,
        address: display_name || ''
      };
      
      if (onAddressChange) {
        onAddressChange(newAddress);
      }
    } catch (error) {
      console.warn("OSM Reverse geocoding failed, utilizing offline approximation preset:", error);
      // Silent recovery using the helper preset values
      if (nearest && onAddressChange) {
        onAddressChange({
          city: nearest.city,
          district: nearest.district,
          address: `${nearest.district}, ${nearest.city}, Somalia`
        });
      }
    } finally {
      setIsResolvingAddress(false);
    }
  };

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

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialCenter = latitude && longitude 
      ? [latitude, longitude] as [number, number]
      : (CITY_COORDINATES[city] || DEFAULT_COORDS);

    let map: L.Map | null = null;
    let marker: L.Marker | null = null;

    try {
      // Instantiate map optimized for fluid mobile interaction with tap support
      map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        tap: true, // leaf-let mobile-tap optimization
      } as any);

      // Dark premium custom theme tiles from CartoDB (Loads incredibly rapid on slow connections)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      // Re-position zoom controls to bottom-right corner out of mobile thumb zones
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Custom Luxury Gold pulsing indicator
      const customIcon = L.divIcon({
        className: 'custom-map-picker-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-10 h-10 rounded-full bg-[#C5A059]/30 animate-pulse" style="animation-duration: 1.5s"></div>
            <div class="absolute w-5 h-5 rounded-full bg-[#C5A059] border-2 border-white flex items-center justify-center shadow-2xl">
              <div class="w-2 h-2 rounded-full bg-black"></div>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Add Draggable marker
      marker = L.marker(initialCenter, {
        icon: customIcon,
        draggable: true
      }).addTo(map);

      // Record initial coordinates
      if (!latitude || !longitude) {
        if (onChange) onChange(initialCenter[0], initialCenter[1]);
        fetchAddress(initialCenter[0], initialCenter[1]);
      } else {
        fetchAddress(initialCenter[0], initialCenter[1]);
      }

      // Marker Drag End Handling
      marker.on('dragend', () => {
        if (!marker) return;
        const position = marker.getLatLng();
        if (onChange) onChange(position.lat, position.lng);
        fetchAddress(position.lat, position.lng);
        setHighlightMap(false);
      });

      // Map single tap to pin location (Extremely responsive mobile navigation)
      map.on('click', (e) => {
        if (!marker) return;
        marker.setLatLng(e.latlng);
        if (onChange) onChange(e.latlng.lat, e.latlng.lng);
        fetchAddress(e.latlng.lat, e.latlng.lng);
        setHighlightMap(false);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } catch (err) {
      console.error("Leaflet map initialization failed in MapPicker:", err);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error during Leaflet map cleanup in MapPicker:", e);
        }
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Center smoothly when standard City prop changes
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    const targetCenter = hasCoordinates 
      ? [latitude, longitude] as [number, number]
      : (CITY_COORDINATES[city] || DEFAULT_COORDS);

    const currentCenter = map.getCenter();
    const distanceThreshold = 0.005;
    const isSignificantlyDifferent = 
      Math.abs(currentCenter.lat - targetCenter[0]) > distanceThreshold ||
      Math.abs(currentCenter.lng - targetCenter[1]) > distanceThreshold;

    if (isSignificantlyDifferent) {
      map.setView(targetCenter, 14, { animate: true, duration: 1 });
      marker.setLatLng(targetCenter);
      
      if (!hasCoordinates) {
        if (onChange) onChange(targetCenter[0], targetCenter[1]);
        fetchAddress(targetCenter[0], targetCenter[1]);
      }
    }
  }, [city]);

  // Handle "Use My Current Location" GPS automatic detection trigger with reliable retry logic
  const handleAcquireLocation = () => {
    if (!navigator.geolocation) {
      const errMsg = "Your device or browser doesn't support automatic location search.";
      setGpsError(errMsg);
      toast.error(errMsg);
      return;
    }

    setIsLocating(true);
    setGpsError(null);
    setHighlightMap(false);

    // Modern multi-level retry system that works wonderfully on low-end phones & inside buildings
    const executeLocationLookup = (highAccuracy: boolean, isRetry: boolean) => {
      const geoOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 5000 : 7000, // Shorter timeout first of 5s to trigger fast fallback retry
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: gpsLat, longitude: gpsLng } = position.coords;
          
          const map = mapRef.current;
          const marker = markerRef.current;
          
          if (onChange) {
            onChange(gpsLat, gpsLng);
          }

          if (map && marker) {
            const latLng: [number, number] = [gpsLat, gpsLng];
            map.setView(latLng, 16, { animate: true, duration: 1 });
            marker.setLatLng(latLng);
          }

          // Fetch readable title
          fetchAddress(gpsLat, gpsLng);
          setIsLocating(false);
          setHighlightMap(false);
          toast.success("Successfully found your location!");
        },
        (error) => {
          if (!isRetry) {
            console.log("High accuracy satellilte connection busy, retrying with robust cell-tower fallback...");
            // Automatically retry once with low accuracy (high reliability, loads instantaneously on phones)
            executeLocationLookup(false, true);
          } else {
            setIsLocating(false);
            console.warn("Device location search did not succeed:", error);
            
            let userFriendlyMsg = "We couldn't access your exact location. You can still choose your property location manually on the map.";
            if (error.code === error.PERMISSION_DENIED) {
              userFriendlyMsg = "We couldn't access your exact electronic location because permission was denied. You can still set your property location manually on the map.";
            } else {
              userFriendlyMsg = "Location could not be detected automatically. Please select your location on the map by tapping your neighborhood.";
            }
            
            setGpsError(userFriendlyMsg);
            setHighlightMap(true);
            toast.info("We couldn't find your exact location automatically. Please tap your neighborhood on the map instead.");
          }
        },
        geoOptions
      );
    };

    // Begin primary lookup
    executeLocationLookup(true, false);
  };

  // Set preset destination coordinates instantly (zero-latency offline action)
  const handleSelectPreset = (preset: NeighborhoodPreset) => {
    const map = mapRef.current;
    const marker = markerRef.current;
    
    if (onChange) {
      onChange(preset.coords[0], preset.coords[1]);
    }
    
    if (map && marker) {
      map.setView(preset.coords, 15, { animate: true, duration: 0.8 });
      marker.setLatLng(preset.coords);
    }
    
    // Immediately set readable status before calling Nominatim refinement
    setFriendlyAddress(`${preset.city} — ${preset.district}`);
    setHighlightMap(false);
    if (onAddressChange) {
      onAddressChange({
        city: preset.city,
        district: preset.district,
        address: `${preset.district}, ${preset.city}, Somalia`
      });
    }

    // Attempt API validation silently in the background
    fetchAddress(preset.coords[0], preset.coords[1]);
    setSearchQuery('');
    setSearchResults([]);
    toast.success(`Positioned at ${preset.district}`);
  };

  // Lookup custom query inside OpenStreetMap Atlas with query timeout fallback
  const handleSearchAtlas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setGpsError(null);

    // Apply strict regional filters to prioritize results in Somali region/East Africa
    const queryTerm = `${searchQuery.trim()}, East Africa`;

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryTerm)}&limit=5`,
        { timeout: 7000 }
      );
      
      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
      } else {
        // Fallback to searching raw term
        const secondaryResponse = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=5`,
          { timeout: 7000 }
        );
        if (secondaryResponse.data && secondaryResponse.data.length > 0) {
          setSearchResults(secondaryResponse.data);
        } else {
          toast.info("No matching map position found. Try dragging the map pin manually.");
        }
      }
    } catch (err) {
      console.warn("OSM Atlas search failed", err);
      toast.error("Network slow. Use offline local neighborhood chips below instead!");
    } finally {
      setIsSearching(false);
    }
  };

  // Map Nominatim search results back to coordinate structures
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    const map = mapRef.current;
    const marker = markerRef.current;
    
    if (onChange) {
      onChange(lat, lng);
    }
    
    if (map && marker) {
      map.setView([lat, lng], 15, { animate: true, duration: 1 });
      marker.setLatLng([lat, lng]);
    }

    // Sync clean names back to fields
    const dispName = result.display_name;
    const parts = dispName.split(',');
    
    // Roughly estimate neighborhood details
    const resolvedAddress = {
      city: parts[2]?.trim() || parts[1]?.trim() || city,
      district: parts[0]?.trim() || '',
      address: dispName
    };

    setFriendlyAddress(`${resolvedAddress.city} — ${resolvedAddress.district || 'Verified Area'}`);
    setHighlightMap(false);
    
    if (onAddressChange) {
      onAddressChange(resolvedAddress);
    }
    
    setSearchResults([]);
    setSearchQuery('');
    toast.success("Coordinates mapped successfully");
  };

  // Filter local presets for quick-interactive chips matching currently selected city
  const filteredPresets = SYSTEM_NEIGHBORHOOD_PRESETS.filter(
    preset => preset.city.toLowerCase() === city.toLowerCase()
  );

  return (
    <div className="space-y-4 text-white font-sans w-full">
      
      {/* 1. Selected Location Human-Friendly Overlay Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059] shrink-0">
            {isResolvingAddress ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MapPin size={18} className="animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5A059] uppercase block mb-0.5">Selected Property Address</span>
            <p className="text-white text-sm font-semibold tracking-tight truncate max-w-[320px] md:max-w-[400px]">
              {friendlyAddress || `Standby... (Default Center of ${city})`}
            </p>
          </div>
        </div>
        
        {/* Subtle coordinate overlay so they always remain in parent records */}
        {latitude && longitude && (
          <div className="flex items-center gap-1.5 self-start md:self-center px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 font-mono text-[9px] text-white/40">
            <span>GPS:</span>
            <span>{latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E</span>
          </div>
        )}
      </div>

      {/* 2. Unified Search & Autocomplete Hud */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-[500]">
        
        {/* Lookup input bar */}
        <form onSubmit={handleSearchAtlas} className="md:col-span-12 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder={`Search specific area or landmark in ${city} (e.g. Jigiga Yar, Hodan, Maansoor...)`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/5 focus:border-[#C5A059]/30 h-11 pl-11 pr-4 rounded-xl text-xs text-white placeholder:text-white/30 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white shrink-0 p-1 rounded-full hover:bg-white/5"
              >
                <X size={12} />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-[#C5A059] text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            {isSearching ? <Loader2 size={12} className="animate-spin" /> : <Compass size={12} />}
            <span>Lock</span>
          </button>
        </form>

        {/* Dynamic searchable dropdown display */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-12 bg-[#121212] border border-white/10 rounded-xl shadow-2xl p-1 max-h-[220px] overflow-y-auto divide-y divide-white/5 z-[600]">
            <div className="px-3 py-1.5 text-[8px] font-bold text-white/40 uppercase tracking-widest bg-white/[0.01]">Matched Search Coordinates</div>
            {searchResults.map((res, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 transition-colors text-xs text-white/80 hover:text-white flex items-center gap-2"
              >
                <MapPin size={11} className="text-[#C5A059] shrink-0" />
                <span className="truncate">{res.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. GPS Signal / Alert Warning Box */}
      {gpsError && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3 text-amber-400 select-none animate-pulse-subtle z-10 relative">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block mb-1">GPS Assistance</span>
            <p className="leading-relaxed font-light text-white/70">{gpsError}</p>
          </div>
        </div>
      )}

      {/* 5. Quick-Tap neighborhood chips matching chosen city (Zero network dependancy!) */}
      {filteredPresets.length > 0 && (
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-[9px] text-[#C5A059] font-black uppercase tracking-widest select-none">
            <Sparkles size={11} />
            <span>Fast-Pin Popular Neighborhoods (Recommended offline)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.district}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-3 py-1.5 bg-white/5 border border-white/5 hover:bg-[#C5A059]/10 hover:border-[#C5A059]/30 text-white/70 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
              >
                <span>+</span>
                <span>{preset.district}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Primary Location Action Button */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleAcquireLocation}
          className="w-full sm:w-auto px-6 py-3 bg-[#C5A059] text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isLocating ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>Scanning GPS Satellite Signal...</span>
            </>
          ) : (
            <>
              <Locate size={13} className="group-hover:scale-110 transition-transform" />
              <span>📍 Use My Current Location</span>
            </>
          )}
        </button>
      </div>

      {/* 7. Actual Map Canvas Container */}
      <div className={`relative rounded-2xl overflow-hidden border transition-all duration-500 shadow-2xl bg-white/[0.01] ${
        highlightMap 
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.25)] scale-[1.01]' 
          : 'border-white/10'
      }`}>
        {/* Floating Instruction overlay inside map */}
        <div className="absolute top-3 left-3 z-[400] bg-black/80 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5 select-none pointer-events-none">
          <span className="text-[8px] uppercase font-bold tracking-widest text-white/70 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${highlightMap ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-ping'}`} />
            {highlightMap 
              ? 'Tap anywhere on the map to place your property location' 
              : 'Tap anywhere on the map grid to lock property pin'}
          </span>
        </div>

        {/* Map Canvas */}
        <div 
          ref={mapContainerRef} 
          className="h-[280px] md:h-[320px] w-full cursor-pointer relative z-10"
        />

        {/* Dynamic loader overlay during reverse address resolving */}
        {isResolvingAddress && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 z-[410] font-sans">
            <Loader2 size={16} className="text-[#C5A059] animate-spin" />
            <span className="text-xs font-medium tracking-wide text-white/80">Refining cadastral coordinates mapping...</span>
          </div>
        )}
      </div>

      {/* Helper Guidance text */}
      <div className="flex items-start gap-2 text-white/30 text-[9px] leading-relaxed px-1">
        <Info size={12} className="text-[#C5A059] shrink-0 mt-0.5" />
        <p>AmaanEstate utilizes OpenStreetMap satellite mapping arrays. If GPS tracker triggers fail on your device, type your block name in search, click one of our regional preset neighborhood chips, or drag the gold pin manually to align exactly onto your property.</p>
      </div>

    </div>
  );
}
