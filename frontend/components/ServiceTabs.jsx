'use client';
import { useLanguage } from '@/context/LanguageContext';
import { CastleTurret, Camera, MicrophoneStage, Scissors, Car, ClipboardText, TShirt, Diamond } from '@phosphor-icons/react';
export default function ServiceTabs({ activeType, onTypeChange }) {
  const { t } = useLanguage();
  
  const TABS = [
    { label: t('service_venues'), type: 'TUYXONA', icon: <CastleTurret weight="duotone" className="w-6 h-6" /> },
    { label: t('service_photo_video'), type: 'FOTO_VIDEO', icon: <Camera weight="duotone" className="w-6 h-6" /> },
    { label: t('service_music'), type: 'XONANDA', icon: <MicrophoneStage weight="duotone" className="w-6 h-6" /> },
    { label: t('service_beauty'), type: 'SALON', icon: <Scissors weight="duotone" className="w-6 h-6" /> },
    { label: t('service_cars'), type: 'KORTEJ', icon: <Car weight="duotone" className="w-6 h-6" /> },
    { label: t('service_organizers'), type: 'TASHKILOTCHI', icon: <ClipboardText weight="duotone" className="w-6 h-6" /> },
    { label: t('service_attire') || 'Liboslar', type: 'LIBOSLAR', icon: <TShirt weight="duotone" className="w-6 h-6" /> },
    { label: t('service_accessories') || 'Aksessuarlar', type: 'AKSESSUARLAR', icon: <Diamond weight="duotone" className="w-6 h-6" /> },
  ];

  return (
    <div className="w-full">
      <div className="bg-[#FFFFFF] rounded-2xl p-2 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => onTypeChange(tab.type)}
                className={`
                  flex flex-col xl:flex-row items-center justify-center gap-1.5 xl:gap-2 px-2 py-2.5 rounded-xl text-xs sm:text-sm font-medium
                  transition-all duration-300 w-full text-center cursor-pointer
                  ${isActive
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED] font-semibold border-b-2 border-[#7C3AED] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <span className="flex items-center justify-center flex-shrink-0">{tab.icon}</span>
                <span className="truncate max-w-full">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
