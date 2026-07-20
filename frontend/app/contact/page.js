'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-[#F8F7FF] text-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">{t('nav_contact')}</h1>
          <p className="text-gray-600 mb-8 text-lg">
            {t('contact_desc')}
          </p>
          <div className="flex flex-col gap-6 text-left">
            <a href="tel:+998973173497" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#7C3AED]/5 transition-colors border border-gray-100 hover:border-[#7C3AED]/20">
              <span className="text-3xl">📞</span>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('contact_phone')}</p>
                <p className="text-xl font-bold text-gray-900">+998 97 317 34 97</p>
              </div>
            </a>
            <a href="https://t.me/T_Iskandarov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#7C3AED]/5 transition-colors border border-gray-100 hover:border-[#7C3AED]/20">
              <span className="text-3xl">✈️</span>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('contact_tg')}</p>
                <p className="text-xl font-bold text-gray-900">@T_Iskandarov</p>
              </div>
            </a>
            <a href="https://instagram.com/T_Iskandarov_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#7C3AED]/5 transition-colors border border-gray-100 hover:border-[#7C3AED]/20">
              <span className="text-3xl">📸</span>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('contact_ig')}</p>
                <p className="text-xl font-bold text-gray-900">@T_Iskandarov_</p>
              </div>
            </a>
            <a href="mailto:tursunpulatiskandarov@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#7C3AED]/5 transition-colors border border-gray-100 hover:border-[#7C3AED]/20">
              <span className="text-3xl">📧</span>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('contact_email')}</p>
                <p className="text-xl font-bold text-gray-900">tursunpulatiskandarov@gmail.com</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-[#7C3AED]/5 transition-colors border border-gray-100 hover:border-[#7C3AED]/20">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-sm text-gray-500 font-medium">{t('contact_address')}</p>
                <p className="text-xl font-bold text-gray-900">{t('contact_address_value')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
