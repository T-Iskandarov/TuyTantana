'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';

function formatPrice(p) {
  return Number(p).toLocaleString('uz-UZ').replace(/,/g, ' ');
}

export default function AdminPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('daily');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('ALL');

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceType, setServiceType] = useState('ALL');

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatus, setBookingStatus] = useState('ALL');

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, userSearch, userRole, serviceSearch, serviceType, bookingSearch, bookingStatus, sortConfig, dateRange]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'SUPERADMIN')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!token || !user || user.role !== 'SUPERADMIN') return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, usersRes, servicesRes, bookingsRes] = await Promise.all([
          api.adminDashboard(token),
          api.adminUsers(token),
          api.adminServices(token),
          api.adminBookings(token),
        ]);
        if (dashRes.success) setStats(dashRes.data);
        if (usersRes.success) setUsers(usersRes.data || []);
        if (servicesRes.success) setServices(servicesRes.data || []);
        if (bookingsRes.success) setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user || user.role !== 'SUPERADMIN') return;
    if (activeTab === 'analytics') {
      const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
          const res = await api.adminAnalytics(token, analyticsTimeframe);
          if (res.success) setAnalyticsData(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setAnalyticsLoading(false);
        }
      };
      fetchAnalytics();
    }
  }, [token, user, activeTab, analyticsTimeframe]);

  if (authLoading || !user || user.role !== 'SUPERADMIN') {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  const MENU_ITEMS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'analytics', label: '📈 Analitika' },
    { id: 'users', label: '👥 Foydalanuvchilar' },
    { id: 'services', label: '🛠️ Xizmatlar' },
    { id: 'bookings', label: '📅 Bronlar' },
  ];

  const roleMap = { USER: 'Foydalanuvchi', PROVIDER: 'Xizmat ko\'rsatuvchi', SUPERADMIN: 'Super Admin' };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">↕</span>;
    return <span className="ml-1 text-[#7C3AED] font-bold">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(userSearch.toLowerCase()) || (u.phone_number && u.phone_number.includes(userSearch));
    const matchesRole = userRole === 'ALL' || u.role === userRole;
    if (!dateRange.start && !dateRange.end) return matchesSearch && matchesRole;
    const uDate = new Date(u.created_at).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() + 86400000 : Infinity;
    return matchesSearch && matchesRole && uDate >= start && uDate <= end;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'services') { aVal = a._count?.services || 0; bVal = b._count?.services || 0; }
    if (sortConfig.key === 'bookings') { aVal = a._count?.bookings || 0; bVal = b._count?.bookings || 0; }
    if (sortConfig.key === 'created_at') { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesType = serviceType === 'ALL' || s.type === serviceType;
    if (!dateRange.start && !dateRange.end) return matchesSearch && matchesType;
    const sDate = new Date(s.created_at).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() + 86400000 : Infinity;
    return matchesSearch && matchesType && sDate >= start && sDate <= end;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'bookings') { aVal = a._count?.bookings || 0; bVal = b._count?.bookings || 0; }
    if (sortConfig.key === 'price') { aVal = Number(a.price); bVal = Number(b.price); }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredBookings = bookings.filter(b => {
    const searchString = `${b.service?.name || ''} ${b.user?.name || ''} ${b.user?.phone_number || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatus === 'ALL' || b.status === bookingStatus;
    if (!dateRange.start && !dateRange.end) return matchesSearch && matchesStatus;
    const bDate = new Date(b.date).getTime();
    const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end).getTime() + 86400000 : Infinity;
    return matchesSearch && matchesStatus && bDate >= start && bDate <= end;
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'price') { aVal = Number(a.service?.price || 0); bVal = Number(b.service?.price || 0); }
    if (sortConfig.key === 'date') { aVal = new Date(a.date).getTime(); bVal = new Date(b.date).getTime(); }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  let currentList = [];
  if (activeTab === 'users') currentList = filteredUsers;
  else if (activeTab === 'services') currentList = filteredServices;
  else if (activeTab === 'bookings') currentList = filteredBookings;

  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const displayedUsers = activeTab === 'users' ? filteredUsers.slice(startIndex, startIndex + itemsPerPage) : [];
  const displayedServices = activeTab === 'services' ? filteredServices.slice(startIndex, startIndex + itemsPerPage) : [];
  const displayedBookings = activeTab === 'bookings' ? filteredBookings.slice(startIndex, startIndex + itemsPerPage) : [];

  const Pagination = ({ listLength }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <span className="text-sm text-gray-500">
          {startIndex + 1} - {Math.min(startIndex + itemsPerPage, listLength)} / {listLength}
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
    );
  };

  const exportData = async (type, currentTab) => {
    let dataToExport = [];
    let filename = '';
    let head = [];
    if (currentTab === 'users') {
      filename = 'Foydalanuvchilar';
      head = [['ID', 'Ism', 'Telefon', 'Rol', 'Xizmatlar', 'Bronlar', "Ro'yxatdan o'tgan"]];
      dataToExport = filteredUsers.map(u => [ `#${u.id}`, u.name, u.phone_number, roleMap[u.role], u._count?.services || 0, u._count?.bookings || 0, new Date(u.created_at).toLocaleDateString('uz-UZ') ]);
    } else if (currentTab === 'services') {
      filename = 'Xizmatlar';
      head = [['ID', 'Nomi', 'Turi', 'Narxi', 'Egasi', 'Bronlar']];
      dataToExport = filteredServices.map(s => [ `#${s.id}`, s.name, s.type, s.price, s.provider?.name || '', s._count?.bookings || 0 ]);
    } else if (currentTab === 'bookings') {
      filename = 'Bronlar';
      head = [['ID', 'Mijoz', 'Mijoz tel', 'Xizmat', 'Sana', 'Narxi', 'Status']];
      dataToExport = filteredBookings.map(b => [ `#${b.id}`, b.user?.name, b.user?.phone_number, b.service?.name, new Date(b.date).toLocaleDateString('uz-UZ'), b.service?.price, b.status ]);
    } else if (currentTab === 'dashboard') {
      filename = 'Dashboard';
      head = [['Statistika turi', 'Soni']];
      dataToExport = [
        ['Foydalanuvchilar', stats.totalUsers],
        ['Xizmat ko\'rsatuvchilar', stats.totalProviders],
        ['Jami xizmatlar', stats.totalServices],
        ['Jami bronlar', stats.totalBookings],
        ['Kutilmoqda', stats.pendingBookings],
        ['Tasdiqlangan', stats.confirmedBookings],
        ...(stats.servicesByType || []).map(s => [s.label || s.type, s._count?.id || 0])
      ];
    } else if (currentTab === 'analytics') {
      filename = 'Analitika';
      head = [['Ko\'rsatkich', 'Qiymati']];
      dataToExport = [
        ['Umumiy Aylanma', `${formatPrice(analyticsData?.total_revenue || 0)} so'm`],
        ['', ''],
        ['Bronlar (Eng yuqori)', analyticsData?.bookings_stats?.max || 0],
        ['Bronlar (Eng past)', analyticsData?.bookings_stats?.min || 0],
        ['Bronlar (O\'rtacha)', analyticsData?.bookings_stats?.avg || 0],
        ['', ''],
        ['Yangi foydalanuvchilar (Yuqori)', analyticsData?.users_stats?.max || 0],
        ['Yangi foydalanuvchilar (Past)', analyticsData?.users_stats?.min || 0],
        ['Yangi foydalanuvchilar (O\'rtacha)', analyticsData?.users_stats?.avg || 0],
      ];
    }

    if (type === 'pdf' && (currentTab === 'analytics' || currentTab === 'dashboard')) {
      const element = document.getElementById(`${currentTab}-content`);
      if (element) {
        try {
          const imgData = await toPng(element, { quality: 0.95, backgroundColor: '#ffffff' });
          const doc = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = doc.internal.pageSize.getWidth();
          const padding = 12; // Ikki yonboshdan qoladigan masofa (mm)
          const availableWidth = pdfWidth - padding * 2;
          const { offsetWidth, offsetHeight } = element;
          const imgHeight = (offsetHeight * availableWidth) / offsetWidth;
          
          doc.text(`${filename} Hisoboti`, padding, 15);
          doc.addImage(imgData, 'PNG', padding, 22, availableWidth, imgHeight);
          
          let nextY = 22 + imgHeight + 10;
          if (head.length > 0 && dataToExport.length > 0) {
            autoTable(doc, { head: head, body: dataToExport, startY: nextY });
          }
          
          doc.save(`${filename}.pdf`);
        } catch (error) {
          console.error("PDF eksport qilishda xatolik:", error);
          alert("Eksport qilishda xatolik yuz berdi. Sahifani yangilab qayta urinib ko'ring.");
        }
        return;
      }
    }

    if (type === 'excel') {
      const ws = XLSX.utils.aoa_to_sheet([...head, ...dataToExport]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else if (type === 'pdf') {
      const doc = new jsPDF();
      doc.text(`${filename} Hisoboti`, 14, 15);
      autoTable(doc, { head: head, body: dataToExport, startY: 20 });
      doc.save(`${filename}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-gray-900">
      {/* Header */}
      <header className="bg-[#F3F0FF] border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="To'y Tantana Logo" className="w-full h-full object-contain scale-[1.35]" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#7C3AED] to-[#C4B5FD] bg-clip-text text-transparent">
                Admin Panel
              </span>
            </Link>
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
            Chiqish
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#F3F0FF] rounded-xl p-1 mb-8 overflow-x-auto">
          {MENU_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED]/10 text-[#7C3AED]'
                  : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="animate-fadeIn">
            {/* ===== ANALYTICS ===== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 gap-4">
                  <h2 className="text-lg font-semibold">Tizim tahlili</h2>
                  <div className="flex items-center gap-3">
                    <select 
                      value={analyticsTimeframe} 
                      onChange={e => setAnalyticsTimeframe(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="daily">Kunlik (soatlar kesimida)</option>
                      <option value="monthly">Oylik (kunlar kesimida)</option>
                      <option value="yearly">Yillik (oylar kesimida)</option>
                    </select>
                    <button onClick={() => exportData('pdf', 'analytics')} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">PDF</button>
                  </div>
                </div>

                {analyticsLoading || !analyticsData ? (
                  <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" /></div>
                ) : (
                  <div id="analytics-content" className="space-y-6">
                    {/* Bronlar Statistikasi */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Bronlar (Eng yuqori)</p>
                        <p className="text-2xl font-bold text-green-500">{analyticsData.bookings_stats.max}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Bronlar (Eng past)</p>
                        <p className="text-2xl font-bold text-red-500">{analyticsData.bookings_stats.min}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Bronlar (O'rtacha)</p>
                        <p className="text-2xl font-bold text-[#7C3AED]">{analyticsData.bookings_stats.avg}</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80">
                      <h3 className="text-md font-semibold mb-4">Bronlar dinamikasi</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.bookings_chart}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9CA3AF" />
                          <YAxis tick={{fontSize: 12}} stroke="#9CA3AF" />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="count" name="Bronlar" stroke="#7C3AED" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Ro'yxatdan o'tganlar Statistikasi */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Yangi foydalanuvchilar (Yuqori)</p>
                        <p className="text-2xl font-bold text-green-500">{analyticsData.users_stats.max}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Yangi foydalanuvchilar (Past)</p>
                        <p className="text-2xl font-bold text-red-500">{analyticsData.users_stats.min}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">O'rtacha ro'yxatdan o'tish</p>
                        <p className="text-2xl font-bold text-blue-500">{analyticsData.users_stats.avg}</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-80">
                      <h3 className="text-md font-semibold mb-4">Foydalanuvchilar va Xizmatlar ko'rsatuvchilar o'sishi</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.users_chart}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#9CA3AF" />
                          <YAxis tick={{fontSize: 12}} stroke="#9CA3AF" />
                          <RechartsTooltip />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                          <Bar dataKey="users" name="Foydalanuvchi" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                          <Bar dataKey="providers" name="Xizmat ko'rsatuvchi" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Qo'shimcha statistika */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center h-64">
                        <p className="text-sm text-gray-500 mb-2">Umumiy Aylanma (Tasdiqlangan bronlar)</p>
                        <p className="text-4xl font-bold text-[#7C3AED]">{formatPrice(analyticsData.total_revenue)} so'm</p>
                        <p className="text-xs text-gray-400 mt-2">Barcha tasdiqlangan bronlarning summasi</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-64 flex flex-col">
                        <h3 className="text-sm text-gray-500 mb-2 text-center">Ommabop Xizmatlar (Top 5)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyticsData.top_services} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                              {analyticsData.top_services.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 5]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== DASHBOARD ===== */}
            {activeTab === 'dashboard' && stats && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
                  <h2 className="text-lg font-semibold">Umumiy ko'rsatkichlar</h2>
                  <button onClick={() => exportData('pdf', 'dashboard')} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">PDF</button>
                </div>
                <div id="dashboard-content" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-400">Foydalanuvchilar</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-400">Xizmat ko&apos;rsatuvchilar</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalProviders}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-400">Jami xizmatlar</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalServices}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-400">Jami bronlar</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalBookings}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-400">Kutilmoqda</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pendingBookings}</p>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                  <p className="text-sm text-gray-400">Tasdiqlangan</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{stats.confirmedBookings}</p>
                </div>
                {(stats.servicesByType || []).map((s) => (
                  <div key={s.type} className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-400 font-medium">{s.label || s.type}</p>
                    <p className="text-3xl font-bold text-[#7C3AED] mt-1">{s._count?.id || 0}</p>
                  </div>
                ))}
                </div>
              </div>
            )}

            {/* ===== FOYDALANUVCHILAR ===== */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">👥 Barcha foydalanuvchilar ({filteredUsers.length})</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Boshlanish sanasi" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Tugash sanasi" />
                    <input 
                      type="text" 
                      placeholder="Ism yoki telefon..." 
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    />
                    <select
                      value={userRole}
                      onChange={e => setUserRole(e.target.value)}
                      className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="ALL">Barcha rollar</option>
                      <option value="USER">Foydalanuvchi</option>
                      <option value="PROVIDER">Xizmat ko'rsatuvchi</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </select>
                    <button onClick={() => exportData('excel', 'users')} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">Excel</button>
                    <button onClick={() => exportData('pdf', 'users')} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">PDF</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('id')}>ID <SortIcon columnKey="id"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('name')}>Ism <SortIcon columnKey="name"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Telefon</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rol</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('services')}>Xizmatlar <SortIcon columnKey="services"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('bookings')}>Bronlar <SortIcon columnKey="bookings"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('created_at')}>Ro&apos;yxatdan <SortIcon columnKey="created_at"/></th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedUsers.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 text-sm text-gray-500">#{u.id}</td>
                          <td className="px-5 py-3 text-sm text-gray-900 font-medium">{u.name}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{u.phone_number}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              u.role === 'SUPERADMIN' ? 'bg-purple-500/10 text-purple-400'
                              : u.role === 'PROVIDER' ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-gray-500/10 text-gray-400'
                            }`}>{roleMap[u.role]}</span>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{u._count?.services || 0}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{u._count?.bookings || 0}</td>
                          <td className="px-5 py-3 text-xs text-gray-500">
                            {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination listLength={filteredUsers.length} />
                </div>
              </div>
            )}

            {/* ===== XIZMATLAR ===== */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">🛠️ Barcha xizmatlar ({filteredServices.length})</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Boshlanish sanasi" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Tugash sanasi" />
                    <input 
                      type="text" 
                      placeholder="Xizmat nomini izlash..." 
                      value={serviceSearch}
                      onChange={e => setServiceSearch(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    />
                    <select
                      value={serviceType}
                      onChange={e => setServiceType(e.target.value)}
                      className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="ALL">Barcha turlar</option>
                      <option value="TUYXONA">To'yxona</option>
                      <option value="FOTO_VIDEO">Foto va Video</option>
                      <option value="XONANDA">Xonanda</option>
                      <option value="SALON">To'y saloni</option>
                      <option value="KORTEJ">Kortej</option>
                      <option value="TASHKILOTCHI">Tashkilotchi</option>
                      <option value="LIBOSLAR">Liboslar</option>
                      <option value="AKSESSUARLAR">Aksessuarlar</option>
                    </select>
                    <button onClick={() => exportData('excel', 'services')} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">Excel</button>
                    <button onClick={() => exportData('pdf', 'services')} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">PDF</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('id')}>ID <SortIcon columnKey="id"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('name')}>Nomi <SortIcon columnKey="name"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Turi</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('price')}>Narxi <SortIcon columnKey="price"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Egasi</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('bookings')}>Bronlar <SortIcon columnKey="bookings"/></th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedServices.map((s) => (
                        <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 text-sm text-gray-500">#{s.id}</td>
                          <td className="px-5 py-3 text-sm text-gray-900 font-medium">{s.name}</td>
                          <td className="px-5 py-3 text-xs text-gray-400">{s.type}</td>
                          <td className="px-5 py-3 text-sm text-[#7C3AED] font-medium">{(!s.price || s.price === 0 || s.price === '0') ? "Kelishilgan" : formatPrice(s.price)}</td>
                          <td className="px-5 py-3">
                            <p className="text-sm text-gray-600">{s.provider?.name}</p>
                            <p className="text-xs text-gray-500">{s.provider?.phone_number}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{s._count?.bookings || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination listLength={filteredServices.length} />
                </div>
              </div>
            )}

            {/* ===== BRONLAR ===== */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-lg font-semibold">📅 Barcha bronlar ({filteredBookings.length})</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Boshlanish sanasi" />
                    <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]" title="Tugash sanasi" />
                    <input 
                      type="text" 
                      placeholder="Mijoz yoki xizmatni izlash..." 
                      value={bookingSearch}
                      onChange={e => setBookingSearch(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    />
                    <select
                      value={bookingStatus}
                      onChange={e => setBookingStatus(e.target.value)}
                      className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED]"
                    >
                      <option value="ALL">Barcha statuslar</option>
                      <option value="PENDING">Kutilmoqda</option>
                      <option value="CONFIRMED">Tasdiqlangan</option>
                      <option value="CANCELLED">Bekor qilingan</option>
                    </select>
                    <button onClick={() => exportData('excel', 'bookings')} className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors">Excel</button>
                    <button onClick={() => exportData('pdf', 'bookings')} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">PDF</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('id')}>ID <SortIcon columnKey="id"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Mijoz</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Xizmat</th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('date')}>Sana <SortIcon columnKey="date"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 cursor-pointer group hover:text-gray-900" onClick={() => handleSort('price')}>Narxi <SortIcon columnKey="price"/></th>
                        <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedBookings.map((b) => (
                        <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 text-sm text-gray-500">#{b.id}</td>
                          <td className="px-5 py-3">
                            <p className="text-sm text-gray-900">{b.user?.name}</p>
                            <p className="text-xs text-gray-500">{b.user?.phone_number}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{b.service?.name}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">
                            {new Date(b.date).toLocaleDateString('uz-UZ')}
                          </td>
                          <td className="px-5 py-3 text-sm text-[#7C3AED]">{formatPrice(b.service?.price)}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400'
                              : b.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {b.status === 'CONFIRMED' ? 'Tasdiqlangan' : b.status === 'CANCELLED' ? 'Bekor qilingan' : 'Kutilmoqda'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination listLength={filteredBookings.length} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
