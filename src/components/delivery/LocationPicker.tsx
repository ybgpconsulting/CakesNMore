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

    // Create custom SVG markers so bundler asset path issues never cause broken images
    const storeIcon = L.divIcon({
      className: 'fnp-store-marker',
      html: `
        <div style="background-color: #831843; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white;">
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
        <div style="background-color: #2563EB; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37,99,235,0.4); border: 2.5px solid white;">
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

    // Standard OpenStreetMap tiles (free, open, no secret keys required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // 10 km Delivery Radius Circle
    L.circle([storeLat, storeLon], {
      color: '#831843',
      fillColor: '#831843',
      fillOpacity: 0.08,
      weight: 1.5,
      radius: radiusKm * 1000,
    }).addTo(map);

    // Store Marker with Popup
    const storeMarker = L.marker([storeLat, storeLon], { icon: storeIcon }).addTo(map);
    storeMarker.bindPopup('<strong>Cakes N More Sector 76 Store</strong><br/>Shop 29, Crystal Home').openPopup();

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
          <h4 className="font-serif text-lg font-bold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500">Tap anywhere on the map or drag the blue pin to your delivery address.</p>
        </div>
        <button
          type="button"
          onClick={handleResetToStore}
          className="text-xs text-[#831843] hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Store</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-[#EADBDA] shadow-inner">
        <div ref={mapContainerRef} className="h-64 sm:h-80 w-full z-0" />

        {/* Live Distance Pill Floating on Map */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-md ${
              isAvailable
                ? 'bg-emerald-600/90 text-white'
                : 'bg-amber-600/90 text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Distance: {formatDistanceKm(distanceKm)}</span>
            <span>•</span>
            <span>{isAvailable ? `Within ${radiusKm} km ✓` : `Beyond ${radiusKm} km`}</span>
          </div>
        </div>
      </div>

      {/* Coordinates & Status Preview */}
      <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EADBDA] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-gray-600">
          <span>Coordinates: </span>
          <strong className="text-gray-900 font-mono">
            {selectedCoords.lat.toFixed(4)}, {selectedCoords.lon.toFixed(4)}
          </strong>
        </div>
        <div>
          {isAvailable ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Eligible for same-day delivery
            </span>
          ) : (
            <span className="text-amber-700 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
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
          className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirmLocation(selectedCoords.lat, selectedCoords.lon, distanceKm)}
          className="flex-2 py-3 px-4 bg-[#831843] hover:bg-[#6b1336] active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Confirm Location ({formatDistanceKm(distanceKm)})</span>
        </button>
      </div>
    </div>
  );
};
