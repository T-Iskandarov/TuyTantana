'use client';
import { useLanguage } from '@/context/LanguageContext';
import { CastleTurret, Camera, MicrophoneStage, Scissors, Car, ClipboardText } from '@phosphor-icons/react';
export default function ServiceTabs({ activeType, onTypeChange }) {
  const { t } = useLanguage();
  
  const TABS = [
    { label: t('service_venues'), type: 'TUYXONA', icon: <CastleTurret weight="duotone" className="w-6 h-6" /> },
    { label: t('service_photo_video'), type: 'FOTO_VIDEO', icon: <Camera weight="duotone" className="w-6 h-6" /> },
    { label: t('service_music'), type: 'XONANDA', icon: <MicrophoneStage weight="duotone" className="w-6 h-6" /> },
    { label: t('service_beauty'), type: 'SALON', icon: <Scissors weight="duotone" className="w-6 h-6" /> },
    { label: t('service_cars'), type: 'KORTEJ', icon: <Car weight="duotone" className="w-6 h-6" /> },
    { label: t('service_organizers'), type: 'TASHKILOTCHI', icon: <ClipboardText weight="duotone" className="w-6 h-6" /> },
  ];

  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF] rounded-xl p-1.5 border border-gray-100">
        <div className="flex overflow-x-auto gap-1 scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => onTypeChange(tab.type)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all duration-300 flex-shrink-0
                  ${isActive
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-b-2 border-[#7C3AED] shadow-lg shadow-[#7C3AED]/5'
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="flex items-center justify-center">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
