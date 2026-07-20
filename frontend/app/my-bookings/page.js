'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api, IMAGE_BASE } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

function formatPrice(p) {
  return Number(p).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

export default function MyBookingsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ totalBookings: 0, activeBookings: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { t } = useLanguage();

  const statusMap = {
    PENDING: { label: t('status_pending'), cls: 'bg-yellow-500/10 text-yellow-600' },
    CONFIRMED: { label: t('status_confirmed'), cls: 'bg-green-500/10 text-green-600' },
    CANCELLED: { label: t('status_cancelled'), cls: 'bg-red-500/10 text-red-600' },
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'USER')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!token) return;
    const fetchBookings = async () => {
      try {
        const res = await api.getMyBookings(token);
        if (res.success) {
          setBookings(res.data || []);
          setCurrentPage(1);
          setSummary(res.summary || { totalBookings: 0, activeBookings: 0, totalPrice: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token]);

  if (authLoading || (!user || user.role !== 'USER')) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-[#F8F7FF] text-gray-900 min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8 animate-fadeIn">
          {/* Sarlavha */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('my_bookings_title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('my_bookings_hello').replace('{name}', user.name)}</p>
          </div>

          {/* Statistika */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
              <p className="text-sm text-gray-500 mb-1">{t('total_bookings') || "Jami bronlar"}</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm flex flex-col justify-between bg-green-50/30">
              <p className="text-sm text-green-600 mb-1">{statusMap.CONFIRMED.label}</p>
              <p className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'CONFIRMED').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-yellow-200 p-5 shadow-sm flex flex-col justify-between bg-yellow-50/30">
              <p className="text-sm text-yellow-600 mb-1">{statusMap.PENDING.label}</p>
              <p className="text-3xl font-bold text-yellow-600">{bookings.filter(b => b.status === 'PENDING').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm flex flex-col justify-between bg-red-50/30">
              <p className="text-sm text-red-600 mb-1">{statusMap.CANCELLED.label}</p>
              <p className="text-3xl font-bold text-red-600">{bookings.filter(b => b.status === 'CANCELLED').length}</p>
            </div>
          </div>

          {/* Bronlar royxati */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl block mb-3">{'\\u{1F4CB}'}</span>
              <p className="text-gray-500">{t('no_bookings_yet')}</p>
              <button onClick={() => router.push('/')} className="text-[#7C3AED] hover:underline text-sm mt-2">
                {t('view_services')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((booking) => {
                const s = booking.service;
                const st = statusMap[booking.status] || statusMap.PENDING;
                const img = s?.images?.[0]?.image_path;

                return (
                  <div key={booking.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 hover:border-[#7C3AED]/20 hover:shadow-sm transition-all">
                    {/* Rasm */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                      {img ? (
                        <img src={`${IMAGE_BASE}${img}`} alt={s?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">{'\\u{1F3E2}'}</div>
                      )}
                    </div>

                    {/* Malumot */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{s?.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s?.provider?.name} - {s?.location_name}
                      </p>
                    </div>

                    {/* Sana */}
                    <div className="text-right shrink-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(booking.date).toLocaleDateString('uz-UZ')}
                      </p>
                      <p className="text-xs text-[#7C3AED] font-semibold mt-0.5">
                        {formatPrice(s?.price)} {t('currency_uzs')}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-2xl">
                  <span className="text-sm text-gray-500">
                    {startIndex + 1} - {Math.min(startIndex + itemsPerPage, bookings.length)} / {bookings.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Oldingi
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Keyingi
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
