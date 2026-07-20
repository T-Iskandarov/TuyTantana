'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AuthModal({ isOpen, onClose, mode: initialMode, onSwitchMode }) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setFormData({ name: '', phone_number: '', password: '', role: 'USER' });
  }, [initialMode, isOpen]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
    setFormData({ ...formData, phone_number: val });
    setError('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setFormData({ name: '', phone_number: '', password: '', role: 'USER' });
    if (onSwitchMode) onSwitchMode(newMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullPhone = '+998' + formData.phone_number;

    try {
      if (mode === 'login') {
        const res = await login(fullPhone, formData.password);
        if (!res.success) {
          setError(res.message || t('login_error'));
        } else {
          onClose();
        }
      } else {
        if (!formData.name.trim()) {
          setError(t('name_required'));
          setLoading(false);
          return;
        }
        if (formData.phone_number.length < 9) {
          setError(t('phone_full_required'));
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError(t('password_min_6'));
          setLoading(false);
          return;
        }

        const res = await register({
          name: formData.name,
          phone_number: fullPhone,
          password: formData.password,
          role: formData.role,
        });
        if (!res.success) {
          setError(res.message || t('register_error'));
        } else {
          onClose();
        }
      }
    } catch {
      setError(t('server_connect_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-gray-200 shadow-2xl shadow-gray-300/50 animate-[slideUp_300ms_ease-out]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#F8F7FF]" fill="currentColor" viewBox="0 0 24 24">
              {mode === 'login' ? (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              ) : (
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              )}
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? t('login_title') : t('register_title')}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'login'
              ? t('login_desc')
              : t('register_desc')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pt-4 pb-8 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Name (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1.5 font-medium">{t('name')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('enter_name')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/25 transition-all"
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">{t('phone_number')}</label>
            <div className="flex items-center gap-0 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7C3AED]/50 focus-within:ring-1 focus-within:ring-[#7C3AED]/25 transition-all">
              <span className="px-4 py-3 text-gray-400 text-sm font-medium bg-gray-50 border-r border-gray-200 select-none">
                +998
              </span>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="90 123 45 67"
                maxLength={9}
                className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5 font-medium">{t('password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={mode === 'login' ? t('enter_password') : t('min_6_chars')}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/25 transition-all"
            />
          </div>

          {/* Role (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-600 mb-2 font-medium">{t('register_as')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'USER' })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    formData.role === 'USER'
                      ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-[#7C3AED]'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-base mb-0.5">👤</span>
                  {t('user_role')}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'PROVIDER' })}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    formData.role === 'PROVIDER'
                      ? 'bg-[#7C3AED]/10 border-[#7C3AED]/40 text-[#7C3AED]'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-base mb-0.5">🏢</span>
                  {t('provider_role')}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 font-semibold text-[#F8F7FF] bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] rounded-xl hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-[#F8F7FF]/30 border-t-[#F8F7FF] rounded-full animate-spin" />
            )}
            {mode === 'login' ? t('login_btn') : t('register_title')}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-gray-400 pt-2">
            {mode === 'login' ? (
              <>
                {t('no_account')}{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#7C3AED] hover:text-[#C4B5FD] font-medium transition-colors"
                >
                  {t('register_link')}
                </button>
              </>
            ) : (
              <>
                {t('have_account')}{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#7C3AED] hover:text-[#C4B5FD] font-medium transition-colors"
                >
                  {t('login_link')}
                </button>
              </>
            )}
          </p>
        </form>
      </div>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
