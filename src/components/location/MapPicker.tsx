import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Info } from 'lucide-react';
import axios from 'axios';

interface MapPickerProps {
  city: string;
  latitude: number | undefined;
  longitude: number | undefined;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (addressData: { city?: string; district?: string; address?: string }) => void;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Jigjiga': [9.35, 42.8],
  'Dire Dawa': [9.60, 41.86],
  'Godey': [5.95, 43.55],
  'Addis Ababa': [9.03, 38.74],
};

const DEFAULT_COORDS: [number, number] = [9.35, 42.8]; // Jigjiga

export default function MapPicker({ city, latitude, longitude, onChange, onAddressChange }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const { address } = response.data;
      
      const newAddress = {
        city: address.city || address.town || address.village || address.county || '',
        district: address.suburb || address.district || address.neighbourhood || '',
        address: response.data.display_name || ''
      };
      
      if (onAddressChange) {
        onAddressChange(newAddress);
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
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
      // Instantiate map
      map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark premium custom theme tiles from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(map);

      // Zoom buttons in the bottom right corner
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);

      // Custom Luxury Pulsing Marker icon
      const customIcon = L.divIcon({
        className: 'custom-map-picker-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-[#C5A059]/40 animate-ping" style="animation-duration: 1.5s"></div>
            <div class="absolute w-4 h-4 rounded-full bg-[#C5A059] border-2 border-white flex items-center justify-center shadow-lg">
              <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
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

      // Marker Drag Handling
      marker.on('dragend', () => {
        if (!marker) return;
        const position = marker.getLatLng();
        if (onChange) onChange(position.lat, position.lng);
        fetchAddress(position.lat, position.lng);
      });

      // Map click handling
      map.on('click', (e) => {
        if (!marker) return;
        marker.setLatLng(e.latlng);
        if (onChange) onChange(e.latlng.lat, e.latlng.lng);
        fetchAddress(e.latlng.lat, e.latlng.lng);
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

  // Smooth centering when city or programmatic coords change
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    // Use current lat/lng if valid, otherwise fallback to newly navigated city
    const hasCoordinates = latitude !== undefined && longitude !== undefined;
    const targetCenter = hasCoordinates 
      ? [latitude, longitude] as [number, number]
      : (CITY_COORDINATES[city] || DEFAULT_COORDS);

    // Check if the current center coordinates are actually different
    const currentCenter = map.getCenter();
    const distanceThreshold = 0.001; // small threshold to bypass jittering
    const isSignificantlyDifferent = 
      Math.abs(currentCenter.lat - targetCenter[0]) > distanceThreshold ||
      Math.abs(currentCenter.lng - targetCenter[1]) > distanceThreshold;

    if (isSignificantlyDifferent) {
      map.setView(targetCenter, 14, { animate: true, duration: 1 });
      marker.setLatLng(targetCenter);
      
      // If we switched city and didn't have coordinates manually set, emit them
      if (!hasCoordinates) {
        if (onChange) onChange(targetCenter[0], targetCenter[1]);
        fetchAddress(targetCenter[0], targetCenter[1]);
      }
    }
  }, [city]);

  return (
    <div className="space-y-4">
      {/* Cinematic Glassmorphism Map Wrapper */}
      <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-white/[0.01]">
        {/* Absolute Top Information Strip */}
        <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur-md border border-[#C5A059]/30 rounded-full px-4 py-2 flex items-center gap-2 max-w-[90%] pointer-events-none">
          <MapPin size={12} className="text-[#C5A059] shrink-0 animate-bounce" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] truncate">
            {latitude && longitude ? `${latitude.toFixed(5)}° N, ${longitude.toFixed(5)}° E` : 'Pinpoint on Map'}
          </span>
        </div>

        {/* Map Stage */}
        <div 
          ref={mapContainerRef} 
          className="h-[280px] md:h-[340px] w-full cursor-pointer"
          style={{ zIndex: 1 }}
        />

        {/* Dynamic Map Status indicators */}
        <div className="absolute bottom-4 left-4 z-[400] bg-[#171717]/85 backdrop-blur-md border border-white/5 rounded-full px-4 py-1.5 text-white/40 text-[9px] font-bold tracking-widest uppercase pointer-events-none">
          Click map or drag pin to position
        </div>
      </div>

      <div className="flex items-start gap-2 text-white/40 text-[10px] leading-relaxed px-1">
        <Info size={13} className="text-[#C5A059] shrink-0 mt-0.5" />
        <p>AmaanEstate utilizes OpenStreetMap cadastre positioning grids to allow seamless, double-allocation protection and coordinates matching.</p>
      </div>
    </div>
  );
}
