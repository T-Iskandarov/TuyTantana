import { useLanguage } from '@/context/LanguageContext';
import { Phone, Envelope, MapPin } from '@phosphor-icons/react';export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo va tavsif */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 flex items-center justify-center">
                <img src="/logo.png" alt="To'y Tantana Logo" className="w-full h-full object-contain scale-[1.35]" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-[#7C3AED] to-[#C4B5FD] bg-clip-text text-transparent">
                To'y Tantana
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          {/* Tezkor havolalar */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t('footer_quick_links')}
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav_home'), href: '/' },
                { label: t('nav_services'), href: '/#services' },
                { label: t('nav_about'), href: '/about' },
                { label: t('nav_contact'), href: '/contact' },
                { label: t('nav_privacy_policy') || 'Maxfiylik siyosati', href: '/privacy-policy' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-[#7C3AED] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t('footer_contact')}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7C3AED]" weight="bold" />
                +998 97 317 34 97
              </li>
              <li className="flex items-center gap-2">
                <Envelope className="w-4 h-4 text-[#7C3AED]" weight="bold" />
                tursunpulatiskandarov@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#7C3AED]" weight="bold" />
                {t('footer_address')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
