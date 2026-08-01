'use client';
import { usePathname, useRouter } from 'next/navigation';
import { House, MagnifyingGlass, CalendarCheck, User } from '@phosphor-icons/react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  const navItems = [
    { label: t('nav_home'), href: '/', icon: House },
    { label: t('nav_services'), href: '/#services', icon: MagnifyingGlass },
    { label: t('nav_my_bookings'), href: '/my-bookings', icon: CalendarCheck, requireAuth: true },
    { label: t('nav_cabinet') || 'Profil', href: user?.role === 'PROVIDER' ? '/dashboard' : (user?.role === 'SUPERADMIN' ? '/admin' : '/dashboard'), icon: User, requireAuth: true },
  ];

  const handleNavigation = (e, item) => {
    e.preventDefault();
    if (item.requireAuth && !user) {
      setAuthModal({ open: true, mode: 'login' });
    } else {
      router.push(item.href);
    }
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 px-2 pb-safe pt-2">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/#services' && pathname === '/');
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavigation(e, item)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors cursor-pointer ${
                  isActive ? 'text-[#7C3AED]' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon
                  className="w-6 h-6"
                  weight={isActive ? 'fill' : 'regular'}
                />
                <span className="text-[10px] font-medium text-center leading-none">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        mode={authModal.mode}
        onSwitchMode={(mode) => setAuthModal({ open: true, mode })}
      />
    </>
  );
}
