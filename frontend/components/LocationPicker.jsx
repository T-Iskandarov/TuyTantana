'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useLanguage } from '@/context/LanguageContext';

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

// Xaritaga bosilganda koordinatalarni olish
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onLocationSelect, mapCenter }) {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    // Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
    // Leaflet marker icon fix
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) return <div className="h-[300px] bg-[#FFFFFF] rounded-xl animate-pulse" />;

  const center = lat && lng ? [lat, lng] : [41.2995, 69.2401]; // Default: Toshkent

  return (
    <div className="space-y-2">
      <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
        <MapContainer center={center} zoom={12} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={mapCenter} />
          <ClickHandler onLocationSelect={onLocationSelect} />
          {lat && lng && <Marker position={[lat, lng]} />}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500">
        {t('location_picker_hint')}
        {lat && lng && (
          <span className="text-[#7C3AED] ml-1">
            {t('coordinates')}{lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        )}
      </p>
    </div>
  );
}
