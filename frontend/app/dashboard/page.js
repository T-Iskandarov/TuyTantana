'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Briefcase, ShoppingCart, Clock, CheckCircle, XCircle } from '@phosphor-icons/react';
import { useLanguage } from '@/context/LanguageContext';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ services: 0, bookings: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'status', direction: 'asc' });
  const itemsPerPage = 10;
  const { t } = useLanguage();

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.getMyServices(token),
        api.getProviderBookings(token),
      ]);
      const services = servicesRes.data || [];
      const bookings = bookingsRes.data || [];

      setStats({
        services: services.length,
        bookings: bookings.length,
        pending: bookings.filter((b) => b.status === 'PENDING').length,
        confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
        cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      });
      setRecentBookings(bookings);
      setCurrentPage(1);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateBookingStatus(id, status, token);
      if (res.success) {
        fetchData();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-50 rounded-lg w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#FFFFFF] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const sortedBookings = [...recentBookings].sort((a, b) => {
    if (sortConfig.key === 'client') {
      const aName = a.user?.name || '';
      const bName = b.user?.name || '';
      return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }
    if (sortConfig.key === 'service') {
      const aName = a.service?.name || '';
      const bName = b.service?.name || '';
      return sortConfig.direction === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }
    if (sortConfig.key === 'date') {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }
    if (sortConfig.key === 'status') {
      const weight = { 'PENDING': 0, 'CONFIRMED': 1, 'CANCELLED': 2 };
      const weightA = weight[a.status] ?? 3;
      const weightB = weight[b.status] ?? 3;
      if (weightA !== weightB) {
        return sortConfig.direction === 'asc' ? weightA - weightB : weightB - weightA;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedBookings = sortedBookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">{t('dashboard_subtitle')}</p>
      </div>

      {/* Statistika kartlari */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label={t('total_services') || "Jami xizmatlar"}
          value={stats.services}
          color="bg-[#7C3AED]/10"
          icon={<Briefcase className="w-5 h-5 text-[#7C3AED]" />}
        />
        <StatCard
          label={t('total_orders') || "Jami buyurtmalar"}
          value={stats.bookings}
          color="bg-blue-500/10"
          icon={<ShoppingCart className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          label={t('status_pending') || "Kutilmoqda"}
          value={stats.pending}
          color="bg-yellow-500/10"
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
        <StatCard
          label={t('status_confirmed') || "Tasdiqlangan"}
          value={stats.confirmed}
          color="bg-green-500/10"
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          label={t('status_cancelled') || "Bekor qilingan"}
          value={stats.cancelled}
          color="bg-red-500/10"
          icon={<XCircle className="w-5 h-5 text-red-500" />}
        />
      </div>

      {/* So'nggi buyurtmalar */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{"Barcha buyurtmalar"}</h2>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            {t('no_orders_yet')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th 
                    className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('client')}
                  >
                    <div className="flex items-center gap-1">
                      {t('client')}
                      {sortConfig.key === 'client' && <span className="text-[10px] text-gray-400">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('service')}
                  >
                    <div className="flex items-center gap-1">
                      {t('service')}
                      {sortConfig.key === 'service' && <span className="text-[10px] text-gray-400">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      {t('date')}
                      {sortConfig.key === 'date' && <span className="text-[10px] text-gray-400">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                  <th 
                    className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      {t('status')}
                      {sortConfig.key === 'status' && <span className="text-[10px] text-gray-400">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                  </th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayedBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-900">{b.user?.name}</p>
                      <p className="text-xs text-gray-500">{b.user?.phone_number}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{b.service?.name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {new Date(b.date).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        b.status === 'CONFIRMED'
                          ? 'bg-green-500/10 text-green-400'
                          : b.status === 'CANCELLED'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {b.status === 'CONFIRMED' ? t('status_confirmed') : b.status === 'CANCELLED' ? t('status_cancelled') : t('status_pending')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {b.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                            className="bg-green-50 text-green-500 hover:bg-green-100 p-1.5 rounded-lg transition-colors border border-green-100"
                            title={t('confirm')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                            className="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors border border-red-100"
                            title={t('cancel')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <span className="text-sm text-gray-500">
                  {startIndex + 1} - {Math.min(startIndex + itemsPerPage, recentBookings.length)} / {recentBookings.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Oldingi
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
