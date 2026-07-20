'use client';
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CaretLeft, CaretRight, CastleTurret, Camera, MicrophoneStage, Scissors, ForkKnife, Eye, Car, Crown, Sparkle, Hourglass } from '@phosphor-icons/react';
import { api, IMAGE_BASE } from '@/lib/api';

const TYPE_GRADIENTS = {
  TUYXONA: 'from-[#7C3AED]/30 via-[#6D28D9]/20 to-[#8B6914]/30',
  FOTO_VIDEO: 'from-blue-500/20 via-indigo-500/20 to-purple-500/20',
  XONANDA: 'from-pink-500/20 via-rose-500/20 to-fuchsia-500/20',
  SALON: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
  RESTORAN: 'from-orange-500/20 via-red-500/20 to-rose-500/20',
  KORIK: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
  MOSHINA: 'from-slate-500/20 via-gray-500/20 to-zinc-500/20',
  LIBOS: 'from-pink-500/20 via-rose-500/20 to-fuchsia-500/20',
  BEZAK: 'from-violet-500/20 via-purple-500/20 to-indigo-500/20',
  KUTILISH: 'from-amber-500/20 via-yellow-500/20 to-orange-500/20',
};

const DEFAULT_IMAGES = {
  TUYXONA: 'https://images.unsplash.com/photo-1519167758481-83f524b72b55?q=80&w=800&auto=format&fit=crop',
  FOTO_VIDEO: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
  XONANDA: 'https://images.unsplash.com/photo-1516280440502-3c13749d6373?q=80&w=800&auto=format&fit=crop',
  SALON: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
  KORTEJ: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
};


const TYPE_ICONS = {
  TUYXONA: <CastleTurret weight="duotone" className="w-5 h-5 text-current" />,
  FOTO_VIDEO: <Camera weight="duotone" className="w-5 h-5 text-current" />,
  XONANDA: <MicrophoneStage weight="duotone" className="w-5 h-5 text-current" />,
  SALON: <Scissors weight="duotone" className="w-5 h-5 text-current" />,
  RESTORAN: <ForkKnife weight="duotone" className="w-5 h-5 text-current" />,
  KORIK: <Eye weight="duotone" className="w-5 h-5 text-current" />,
  MOSHINA: <Car weight="duotone" className="w-5 h-5 text-current" />,
  LIBOS: <Crown weight="duotone" className="w-5 h-5 text-current" />,
  BEZAK: <Sparkle weight="duotone" className="w-5 h-5 text-current" />,
  KUTILISH: <Hourglass weight="duotone" className="w-5 h-5 text-current" />,
};

function formatPrice(price, t) {
  if (!price) return '';
  return Number(price).toLocaleString('uz-UZ') + " " + t('currency_uzs');
}

