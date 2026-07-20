'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex flex-col items-center justify-center p-4">
      <div className="text-center relative w-full flex justify-center">
        <h1 className="text-[12rem] md:text-[15rem] font-black text-red-500/5 leading-none select-none">
          500
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-red-50 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kutilmagan xatolik!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Tizimda qandaydir kutilmagan muammo yuzaga keldi. Biz buni allaqachon aniqladik va ustida ishlayapmiz.
            </p>
            <button
              onClick={() => reset()}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-gray-800 hover:-translate-y-1 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sahifani yangilash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
