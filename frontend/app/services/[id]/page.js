'use client';

import { useState, useEffect, use, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, IMAGE_BASE } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

// Xarita faqat client-side da yuklanishi kerak
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

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

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function ReviewsSection({ serviceId, reviews, token, user, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const { t } = useLanguage();

  const submitReview = async () => {
    if (!rating) { setMsg('❌ ' + t('leave_rating')); return; }
    if (!comment.trim()) { setMsg('❌ ' + t('write_comment')); return; }
    setLoading(true);
    setMsg('');
    try {
      const res = await api.addReview(serviceId, { rating, comment }, token);
      if (res.success) {
        setRating(0); setComment(''); setMsg('✅ ' + t('comment_saved'));
        onReviewAdded();
      } else {
        setMsg('❌ ' + (res.message || t('error_occurred')));
      }
    } catch {
      setMsg('❌ ' + t('no_server_connection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
        {t('customer_reviews')} ({reviews?.length || 0})
      </h3>
      
      {/* List reviews */}
      <div className="space-y-6 mb-8">
        {reviews?.length > 0 ? reviews.map(r => (
          <div key={r.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#F8F7FF] text-[#7C3AED] rounded-full flex items-center justify-center font-bold">
                {r.user_name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{r.user_name}</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-400 ml-2">{new Date(r.created_at).toLocaleDateString('uz-UZ')}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-13">{r.comment}</p>
          </div>
        )) : (
          <p className="text-sm text-gray-500">{t('no_reviews_yet')}</p>
        )}
      </div>

      {/* Review Form */}
      <div className="bg-[#F8F7FF] p-6 rounded-2xl border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4">{t('leave_your_opinion')}</h4>
        {user ? (
          <div className="space-y-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg className={`w-8 h-8 ${(hoveredRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={t('write_opinion_placeholder')}
              className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#7C3AED] outline-none text-sm resize-none min-h-[100px]"
            />
            <button
              onClick={submitReview}
              disabled={loading}
              className="bg-[#7C3AED] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
            >
              {loading ? t('sending') : t('leave_comment_btn')}
            </button>
            {msg && <p className={`text-sm ${msg.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>{msg}</p>}
          </div>
        ) : (
          <p className="text-sm text-gray-600 flex items-center gap-2" dangerouslySetInnerHTML={{ __html: t('login_to_leave_comment') }} />
        )}
      </div>
    </div>
  );
}

function BookingCalendar({ service, selectedDate, onSelectDate }) {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthName = currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

  const bookedDates = useMemo(() => {
    const map = new Map();
    (service.bookings || []).forEach((b) => {
      map.set(b.date, b.status || 'CONFIRMED');
    });
    return map;
  }, [service.bookings]);

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-semibold text-sm capitalize text-gray-900">{monthName}</span>
        <button type="button" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
        {[t('day_mo'), t('day_tu'), t('day_we'), t('day_th'), t('day_fr'), t('day_sa'), t('day_su')].map((d, index) => <div key={index}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} className="h-8" />;
          const dateStr = getDateStr(d);
          const date = new Date(year, month, d);
          const isPast = date < today;
          const bookedStatus = bookedDates.get(dateStr);
          const isSelected = selectedDate === dateStr;

          let btnClass = "h-8 rounded text-sm flex items-center justify-center transition-colors ";
          if (isPast) {
            btnClass += "text-gray-300 cursor-not-allowed";
          } else if (bookedStatus === 'CONFIRMED') {
            btnClass += "bg-red-50 text-red-400 cursor-not-allowed line-through";
          } else if (bookedStatus === 'PENDING') {
            btnClass += "bg-yellow-50 text-yellow-600 cursor-not-allowed";
          } else if (isSelected) {
            btnClass += "bg-[#7C3AED] text-white font-bold shadow-md shadow-[#7C3AED]/20";
          } else {
            btnClass += "bg-gray-50 text-gray-700 hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] cursor-pointer";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isPast || !!bookedStatus}
              onClick={() => onSelectDate(dateStr)}
              className={btnClass}
            >
              {d}
            </button>
          );
        })}
      </div>
      {bookedDates.size > 0 && (
         <div className="mt-4 flex flex-wrap gap-3 items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 bg-red-50 border border-red-200 rounded-sm"></div>
             <span>{t('prebooked_days')} (Tasdiqlangan)</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 bg-yellow-50 border border-yellow-200 rounded-sm"></div>
             <span>Kutilmoqda</span>
           </div>
         </div>
      )}
    </div>
  );
}

export default function ServiceDetailPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { user, token } = useAuth();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { t } = useLanguage();

  const fetchService = useCallback(async () => {
    try {
      const res = await api.getServiceById(params.id);
      if (res.success) {
        setService(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  useEffect(() => {
    if (!service?.images || service.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % service.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [service]);

  const handleBooking = async () => {
    if (!user) {
      setMessage(t('login_to_book'));
      return;
    }
    if (!selectedDate) {
      setMessage(t('please_select_date'));
      return;
    }

    setBookingLoading(true);
    setMessage('');
    try {
      const res = await api.createBooking({ service_id: parseInt(params.id), date: selectedDate }, token);
      if (res.success) {
        setMessage('✅ ' + t('successfully_booked'));
        setSelectedDate('');
        fetchService(); // Bron qilingandan so'ng ma'lumotlarni yangilash
      } else {
        setMessage('❌ ' + (res.message || t('error_occurred')));
      }
    } catch (err) {
      setMessage('❌ ' + t('server_error'));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('service_not_found')}</h1>
        <Link href="/" className="text-[#7C3AED] hover:underline">← {t('back_to_home')}</Link>
      </div>
    );
  }

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const imageUrl = service.images && service.images.length > 0
    ? getImageUrl(service.images[activeImageIndex].image_path)
    : DEFAULT_IMAGES[service.type] || DEFAULT_IMAGES.TUYXONA;

  return (
    <div className="bg-[#F8F7FF] min-h-screen flex flex-col text-gray-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t('back')}
        </Link>

        {/* Yuqori qism: Sarlavha va Rasm */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{service.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            {service.location_name && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">📍</span> {service.location_name}
              </div>
            )}
            {service.capacity && (
              <div className="flex items-center gap-1.5">
                <span className="text-lg">👥</span> {service.capacity} {t('capacity_people')}
              </div>
            )}
          </div>
          <div className="h-[300px] lg:h-[500px] relative rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-900">
            {service.images && service.images.length > 0 ? (
              service.images.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img.image_path)}
                  alt={`${service.name} ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    idx === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))
            ) : (
              <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                {t('service_' + (service.type === 'TUYXONA' ? 'venues' : service.type === 'FOTO_VIDEO' ? 'photo_video' : service.type === 'XONANDA' ? 'music' : service.type === 'SALON' ? 'beauty' : service.type === 'KORTEJ' ? 'cars' : service.type === 'TASHKILOTCHI' ? 'organizers' : service.type === 'LIBOSLAR' ? 'attire' : service.type === 'AKSESSUARLAR' ? 'accessories' : 'all')) || service.type}
              </span>
            </div>
          </div>
          
          {service.images && service.images.length > 1 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {service.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/30 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getImageUrl(img.image_path)} alt={`${service.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Asosiy ma'lumotlar qismi: 2 ta ustun */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Chap tomon (Kengroq): Tavsif, Xarita, Izohlar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Narx qismi */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('service_price')}</p>
                {(!service.price || service.price === 0 || service.price === '0') ? (
                  <p className="text-3xl lg:text-4xl font-bold text-[#7C3AED]">{t('negotiable_price') || 'Kelishilgan narxda'}</p>
                ) : (
                  <p className="text-3xl lg:text-4xl font-bold text-[#7C3AED]">{formatPrice(service.price)} <span className="text-xl text-gray-500 font-normal">{t('currency_uzs')}</span></p>
                )}
              </div>
              {service.capacity && service.capacity > 0 && service.price && service.price > 0 && (
                <div className="inline-flex items-center gap-3 bg-[#F8F7FF] px-5 py-3 rounded-xl border border-[#7C3AED]/20">
                  <span className="text-2xl">👤</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">O'rtacha / kishi</span>
                    <span className="font-bold text-[#7C3AED]">{formatPrice(Math.round(service.price / service.capacity))} so'm</span>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-gray-900 font-semibold text-xl mb-4">{t('description')}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description || t('no_description')}</p>
              
              {service.extra_services && (
                <>
                  <h3 className="text-gray-900 font-semibold text-xl mb-4">{t('extra_services') || "Qo'shimcha xizmatlar"}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.extra_services}</p>
                </>
              )}
            </div>

            {service.provider && (
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-gray-900 font-semibold mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {t('service_owner')}
                  </h3>
                  <p className="text-gray-600">{service.provider.name}</p>
                </div>
                <a href={`tel:${service.provider.phone_number}`} className="flex items-center justify-center gap-2 bg-[#F8F7FF] text-[#7C3AED] px-5 py-3 rounded-xl border border-[#7C3AED]/20 hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 transition-all font-medium text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {service.provider.phone_number}
                </a>
              </div>
            )}

            {/* Xarita qismi */}
            {service.location_lat && service.location_lng && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('address')}</h3>
                <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 relative z-0">
                  <MapView lat={service.location_lat} lng={service.location_lng} name={service.name} />
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewsSection 
              serviceId={service.id} 
              reviews={service.reviews} 
              token={token} 
              user={user} 
              onReviewAdded={fetchService} 
            />
          </div>

          {/* O'ng tomon (Qattiq yopishtirilgan / Sticky): Bron */}
          <div className="lg:col-span-1 sticky top-24 z-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('select_date')}</label>
                  <BookingCalendar 
                    service={service} 
                    selectedDate={selectedDate} 
                    onSelectDate={setSelectedDate} 
                  />
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all active:scale-[0.98] disabled:opacity-70 text-lg"
                >
                  {bookingLoading ? t('booking_in_progress') : t('book_now')}
                </button>

                {message && (
                  <p className={`text-sm text-center ${message.includes('✅') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
