'use client';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-4">
      <div className="text-center relative">
        <h1 className="text-[12rem] md:text-[15rem] font-black text-[#7C3AED]/5 leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-lg w-full">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sahifa topilmadi</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Kechirasiz, siz qidirayotgan sahifa mavjud emas, nomi o'zgartirilgan yoki o'chirilgan bo'lishi mumkin.
            </p>
            <Link 
              href="/" 
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-2xl font-bold shadow-lg shadow-[#7C3AED]/30 hover:shadow-[#7C3AED]/50 hover:-translate-y-1 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Bosh sahifaga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
