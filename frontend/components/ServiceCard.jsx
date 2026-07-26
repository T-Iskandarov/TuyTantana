'use client';

import Link from 'next/link';
import { IMAGE_BASE } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { Star, Users, MapPin } from '@phosphor-icons/react';


const DEFAULT_IMAGES = {
  TUYXONA: 'https://images.unsplash.com/photo-1519167758481-83f524b72b55?q=80&w=800&auto=format&fit=crop',
  FOTO_VIDEO: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  XONANDA: 'https://images.unsplash.com/photo-1516280440502-3c13749d6373?q=80&w=800&auto=format&fit=crop',
  SALON: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  KORTEJ: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
  TASHKILOTCHI: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
  LIBOSLAR: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800&auto=format&fit=crop',
  AKSESSUARLAR: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
};

function formatPrice(price) {
  if (!price && price !== 0) return '-';
  return Number(price)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

export default function ServiceCard({ service }) {
  const { t } = useLanguage();
  
  const TYPE_LABELS = {
    TUYXONA: t('service_venues'),
    FOTO_VIDEO: t('service_photo_video'),
    XONANDA: t('service_music'),
    SALON: t('service_beauty'),
    KORTEJ: t('service_cars'),
    TASHKILOTCHI: t('service_organizers'),
    LIBOSLAR: t('service_attire') || 'Liboslar',
    AKSESSUARLAR: t('service_accessories') || 'Aksessuarlar',
  };
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const imageUrl =
    service.images && service.images.length > 0
      ? getImageUrl(service.images[0].image_path)
      : DEFAULT_IMAGES[service.type] || DEFAULT_IMAGES.TUYXONA;

  return (
    <Link href={`/services/${service.id}`} className="block group">
      <div
        className="bg-white rounded-2xl overflow-hidden border border-gray-200
                    transition-all duration-300 group-hover:scale-[1.02] group-hover:border-[#7C3AED]/30
                    group-hover:shadow-xl group-hover:shadow-[#7C3AED]/5"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-110"
          />

          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/80 backdrop-blur-md text-gray-700 text-xs font-medium
                             px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              {TYPE_LABELS[service.type] || service.type}
            </span>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-gray-900 font-semibold text-lg mb-1 line-clamp-1
                         group-hover:text-[#7C3AED] transition-colors duration-200">
            {service.name}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} weight="fill" className={`w-3.5 h-3.5 ${i < Math.round(service.average_rating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({service.reviews_count || 0})</span>
            </div>

            {/* Capacity for TUYXONA */}
            {service.type === 'TUYXONA' && service.capacity && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-1 h-1 rounded-full bg-gray-300 mr-1"></span>
                <Users className="w-3.5 h-3.5" weight="bold" />
                <span>{service.capacity} {t('capacity_people')}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {service.location_name && (
            <div className="flex items-start gap-1.5 mb-3 text-gray-500 text-xs">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" weight="bold" />
              <span className="line-clamp-2 leading-relaxed">{service.location_name}</span>
            </div>
          )}

          {/* Price and Button */}
          <div className="mt-auto pt-3 border-t border-gray-100 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{t('price')}</p>
              {(!service.price || service.price === 0 || service.price === '0') ? (
                <p className="text-[#7C3AED] font-bold text-lg line-clamp-1">{t('negotiable_price') || 'Kelishilgan narxda'}</p>
              ) : (
                <p className="text-[#7C3AED] font-bold text-xl line-clamp-1">
                  {formatPrice(service.price)}
                  <span className="text-sm font-normal text-gray-400 ml-1">{t('currency_uzs')}</span>
                </p>
              )}
            </div>
            <div
              className="w-full text-center bg-gray-50 hover:bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-medium
                         py-2.5 rounded-lg transition-all duration-200 border border-[#7C3AED]/20
                         hover:border-[#7C3AED]/40"
            >
              {t('service_details')}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
