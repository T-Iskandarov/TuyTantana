'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';
import { useLanguage } from '@/context/LanguageContext';
import { CaretDown, House, CalendarCheck, ShieldCheck, SignOut, List, X, Bell } from '@phosphor-icons/react';
import { api } from '@/lib/api';
import { usePathname } from 'next/navigation';

const LANG_OPTIONS = [
  { code: 'uz', label: 'O\'zbek', icon: 'https://flagcdn.com/w40/uz.png' },
  { code: 'kaa', label: 'Qaraqalpaq', icon: 'https://flagcdn.com/w40/uz.png' },
  { code: 'en', label: 'English', icon: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ru', label: 'Русский', icon: 'https://flagcdn.com/w40/ru.png' },
];

export default function Header() {
  const { user, token, logout, loading } = useAuth();
  const { lang, changeLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const desktopLangRef = useRef(null);
  const mobileLangRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      api.getNotifications(token).then(res => {
        if (res.success) {
          setUnreadCount(res.unread_count || 0);
          setNotifications(res.data || []);
        }
      }).catch(() => {});
    }
  }, [user, token, pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (desktopLangRef.current && !desktopLangRef.current.contains(event.target)) &&
        (mobileLangRef.current && !mobileLangRef.current.contains(event.target))
      ) {
        setLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif?.is_read) return;

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.markNotificationAsRead(id, token);
    } catch {
      // ignore
    }
  };

  const navLinks = [
    { label: t('nav_home'), href: '/' },
    { label: t('nav_services'), href: '/#services' },
    { label: t('nav_about'), href: '/about' },
    { label: t('nav_contact'), href: '/contact' },
  ];

  const openLogin = () => setAuthModal({ open: true, mode: 'login' });
  const openRegister = () => setAuthModal({ open: true, mode: 'register' });
  const closeModal = () => setAuthModal({ open: false, mode: 'login' });

  const currentLangObj = LANG_OPTIONS.find(l => l.code === lang) || LANG_OPTIONS[0];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#F8F7FF]/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img src="/logo.png" alt="To'y Tantana Logo" className="w-full h-full object-contain scale-[1.35]" />
                </div>
                <span className="text-xl lg:text-2xl font-black bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] bg-clip-text text-transparent tracking-tight">
                  To'y Tantana
                </span>
              </a>
            </div>

            {/* Center: Desktop Nav */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-2 lg:gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#7C3AED] transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#7C3AED] group-hover:w-full transition-all duration-300 ease-out rounded-full opacity-0 group-hover:opacity-100"></span>
                </a>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="hidden lg:flex items-center justify-end gap-4 flex-shrink-0">
              {/* Language Switcher Custom Dropdown */}
              <div className="relative" ref={desktopLangRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <img src={currentLangObj.icon} alt={currentLangObj.label} className="w-5 h-auto rounded-sm object-cover border border-gray-200" style={{aspectRatio: '3/2'}} />
                  <span className="text-sm font-medium text-gray-700 uppercase">{currentLangObj.code}</span>
                  <CaretDown className={`w-4 h-4 text-gray-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} weight="bold" />
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-2 right-0 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fadeIn origin-top-right">
                    {LANG_OPTIONS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { changeLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${lang === l.code ? 'bg-[#7C3AED]/5 text-[#7C3AED]' : 'text-gray-700'}`}
                      >
                        <img src={l.icon} alt={l.label} className="w-5 h-auto rounded-sm object-cover border border-gray-200 shadow-sm" style={{aspectRatio: '3/2'}} />
                        <span className="text-sm font-medium">{l.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Auth */}
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-1">
                  <div className="relative" ref={notifRef}>
                    <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#7C3AED]">
                      <Bell className="w-6 h-6" weight="duotone" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                    {notifOpen && (
                      <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fadeIn origin-top-right z-50">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                          <span className="font-bold text-gray-900">Bildirishnomalar</span>
                          <a href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9]">Barchasi</a>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center">
                              <Bell className="w-8 h-8 text-gray-300 mb-2" weight="duotone" />
                              Xabarlar yo'q
                            </div>
                          ) : (
                            notifications.slice(0, 5).map(notif => (
                              <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.is_read ? 'bg-white' : 'bg-[#7C3AED]/5'}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`text-sm font-semibold pr-4 leading-tight ${notif.is_read ? 'text-gray-700' : 'text-[#7C3AED]'}`}>{notif.title}</span>
                                  {!notif.is_read && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-0.5 shadow-sm shadow-red-500/20"></span>}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] font-medium text-gray-400">
                                  {new Date(notif.created_at).toLocaleString('uz-UZ', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative pl-4 border-l border-gray-200" ref={userMenuRef}>
                    <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-[#F8F7FF] shadow-md shadow-[#7C3AED]/20">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm text-gray-900 font-bold leading-tight">{user.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{user.role === 'PROVIDER' ? 'Provider' : 'Foydalanuvchi'}</span>
                    </div>
                    <CaretDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} weight="bold" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fadeIn origin-top-right">
                      {user.role === 'PROVIDER' && (
                        <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#7C3AED]/5 text-sm font-medium text-gray-700 hover:text-[#7C3AED] transition-colors">
                          <House className="w-5 h-5" weight="duotone" />
                          {t('nav_cabinet')}
                        </a>
                      )}
                      {user.role === 'USER' && (
                        <a href="/my-bookings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#7C3AED]/5 text-sm font-medium text-gray-700 hover:text-[#7C3AED] transition-colors">
                          <CalendarCheck className="w-5 h-5" weight="duotone" />
                          {t('nav_my_bookings')}
                        </a>
                      )}
                      {user.role === 'SUPERADMIN' && (
                        <a href="/admin" className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                          <ShieldCheck className="w-5 h-5" weight="duotone" />
                          {t('nav_admin')}
                        </a>
                      )}
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-red-500 transition-colors text-left"
                      >
                        <SignOut className="w-5 h-5" weight="duotone" />
                        {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              ) : (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <button
                    onClick={openLogin}
                    className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    {t('nav_login')}
                  </button>
                  <button
                    onClick={openRegister}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] shadow-md shadow-[#7C3AED]/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {t('nav_register')}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="relative" ref={mobileLangRef}>
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 uppercase"
                >
                  <img src={currentLangObj.icon} alt={currentLangObj.label} className="w-5 h-auto rounded-sm object-cover border border-gray-200" style={{aspectRatio: '3/2'}} />
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-2 right-0 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-50">
                    {LANG_OPTIONS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { changeLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${lang === l.code ? 'text-[#7C3AED] font-semibold' : 'text-gray-700'}`}
                      >
                        <img src={l.icon} alt={l.label} className="w-5 h-auto rounded-sm object-cover border border-gray-200" style={{aspectRatio: '3/2'}} />
                        <span className="text-sm">{l.code.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Notification Bell */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-[#7C3AED]">
                    <Bell className="w-6 h-6" weight="duotone" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute top-full mt-2 right-0 w-80 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fadeIn origin-top-right z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-gray-900">Bildirishnomalar</span>
                        <a href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9]">Barchasi</a>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center">
                            <Bell className="w-8 h-8 text-gray-300 mb-2" weight="duotone" />
                            Xabarlar yo'q
                          </div>
                        ) : (
                          notifications.slice(0, 5).map(notif => (
                            <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${notif.is_read ? 'bg-white' : 'bg-[#7C3AED]/5'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-semibold pr-4 leading-tight ${notif.is_read ? 'text-gray-700' : 'text-[#7C3AED]'}`}>{notif.title}</span>
                                {!notif.is_read && <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 mt-0.5 shadow-sm shadow-red-500/20"></span>}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] font-medium text-gray-400">
                                {new Date(notif.created_at).toLocaleString('uz-UZ', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModal.open}
        onClose={closeModal}
        mode={authModal.mode}
        onSwitchMode={(mode) => setAuthModal({ open: true, mode })}
      />
    </>
  );
}
