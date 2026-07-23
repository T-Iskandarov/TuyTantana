'use client';

import { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

export default function MapView({ lat, lng, name }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !lat || !lng) return null;

  return (
    <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200">
      <YMaps query={{ apikey: '9f2ce5d6-bdc0-42ba-baab-2b7f7e914ef5' }}>
        <Map
          defaultState={{ center: [lat, lng], zoom: 15 }}
          width="100%"
          height="100%"
        >
          <Placemark 
            geometry={[lat, lng]} 
            properties={{ balloonContent: `<span class="font-semibold">${name}</span>` }} 
            modules={['geoObject.addon.balloon']}
          />
        </Map>
      </YMaps>
    </div>
  );
}
