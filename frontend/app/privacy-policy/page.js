'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  LockSimple, 
  UserCheck, 
  Database, 
  ShareNetwork, 
  Trash, 
  EnvelopeSimple, 
  Phone, 
  MapPin, 
  CalendarCheck,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F8F7FF] text-gray-900 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Yuqori sarlavha qismi */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-medium text-sm mb-4 border border-[#7C3AED]/20">
            <ShieldCheck size={18} weight="bold" />
            <span>Rasmiy hujjat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Maxfiylik Siyosati
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            <strong>"To'y Tantana"</strong> mobil ilovasi va veb-platformasida shaxsiy ma'lumotlarni to'plash, foydalanish va himoya qilish tartibi
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mt-4 bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-xs">
            <Clock size={16} className="text-[#7C3AED]" weight="bold" />
            <span>Oxirgi yangilanish: <strong>2026-yil, 25-sentabr</strong></span>
          </div>
        </div>

        {/* Asosiy hujjat konteyneri */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-6 sm:p-10 lg:p-14 space-y-10">
          
          {/* Kirish qismi */}
          <div className="p-6 rounded-2xl bg-[#F8F7FF] border border-[#7C3AED]/15 text-gray-700 leading-relaxed text-base sm:text-lg">
            Ushbu Maxfiylik siyosati <strong>«CUBO MChJ»</strong> (keyingi o'rinlarda <em>«Kompaniya»</em> yoki <em>«Biz»</em>) tomonidan boshqariladigan <strong>«To'y Tantana»</strong> mobil ilovasi (Android/iOS) hamda <strong>tuytantana.uz</strong> veb-sayti (birgalikda <em>«Platforma»</em>) orqali foydalanuvchilarning shaxsiy ma'lumotlarini to'plash, saqlash, qayta ishlash va himoya qilish shartlarini belgilaydi.
            <div className="mt-3 text-sm text-gray-600">
              Platformadan ro'yxatdan o'tish yoki undan foydalanish orqali siz ushbu Maxfiylik siyosati qoidalariga to'liq rozilik bildirasiz.
            </div>
          </div>

          {/* 1-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <Database size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                1. To'planadigan ma'lumotlar
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Biz platformada qulay va xavfsiz xizmat ko'rsatish maqsadida faqat zarur bo'lgan minimal ma'lumotlarni to'playmiz:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <UserCheck size={18} className="text-[#7C3AED]" weight="bold" />
                  Shaxsiy ma'lumotlar:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Foydalanuvchining ismi va familiyasi;</li>
                  <li>Aloqa uchun telefon raqami (asosiy identifikator);</li>
                  <li>Elektron pochta manzili (ixtiyoriy ravishda);</li>
                  <li>Parol (faqat xavfsiz xeshlangan holda saqlanadi);</li>
                  <li>Xizmat ko'rsatuvchilar uchun: xizmat nomi, toifasi, manzili, tavsifi, narxlar va fotosuratlar.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <MapPin size={18} className="text-[#7C3AED]" weight="bold" />
                  Texnik va geolokatsiya ma'lumotlari:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Qurilma modeli, operatsion tizimi va ilova versiyasi;</li>
                  <li>IP-manzil va standart tarmoq so'rovlari ma'lumotlari;</li>
                  <li>Ilova ichidagi buyurtmalar va ko'rilgan xizmatlar tarixi;</li>
                  <li>
                    <strong>Geolokatsiya:</strong> Yaqin atrofdagi to'yxona va xizmatlarni xaritada aniqlash uchun foydalanuvchi roziligi bilan olinadi.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <CalendarCheck size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                2. Ma'lumotlardan foydalanish maqsadlari
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Yig'ilgan ma'lumotlar quyidagi aniq maqsadlarda foydalaniladi:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle size={18} className="text-[#7C3AED] shrink-0 mt-0.5" weight="fill" />
                <span>To'y va marosim xizmatlarini izlash, ko'rish va onlayn bron qilish imkonini berish;</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle size={18} className="text-[#7C3AED] shrink-0 mt-0.5" weight="fill" />
                <span>Mijoz va xizmat ko'rsatuvchi (ijrochi) o'rtasida to'g'ridan-to'g'ri aloqa va sanani kelishishni ta'minlash;</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle size={18} className="text-[#7C3AED] shrink-0 mt-0.5" weight="fill" />
                <span>Buyurtma holatlari, yangi xabarlar va o'zgarishlar bo'yicha tezkor bildirishnomalar yuborish (shu jumladan rasmiy Telegram bot orqali);</span>
              </li>
              <li className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <CheckCircle size={18} className="text-[#7C3AED] shrink-0 mt-0.5" weight="fill" />
                <span>Xavfsizlikni ta'minlash, firibgarlik harakatlarini oldini olish va tizim barqarorligini nazorat qilish.</span>
              </li>
            </ul>
          </section>

          {/* 3-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <ShareNetwork size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                3. Ma'lumotlarni uchinchi tomonlar bilan almashish
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              <strong>«CUBO MChJ» foydalanuvchilarning shaxsiy ma'lumotlarini uchinchi shaxslarga aslo sotmaydi yoki tijoriy maqsadlarda ijaraga bermaydi.</strong> Ma'lumotlar faqat quyidagi zarur hollarda taqdim etilishi mumkin:
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <strong>Xizmat ko'rsatuvchi hamkorlar:</strong> Siz bron qilgan to'yxona, fotosessiya yoki xonandaga buyurtmani tasdiqlash uchun faqat sizning ismingiz va telefon raqamingiz yetkaziladi.
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <strong>Texnik infratuzilma xizmatlari:</strong> Xaritalar funksiyasi uchun Yandex Maps API xizmatidan, foydalanuvchi hisobini bog'lagan taqdirda bildirishnomalar yuborish uchun rasmiy Telegram botdan foydalaniladi.
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <strong>Qonuniy talablar:</strong> O'zbekiston Respublikasining amaldagi qonunchiligi asosida vakolatli davlat organlarining rasmiy so'roviga binoan.
              </div>
            </div>
          </section>

          {/* 4-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <LockSimple size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                4. Ma'lumotlar xavfsizligi va himoyasi
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Sizning ma'lumotlaringiz xavfsizligini ta'minlash bizning ustuvor vazifamizdir:
            </p>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <li>Barcha tarmoq so'rovlari <strong>SSL/TLS (HTTPS)</strong> orqali to'liq shifrlangan holatda uzatiladi;</li>
              <li>Avtorizatsiya uchun zamonaviy <strong>JWT (JSON Web Token)</strong> xavfsizlik standartlari qo'llaniladi;</li>
              <li>Foydalanuvchilar parollari bazada ochiq holda saqlanmaydi — faqat bir tomonlama kuchli kriptografik xeshlar (PBKDF2/SHA256) ishlatiladi;</li>
              <li>Server darajasida DDoS hujumlariga qarshi cheklovlar (Rate Limiting) va himoyalangan xavfsizlik devorlari mavjud.</li>
            </ul>
          </section>

          {/* 5-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                5. Bolalar maxfiyligi
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              «To'y Tantana» platformasi 16 yoshga to'lmagan shaxslarning mustaqil foydalanishi uchun mo'ljallanmagan. Biz voyaga yetmagan bolalardan ataylab shaxsiy ma'lumotlarni yig'maymiz. Agar ota-onalar yoki qonuniy vakillar farzandining ma'lumotlari ro'yxatga olinganini aniqlasa, bizga murojaat qilishlari bilan ushbu ma'lumotlar zudlik bilan o'chirib tashlanadi.
            </p>
          </section>

          {/* 6-bo'lim — Hisobni o'chirish (Google Play talabi) */}
          <section className="space-y-4 p-6 rounded-2xl bg-red-50/60 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                6. Foydalanuvchi huquqlari va hisobni o'chirish (Account Deletion)
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              Har bir foydalanuvchi o'zining shaxsiy ma'lumotlarini ko'rish, tahrirlash hamda <strong>«To'y Tantana» platformasidagi hisobini va barcha bog'liq ma'lumotlarini butunlay o'chirib tashlashni talab qilish huquqiga ega</strong>.
            </p>
            <div className="bg-white p-4 rounded-xl border border-red-100 space-y-2 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Hisobingizni o'chirish usullari:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Ilova sozlamalari orqali: Profil bo'limiga kirib <strong>«Hisobni o'chirish»</strong> so'rovini yuborish orqali;</li>
                <li>
                  Qo'llab-quvvatlash xizmati orqali: <strong>tursunpulatiskandarov@gmail.com</strong> yoki <strong>+998 97 317 34 97</strong> raqamiga ro'yxatdan o'tgan telefon raqamingizdan murojaat qilib.
                </li>
              </ul>
              <p className="text-xs text-gray-500 pt-1">
                Hisob o'chirilgach, sizning profilingiz, bron tarixlaringiz va shaxsiy ma'lumotlaringiz bazamizdan qayta tiklanmaydigan qilib to'liq o'chiriladi.
              </p>
            </div>
          </section>

          {/* 7-bo'lim */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0">
                <Clock size={22} weight="bold" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                7. Siyosatga o'zgartirishlar kiritish
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              «CUBO MChJ» ushbu Maxfiylik siyosatiga istalgan vaqtda o'zgartirish va qo'shimchalar kiritish huquqiga ega. Qoidalar yangilanganda ushbu sahifadagi <em>«Oxirgi yangilanish»</em> sanasi yangilanadi va foydalanuvchilarga ilova orqali xabar qilinadi.
            </p>
          </section>

          {/* 8-bo'lim — Bog'lanish */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              8. Bog'lanish va rasmiy rekvizitlar
            </h2>
            <p className="text-gray-600">
              Ushbu Maxfiylik siyosati yoki shaxsiy ma'lumotlaringiz xavfsizligi yuzasidan barcha savollar bo'yicha biz bilan quyidagi aloqa kanallari orqali bog'lanishingiz mumkin:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <Phone size={20} className="text-[#7C3AED] shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Telefon raqam:</p>
                  <a href="tel:+998973173497" className="text-sm font-bold text-gray-900 hover:text-[#7C3AED]">
                    +998 97 317 34 97
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <EnvelopeSimple size={20} className="text-[#7C3AED] shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Elektron pochta:</p>
                  <a href="mailto:tursunpulatiskandarov@gmail.com" className="text-sm font-bold text-gray-900 hover:text-[#7C3AED]">
                    tursunpulatiskandarov@gmail.com
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <MapPin size={20} className="text-[#7C3AED] shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Kompaniya va Manzil:</p>
                  <p className="text-sm font-bold text-gray-900">«CUBO MChJ», O'zbekiston</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <UserCheck size={20} className="text-[#7C3AED] shrink-0 mt-0.5" weight="bold" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Mas'ul shaxs:</p>
                  <p className="text-sm font-bold text-gray-900">Tursunpo'lat Iskandarov</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
