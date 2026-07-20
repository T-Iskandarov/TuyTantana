'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-[#F8F7FF] text-gray-900 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 lg:p-12 max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">{t('nav_about')}</h1>
          
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('about_p1') }} />
            <p className="mb-6" dangerouslySetInnerHTML={{ __html: t('about_p2') }} />
            
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{t('about_advantages')}</h2>
            <ul className="list-disc pl-6 mb-8 space-y-2">
              <li><strong>{t('about_adv1_title')}</strong> {t('about_adv1_desc')}</li>
              <li><strong>{t('about_adv2_title')}</strong> {t('about_adv2_desc')}</li>
              <li><strong>{t('about_adv3_title')}</strong> {t('about_adv3_desc')}</li>
              <li><strong>{t('about_adv4_title')}</strong> {t('about_adv4_desc')}</li>
            </ul>

            <div className="bg-[#F3F0FF] p-6 rounded-2xl border border-[#7C3AED]/20 mt-8">
              <p className="text-center font-medium text-[#7C3AED] m-0">
                {t('about_footer_msg')}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
