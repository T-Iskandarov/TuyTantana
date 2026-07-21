import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/Toast';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata = {
  title: {
    template: "%s | To'y Tantana",
    default: "To'y Tantana - Eng yaxshi to'y xizmatlari platformasi",
  },
  description: "O'zbekistondagi eng yirik to'y va marosim xizmatlarini izlash, topish va bron qilish platformasi. To'yxonalar, xonandalar, foto va video xizmatlari, to'y salonlari, va kortej xizmatlari bir joyda.",
  keywords: ["to'y", "to'yxona", "xonanda", "to'y salon", "kortej", "bron qilish", "O'zbekiston", "to'y xizmatlari", "to'y marosimi", "to'yxonalar narxlari"],
  authors: [{ name: 'CUBO kompaniyasi' }],
  creator: 'CUBO kompaniyasi',
  publisher: "To'y Tantana",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "To'y Tantana - Eng yaxshi to'y xizmatlari platformasi",
    description: "O'zbekistondagi eng yirik to'y va marosim xizmatlarini izlash, topish va bron qilish platformasi.",
    url: 'https://www.tuytantana.uz',
    siteName: "To'y Tantana",
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "To'y Tantana - Eng yaxshi to'y xizmatlari platformasi",
    description: "O'zbekistondagi eng yirik to'y va marosim xizmatlarini izlash, topish va bron qilish platformasi.",
  },
  icons: {
    icon: '/logo.png',
  },
};
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({ children }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const YANDEX_ID = process.env.NEXT_PUBLIC_YANDEX_ID;

  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-[#F8F7FF] text-gray-900 min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Yandex Metrica */}
        {YANDEX_ID && (
          <Script id="yandex-metrica" strategy="afterInteractive">
            {`
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

              ym(${YANDEX_ID}, "init", {
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true
              });
            `}
          </Script>
        )}

        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
