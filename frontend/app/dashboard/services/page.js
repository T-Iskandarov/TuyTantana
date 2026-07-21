'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { api, IMAGE_BASE } from '@/lib/api';
import dynamic from 'next/dynamic';
import imageCompression from 'browser-image-compression';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });
import { regionsAndDistricts, regionCoordinates } from '@/lib/regions';

const SERVICE_TYPES = [
  { value: 'TUYXONA', label: 'Tuyxona' },
  { value: 'FOTO_VIDEO', label: 'Foto va Video' },
  { value: 'XONANDA', label: 'Xonanda' },
  { value: 'SALON', label: 'Tuy salon' },
  { value: 'KORTEJ', label: 'Kortej' },
  { value: 'TASHKILOTCHI', label: 'Tuy tashkilotchisi' },
];

function formatPrice(p) {
  if (!p && p !== 0) return '-';
  return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

// ========== XIZMAT QO'SHISH FORMASI ==========
function AddServiceForm({ token, onSuccess, toast, editItem, onCancel }) {
  const formatPriceInitial = (p) => {
    if (!p && p !== 0) return '';
    return Number(p).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const [form, setForm] = useState({
    type: editItem?.type || 'TUYXONA', 
    name: editItem?.name || '', 
    capacity: editItem?.capacity || '', 
    price: editItem?.price ? formatPriceInitial(editItem.price) : '',
    region: editItem?.location_name?.split(',')[0]?.trim() || Object.keys(regionsAndDistricts)[0], 
    district: editItem?.location_name?.split(',')[1]?.trim() || regionsAndDistricts[Object.keys(regionsAndDistricts)[0]][0], 
    location_lat: editItem?.location_lat || null, 
    location_lng: editItem?.location_lng || null,
    description: editItem?.description || '', 
    extra_services: editItem?.extra_services || '',
  });
  const [files, setFiles] = useState([]);
  const [mapCenter, setMapCenter] = useState([41.2995, 69.2401]);

  const getPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return "Masalan: Navro'z to'yxonasi";
      case 'FOTO_VIDEO': return "Masalan: Qodirov Studio";
      case 'XONANDA': return "Masalan: Tohir Sodiqov";
      case 'SALON': return "Masalan: Go'zallik saloni";
      case 'KORTEJ': return "Masalan: Gelik 2024 (qora)";
      case 'TASHKILOTCHI': return "Masalan: To'yona Event";
      default: return "Masalan: Xizmat nomi";
    }
  };

  const getExtraServicesPlaceholder = (type) => {
    switch (type) {
      case 'TUYXONA': return "Masalan: Wi-Fi, Avtoturargoh, Konditsioner";
      case 'FOTO_VIDEO': return "Masalan: Dron, Qo'shimcha operator, Albom";
      case 'XONANDA': return "Masalan: Jonli ijro, Apparatura";
      case 'SALON': return "Masalan: Makiyaj, Soch turmagi, Tirnoq dizayni";
      case 'KORTEJ': return "Masalan: Haydovchi bilan, Bezaklar, Konditsioner";
      case 'TASHKILOTCHI': return "Masalan: Boshlovchi, Dasturxon, Sahnani bezash";
      default: return "Masalan: Wi-Fi, Avtoturargoh";
    }
  };

  const [existingImages, setExistingImages] = useState(editItem?.images || []);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleRemoveExistingImage = async (imgId) => {
    if (!confirm("Rostdan ham bu rasmni o'chirmoqchimisiz?")) return;
    try {
      const res = await api.deleteServiceImage(imgId, token);
      if (res.success) {
        setExistingImages(prev => prev.filter(img => img.id !== imgId));
        toast.success("Rasm o'chirildi.");
      } else {
        toast.error(res.message || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    }
  };

  const handleSetMainImage = async (imgId) => {
    try {
      const res = await api.setMainImage(imgId, token);
      if (res.success) {
        setExistingImages(prev => prev.map(img => ({ ...img, is_main: img.id === imgId })));
        toast.success("Asosiy rasm o'rnatildi!");
      } else {
        toast.error(res.message || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Tarmoq xatosi");
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'region') {
      const region = e.target.value;
      const firstDistrict = regionsAndDistricts[region][0];
      const coords = regionCoordinates[region];
      
      const newLat = coords ? coords.lat : 41.2995;
      const newLng = coords ? coords.lng : 69.2401;
      
      setForm({ 
        ...form, 
        region, 
        district: firstDistrict,
        location_lat: newLat,
        location_lng: newLng
      });
      
      if (coords) {
        setMapCenter([coords.lat, coords.lng]);
      }
      return;
    } else if (e.target.name === 'district') {
      const district = e.target.value;
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(district + ', ' + form.region + ', Uzbekistan')}`)
        .then(res => res.json())
        .then(data => {
          let newLat, newLng;
          if (data && data.length > 0) {
            newLat = parseFloat(data[0].lat);
            newLng = parseFloat(data[0].lon);
          } else {
            const fallback = regionCoordinates[form.region];
            newLat = fallback ? fallback.lat : 41.2995;
            newLng = fallback ? fallback.lng : 69.2401;
          }
          
          setForm(prev => ({
            ...prev, 
            district,
            location_lat: newLat,
            location_lng: newLng
          }));
          setMapCenter([newLat, newLng]);
        })
        .catch(() => {
          const fallback = regionCoordinates[form.region];
          if (fallback) {
            setForm(prev => ({
              ...prev,
              district,
              location_lat: fallback.lat,
              location_lng: fallback.lng
            }));
            setMapCenter([fallback.lat, fallback.lng]);
          }
        });

      return;
    } else if (e.target.name === 'price') {
      const rawValue = e.target.value.replace(/\D/g, '');
      setForm({ ...form, price: rawValue ? Number(rawValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '' });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFileError(''); // Har safar fayl tanlanganda xatoni tozalash
    if (selectedFiles.length === 0) return;
    
    const compressedFiles = [];
    let oversized = false;
    
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        oversized = true;
        continue;
      }

      if (file.size > 1024 * 1024) { // 1MB dan katta bo'lsa siqamiz
        try {
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            initialQuality: 0.7
          };
          const compressedFile = await imageCompression(file, options);
          compressedFiles.push(compressedFile);
        } catch (error) {
          console.error("Siqishda xatolik:", error);
          compressedFiles.push(file);
        }
      } else {
        compressedFiles.push(file);
      }
    }
    
    if (oversized) {
      setFileError("Fayl hajmi 5MB dan oshmasligi kerak. Iltimos, kichikroq rasm tanlang.");
    }
    
    setFiles(compressedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.region || !form.district) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    setLoading(true);
    try {
      const serviceData = {
        ...form,
        price: form.price.replace(/\s/g, ''),
        location_name: `${form.region}, ${form.district}`,
        capacity: form.capacity || null,
        location_lat: form.location_lat,
        location_lng: form.location_lng,
      };

      let serviceRes;
      if (editItem) {
        serviceRes = await api.updateService(editItem.id, serviceData, token);
      } else {
        serviceRes = await api.createService(serviceData, token);
      }

      if (!serviceRes.success && !editItem) {
        toast.error(serviceRes.message || "Xizmatni saqlashda xatolik.");
        setLoading(false);
        return;
      }
      if (editItem && serviceRes.error) {
        toast.error(serviceRes.error || "Xizmatni saqlashda xatolik.");
        setLoading(false);
        return;
      }

      const serviceId = editItem ? editItem.id : serviceRes.data.id;

      if (files.length > 0) {
        const uploadRes = await api.uploadImages(serviceId, files, token);
        if (!uploadRes.success) {
          toast.info("Xizmat saqlandi, lekin yangi rasmlarni yuklashda xatolik.");
        }
      }

      toast.success(`Xizmat muvaffaqiyatli ${editItem ? 'yangilandi' : 'qo\'shildi'}!`);
      if (!editItem) {
        setForm({
          type: 'TUYXONA', name: '', capacity: '', price: '',
          region: Object.keys(regionsAndDistricts)[0], district: regionsAndDistricts[Object.keys(regionsAndDistricts)[0]][0],
          location_lat: null, location_lng: null,
          description: '', extra_services: '',
        });
        setFiles([]);
      }
      onSuccess();
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(`Xatolik: ${err.message || "Server bilan aloqa yo'q yoki rasm hajmi katta."}`);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7C3AED]/50 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/20 transition-colors';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">{editItem ? 'Xizmatni tahrirlash' : 'Yangi xizmat qo\'shish'}</h2>
        {editItem && (
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-700">Bekor qilish</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Xizmat turi *</label>
          <select name="type" value={form.type} onChange={handleChange} className={inputCls}>
            {SERVICE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Xizmat nomi *</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className={inputCls} 
              placeholder={getPlaceholder(form.type)} 
            />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Narxi (so&apos;m) *</label>
          <input name="price" type="text" value={form.price} onChange={handleChange} placeholder="15 000 000" className={inputCls} />
        </div>

        {form.type === 'TUYXONA' && (
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Sig&apos;imi (kishi) - faqat tuyxona uchun</label>
            <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="300" className={inputCls} />
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Viloyat *</label>
          <select name="region" value={form.region} onChange={handleChange} className={inputCls}>
            {Object.keys(regionsAndDistricts).map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Tuman / Shahar *</label>
          <select name="district" value={form.district} onChange={handleChange} className={inputCls}>
            {regionsAndDistricts[form.region]?.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Xarita */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Joylashuvni xaritadan belgilang</label>
        <LocationPicker
          lat={form.location_lat}
          lng={form.location_lng}
          onLocationSelect={(lat, lng) => setForm({ ...form, location_lat: lat, location_lng: lng })}
          mapCenter={mapCenter}
        />
      </div>

      {/* Tavsif */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Tavsif</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Xizmat haqida batafsil..." className={inputCls + ' resize-none'} />
      </div>

      {/* Qo'shimcha xizmatlar */}
      <div>
        <div className="flex justify-between items-baseline mb-1.5">
          <label className="text-xs text-gray-500">Qo&apos;shimcha xizmatlar</label>
          <span className="text-[10px] text-gray-400">(vergul bilan ajrating)</span>
        </div>
        <textarea 
          name="extra_services" 
          value={form.extra_services} 
          onChange={handleChange} 
          rows={2} 
          placeholder={getExtraServicesPlaceholder(form.type)} 
          className={inputCls + ' resize-none'} 
        />
      </div>

      {/* Rasmlar */}
      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Rasmlar (max 5 ta, har biri 5MB gacha)</label>
        
        {existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map(img => (
              <div key={img.id} className={`relative w-24 h-24 rounded-lg overflow-hidden border ${img.is_main ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]' : 'border-gray-200'}`}>
                <img src={img.image_path?.startsWith('http') ? img.image_path : `${IMAGE_BASE}${img.image_path}`} alt="Xizmat" className="w-full h-full object-cover" />
                <button type="button" onClick={() => handleRemoveExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors">X</button>
                {!img.is_main && (
                  <button type="button" onClick={() => handleSetMainImage(img.id)} className="absolute bottom-1 left-1 right-1 bg-white/90 text-[#7C3AED] py-1 rounded text-[10px] font-bold shadow-sm hover:bg-[#7C3AED] hover:text-white transition-colors">Asosiy qilish</button>
                )}
                {img.is_main && (
                  <div className="absolute top-1 left-1 bg-[#7C3AED] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">★</div>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#7C3AED]/10 file:text-[#7C3AED] hover:file:bg-[#7C3AED]/20 file:transition-colors file:cursor-pointer mb-3"
        />
        {fileError && <p className="text-red-500 text-xs mb-3 font-medium">{fileError}</p>}
        
        {files.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {files.map((f, i) => (
              <div key={i} className={`relative w-24 h-24 rounded-lg overflow-hidden border ${i === 0 && existingImages.length === 0 ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]' : 'border-gray-200'}`}>
                <img src={URL.createObjectURL(f)} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors">X</button>
                {!(i === 0 && existingImages.length === 0) && (
                  <button type="button" onClick={() => {
                    const newFiles = [...files];
                    const selected = newFiles.splice(i, 1)[0];
                    newFiles.unshift(selected);
                    setFiles(newFiles);
                  }} className="absolute bottom-1 left-1 right-1 bg-white/90 text-[#7C3AED] py-1 rounded text-[10px] font-bold shadow-sm hover:bg-[#7C3AED] hover:text-white transition-colors">Asosiy qilish</button>
                )}
                {(i === 0 && existingImages.length === 0) && (
                  <div className="absolute top-1 left-1 bg-[#7C3AED] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">★</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all disabled:opacity-75 flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Yuklanmoqda, kuting...
          </span>
        ) : 'Xizmatni saqlash'}
      </button>
    </form>
  );
}

// ========== KALENDAR (kunni band/bekor qilish) ==========
function BlockCalendar({ service, token, toast, onBlocked }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blocking, setBlocking] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, day: null });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthName = currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

  const bookedDates = useMemo(() => {
    const map = new Map();
    (service.bookings || []).forEach((b) => {
      map.set(b.date, b.status || 'CONFIRMED');
    });
    return map;
  }, [service.bookings]);

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getDateStr = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleBlock = async (day) => {
    const dateStr = getDateStr(day);
    const date = new Date(year, month, day);
    if (date < today) return;

    setBlocking(true);
    try {
      const res = await api.blockDate({ service_id: service.id, date: dateStr }, token);
      if (res.success) {
        toast.success(`${dateStr} sanasi band qilindi!`);
        onBlocked();
      } else {
        toast.error(res.message || 'Xatolik yuz berdi.');
      }
    } catch {
      toast.error("Server bilan aloqa yo'q.");
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (day) => {
    const dateStr = getDateStr(day);
    setConfirmModal({ isOpen: false, day: null });

    setBlocking(true);
    try {
      const res = await api.unblockDate({ service_id: service.id, date: dateStr }, token);
      if (res.success) {
        toast.success(`${dateStr} sanasi ochildi!`);
        onBlocked();
      } else {
        toast.error(res.message || 'Xatolik yuz berdi.');
      }
    } catch {
      toast.error("Server bilan aloqa yo'q.");
    } finally {
      setBlocking(false);
    }
  };

  const handleDayClick = (day) => {
    const dateStr = getDateStr(day);
    if (bookedDates.has(dateStr)) {
      setConfirmModal({ isOpen: true, day: day });
    } else {
      handleBlock(day);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h4 className="text-sm font-medium text-gray-900 capitalize">{monthName}</h4>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Du','Se','Ch','Pa','Ju','Sh','Ya'].map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-500 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const dateStr = getDateStr(day);
          const bookedStatus = bookedDates.get(dateStr);
          const past = new Date(year, month, day) < today;
          return (
            <button
              key={day}
              disabled={past || blocking}
              onClick={() => handleDayClick(day)}
              title={bookedStatus === 'CONFIRMED' ? 'Tasdiqlangan band (bekor qilish uchun bosing)' : bookedStatus === 'PENDING' ? 'Kutilmoqda (bekor qilish uchun bosing)' : past ? "O'tgan" : 'Bosib band qiling'}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                bookedStatus === 'CONFIRMED' ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:ring-2 hover:ring-red-300 cursor-pointer'
                : bookedStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:ring-2 hover:ring-yellow-300 cursor-pointer'
                : past ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 hover:bg-[#7C3AED]/15 hover:text-[#7C3AED] cursor-pointer'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block"></span>
          Tasdiqlangan
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200 inline-block"></span>
          Kutilmoqda
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block"></span>
          Bo&apos;sh
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tasdiqlang</h3>
            <p className="text-sm text-gray-600 mb-6">
              Siz rostdan ham <span className="font-semibold text-gray-900">{getDateStr(confirmModal.day)}</span> sanasidagi bandlikni bekor qilmoqchimisiz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmModal({ isOpen: false, day: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Yo&apos;q, qaytish
              </button>
              <button
                onClick={() => handleUnblock(confirmModal.day)}
                disabled={blocking}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/30 disabled:opacity-50"
              >
                {blocking ? 'Kuting...' : 'Ha, bekor qilish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== ASOSIY SAHIFA ==========
export default function MyServicesPage() {
  const { token } = useAuth();
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchServices = async () => {
    if (!token) return;
    try {
      const res = await api.getMyServices(token);
      setServices(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [token]);

  const handleDelete = async (id) => {
    if (!confirm("Rostdan o'chirmoqchimisiz?")) return;
    try {
      const res = await api.deleteService(id, token);
      if (res.success) {
        toast.success("Xizmat o'chirildi!");
        fetchServices();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Xatolik yuz berdi.');
    }
  };

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedServices = services.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xizmatlarim</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} ta xizmat</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingService(null); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white hover:shadow-lg hover:shadow-[#7C3AED]/20 transition-all"
        >
          {showForm || editingService ? 'Yopish' : "+ Xizmat qo'shish"}
        </button>
      </div>

      {(showForm || editingService) && (
        <AddServiceForm
          token={token}
          toast={toast}
          editItem={editingService}
          onCancel={() => setEditingService(null)}
          onSuccess={() => { setShowForm(false); setEditingService(null); fetchServices(); }}
        />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">{'📦'}</p>
          <p>Hali xizmat qo&apos;shmagansiz</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Rasm */}
              <div className="h-40 bg-gradient-to-br from-purple-50 to-gray-50 relative">
                {service.images?.[0] ? (
                  <img src={service.images[0].image_path?.startsWith('http') ? service.images[0].image_path : `${IMAGE_BASE}${service.images[0].image_path?.startsWith('/') ? service.images[0].image_path : '/' + service.images[0].image_path}`} alt={service.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">{'🏢'}</div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setShowForm(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors text-sm border border-blue-200 shadow-sm"
                    title="Tahrirlash"
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors text-sm border border-red-200 shadow-sm"
                    title="O'chirish"
                  >X</button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                  <span className="text-xs text-gray-500">{SERVICE_TYPES.find(t => t.value === service.type)?.label}</span>
                </div>
                <p className="text-lg font-bold text-[#7C3AED]">{formatPrice(service.price)} so&apos;m</p>
                <p className="text-xs text-gray-500">
                  {service._count?.bookings || 0} ta buyurtma
                  {service.capacity && ` | ${service.capacity} kishi`}
                </p>

                <button
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  className="w-full py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:text-[#7C3AED] hover:border-[#7C3AED]/30 transition-all"
                >
                  {selectedService === service.id ? 'Kalendarni yopish' : 'Kunlarni boshqarish'}
                </button>

                {selectedService === service.id && (
                  <BlockCalendar
                    service={service}
                    token={token}
                    toast={toast}
                    onBlocked={fetchServices}
                  />
                )}
              </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-2xl">
              <span className="text-sm text-gray-500">
                {startIndex + 1} - {Math.min(startIndex + itemsPerPage, services.length)} / {services.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Oldingi
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Keyingi
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
