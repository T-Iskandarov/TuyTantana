'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }) {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && token && user.role === 'PROVIDER') {
      api.getNotifications(token).then(res => {
        if (res.success) setUnreadCount(res.unread_count || 0);
      }).catch(() => {});
    }
  }, [user, token, pathname]);

  const sidebarLinks = [
    {
      href: '/dashboard',
      label: t('sidebar_dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/services',
      label: t('sidebar_my_services'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      href: '/dashboard/notifications',
      label: 'Bildirishnomalar',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: unreadCount > 0 ? unreadCount : null,
    },
    {
      href: '/dashboard/profile',
      label: t('sidebar_profile'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PROVIDER')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'PROVIDER') return null;

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#F3F0FF] border-r border-gray-100 flex flex-col shrink-0 fixed h-full z-40">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="To'y Tantana Logo" className="w-full h-full object-contain scale-[1.35]" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#7C3AED] to-[#C4B5FD] bg-clip-text text-transparent">
              To'y Tantana
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-100 bg-white/50 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-[#F8F7FF] shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{t('sidebar_provider_role')}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20'
                    : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('sidebar_logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
