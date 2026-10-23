import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { calculateDistanceKm, formatDistanceKm, isWithinDeliveryRadius } from '../../utils/distance';

interface LocationPickerProps {
  storeLat: number;
  storeLon: number;
  radiusKm: number;
  deliveryEnabled?: boolean;
  initialLat?: number;
  initialLon?: number;
  onConfirmLocation: (lat: number, lon: number, distanceKm: number) => void;
  onCancel: () => void;
  title?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  storeLat,
  storeLon,
  radiusKm,
  deliveryEnabled = true,
  initialLat,
  initialLon,
  onConfirmLocation,
  onCancel,
  title = 'Tap on Map to Drop Your Location Pin',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const startLat = initialLat || storeLat;
  const startLon = initialLon || storeLon;

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number }>({
    lat: startLat,
    lon: startLon,
  });

  const distanceKm = calculateDistanceKm(selectedCoords.lat, selectedCoords.lon, storeLat, storeLon);
  const isAvailable = deliveryEnabled && isWithinDeliveryRadius(distanceKm, radiusKm);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Custom SVG markers
    const storeIcon = L.divIcon({
      className: 'fnp-store-marker',
      html: `
        <div style="background-color: #30251F; color: #FAF7F0; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(48,37,31,0.35); border: 2px solid #C5A46D;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const userIcon = L.divIcon({
      className: 'fnp-user-marker',
      html: `
        <div style="background-color: #244438; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(36,68,56,0.4); border: 2.5px solid white;">
          <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLon],
      zoom: 13,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Standard OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Delivery Radius Circle
    L.circle([storeLat, storeLon], {
      color: '#C5A46D',
      fillColor: '#C5A46D',
      fillOpacity: 0.12,
      weight: 2,
      radius: radiusKm * 1000,
    }).addTo(map);

    // Store Marker with Popup
    const storeMarker = L.marker([storeLat, storeLon], { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup('<strong>Cakes N More Sector 76</strong><br/>Shop 29, Crystal Home').openPopup();

    // User Selected Location Marker (Draggable)
    const userMarker = L.marker([startLat, startLon], {
      icon: userIcon,
      draggable: true,
    }).addTo(map);
    userMarkerRef.current = userMarker;

    userMarker.on('dragend', () => {
      const position = userMarker.getLatLng();
      setSelectedCoords({ lat: position.lat, lon: position.lng });
    });

    // Tap anywhere on map to reposition pin
    map.on('click', (e) => {
      userMarker.setLatLng(e.latlng);
      setSelectedCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    // Invalidate size once rendered
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
    };
  }, [storeLat, storeLon, radiusKm]);

  const handleResetToStore = () => {
    if (mapInstanceRef.current && userMarkerRef.current) {
      mapInstanceRef.current.setView([storeLat, storeLon], 13);
      userMarkerRef.current.setLatLng([storeLat, storeLon]);
      setSelectedCoords({ lat: storeLat, lon: storeLon });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-serif text-xl font-bold text-[#30251F]">{title}</h4>
          <p className="text-xs text-[#81776C]">Tap anywhere on the map or drag the pin to your exact delivery destination.</p>
        </div>
        <button
          type="button"
          onClick={handleResetToStore}
          className="text-xs text-[#81776C] hover:text-[#30251F] hover:underline flex items-center gap-1 shrink-0 ml-2 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Store</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E8E2D5] shadow-md">
        <div ref={mapContainerRef} className="h-64 sm:h-80 w-full z-0" />

        {/* Live Distance Pill Floating on Map */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md ${
              isAvailable
                ? 'bg-[#244438]/90 text-white border border-[#244438]/40'
                : 'bg-[#FAF7F0]/95 text-[#30251F] border border-[#E8E2D5]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span>Distance: {formatDistanceKm(distanceKm)}</span>
            <span>•</span>
            <span>{isAvailable ? `Within ${radiusKm} km ✓` : `Beyond ${radiusKm} km`}</span>
          </div>
        </div>
      </div>

      {/* Coordinates & Status Preview */}
      <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E8E2D5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
        <div className="text-[#81776C]">
          <span>Coordinates: </span>
          <strong className="text-[#30251F] font-mono">
            {selectedCoords.lat.toFixed(4)}, {selectedCoords.lon.toFixed(4)}
          </strong>
        </div>
        <div>
          {isAvailable ? (
            <span className="text-[#244438] font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Eligible for same-day delivery
            </span>
          ) : (
            <span className="text-[#81776C] font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#C5A46D]" />
              Exceeds {radiusKm} km delivery radius
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-[#E8E2D5] bg-[#FFFFFF] hover:bg-[#F3EFE6] rounded-full text-xs font-medium text-[#81776C] hover:text-[#30251F] active:scale-95 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirmLocation(selectedCoords.lat, selectedCoords.lon, distanceKm)}
          className="flex-2 py-3 px-4 rounded-full bg-[#30251F] hover:bg-[#201814] text-[#FAF7F0] font-serif font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Confirm Location ({formatDistanceKm(distanceKm)})</span>
        </button>
      </div>
    </div>
  );
};