export default function HeroCarousel() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  const TYPE_LABELS = {
    TUYXONA: t('service_venues'),
    FOTO_VIDEO: t('service_photo_video'),
    XONANDA: t('service_music'),
    SALON: t('service_beauty'),
    RESTORAN: 'Restoran',
    KORIK: "Ko'rik",
    MOSHINA: t('service_cars'),
    LIBOS: 'Libos',
    BEZAK: 'Bezak',
    KUTILISH: 'Kutilish',
  };

  useEffect(() => {
    api
      .getServices({ limit: 5 })
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setServices(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(services.length, 1));
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + Math.max(services.length, 1)) % Math.max(services.length, 1));
  }, [services.length]);

  // Auto-rotate
  useEffect(() => {
    if (services.length <= 1 || hovered) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [services.length, hovered, nextSlide]);

  // Default hero when no services
  if (loading) {
    return (
      <section className="relative h-[500px] lg:h-[560px] bg-[#F8F7FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">{t('loading')}</p>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="relative h-[500px] lg:h-[560px] overflow-hidden">
        {/* Beautiful default hero */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#F8F7FF] to-[#FFFFFF]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.06),transparent_50%)]" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#7C3AED]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#7C3AED]/3 rounded-full blur-3xl" />

        {/* Floating stars */}
        <div className="absolute top-1/4 left-1/4 text-[#7C3AED]/20 text-4xl animate-pulse">✦</div>
        <div className="absolute top-1/3 right-1/3 text-[#7C3AED]/15 text-2xl animate-pulse delay-1000">✧</div>
        <div className="absolute bottom-1/3 left-1/3 text-[#7C3AED]/10 text-5xl animate-pulse delay-500">★</div>

        <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
            <span className="text-xs text-[#7C3AED] font-medium tracking-wider uppercase">
              {t('platform')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#C4B5FD] to-[#7C3AED] bg-clip-text text-transparent">
              {t('hero_slide1_title')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 max-w-2xl mb-8 leading-relaxed">
            {t('hero_slide1_desc')}
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/services"
              className="px-8 py-3.5 font-semibold text-[#F8F7FF] bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-xl hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('hero_slide1_btn')}
            </a>
            <a
              href="/about"
              className="px-8 py-3.5 font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              {t('nav_about')}
            </a>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-6 mt-12 justify-center">
            {[
              { icon: <CastleTurret weight="duotone" className="w-5 h-5 text-gray-400" />, label: t('service_venues') },
              { icon: <Camera weight="duotone" className="w-5 h-5 text-gray-400" />, label: t('service_photo_video') },
              { icon: <ForkKnife weight="duotone" className="w-5 h-5 text-gray-400" />, label: t('restaurants') },
              { icon: <Crown weight="duotone" className="w-5 h-5 text-gray-400" />, label: t('dresses') }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100"
              >
                {item.icon}
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const service = services[current];
  const gradient = TYPE_GRADIENTS[service.type] || TYPE_GRADIENTS.TUYXONA;

  return (
    <section
      className="relative h-[500px] lg:h-[560px] overflow-hidden bg-[#F8F7FF]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Slides */}
      {services.map((s, idx) => {
        const g = TYPE_GRADIENTS[s.type] || TYPE_GRADIENTS.TUYXONA;
        const imageUrl = s.images && s.images.length > 0 
          ? `${IMAGE_BASE}${s.images[0].image_path}` 
          : DEFAULT_IMAGES[s.type] || DEFAULT_IMAGES.TUYXONA;
          
        return (
          <div
            key={s.id || idx}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Background */}
            <img
              src={imageUrl}
              alt={s.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8F7FF] via-[#F8F7FF]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F7FF] via-transparent to-transparent" />
            
            {/* Gradient overlay agar rasm o'rniga rang kutilsa (ixtiyoriy) */}
            <div className={`absolute inset-0 bg-gradient-to-br ${g} opacity-20 mix-blend-multiply`} />
          </div>
        );
      })}

      {/* Content overlay */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl">
            {/* Type badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-gray-200 rounded-full mb-4 animate-[slideUp_500ms_ease-out]">
              <span className="text-sm">{TYPE_ICONS[service.type] || '?'}</span>
              <span className="text-xs text-gray-700 font-medium">
                {TYPE_LABELS[service.type] || service.type}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight animate-[slideUp_500ms_ease-out_100ms_both]">
              {service.name}
            </h2>

            {/* Description */}
            {service.description && (
              <p className="text-base sm:text-lg text-gray-500 mb-6 line-clamp-2 leading-relaxed animate-[slideUp_500ms_ease-out_200ms_both]">
                {service.description}
              </p>
            )}

            {/* Price & CTA */}
            <div className="flex flex-wrap items-center gap-4 animate-[slideUp_500ms_ease-out_300ms_both]">
              {service.price && (
                <div className="px-4 py-2 bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl">
                  <span className="text-sm text-gray-400">{t('price_prefix')}</span>
                  <span className="text-lg font-bold text-[#7C3AED]">
                    {formatPrice(service.price, t)}
                  </span>
                </div>
              )}
              <a
                href={`/services/${service.id}`}
                className="px-6 py-3 font-semibold text-[#F8F7FF] bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-xl hover:shadow-lg hover:shadow-[#7C3AED]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('more_details')}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-300 shadow-sm ${
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        }`}
      >
        <CaretLeft className="w-5 h-5" weight="bold" />
      </button>
      <button
        onClick={nextSlide}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-300 shadow-sm ${
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <CaretRight className="w-5 h-5" weight="bold" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {services.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === current
                ? 'w-8 h-2 bg-[#7C3AED]'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-6 right-6 px-3 py-1 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
        <span className="text-xs text-gray-400">
          {current + 1} / {services.length}
        </span>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
