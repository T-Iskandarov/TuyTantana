'use client';

import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import { useLanguage } from '@/context/LanguageContext';

export default function LocationPicker({ lat, lng, onLocationSelect, mapCenter }) {
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const mapRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.setCenter(mapCenter, 12, { checkZoomRange: true, duration: 300 });
    }
  }, [mapCenter]);

  if (!mounted) return <div className="h-[300px] bg-[#FFFFFF] rounded-xl animate-pulse" />;

  const center = lat && lng ? [lat, lng] : (mapCenter || [41.2995, 69.2401]); // Default: Toshkent

  return (
    <div className="space-y-2">
      <div className="h-[300px] rounded-xl overflow-hidden border border-gray-200">
        <YMaps query={{ apikey: '9f2ce5d6-bdc0-42ba-baab-2b7f7e914ef5' }}>
          <Map
            instanceRef={mapRef}
            state={{ center: center, zoom: 12 }}
            width="100%"
            height="100%"
            onClick={(e) => {
              const coords = e.get('coords');
              onLocationSelect(coords[0], coords[1]);
            }}
          >
            {lat && lng && <Placemark geometry={[lat, lng]} />}
          </Map>
        </YMaps>
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
