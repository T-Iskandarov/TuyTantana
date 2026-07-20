'use client';

import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil ma'lumotlarim</h1>
        <p className="text-sm text-gray-500 mt-1">Shaxsiy ma'lumotlaringiz</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center text-2xl font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20 font-medium">
              Xizmat ko'rsatuvchi
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ism</span>
            <span className="text-sm text-gray-900 font-medium">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Telefon raqam</span>
            <span className="text-sm text-gray-900 font-medium">{user.phone_number}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Rol</span>
            <span className="text-sm text-gray-900 font-medium">
              {user.role === 'PROVIDER' ? "Xizmat ko'rsatuvchi" : user.role}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ro'yxatdan o'tgan</span>
            <span className="text-sm text-gray-900 font-medium">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '-'}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-all"
          >
            Tizimdan chiqish
          </button>
        </div>
      </div>
    </div>
  );
}
