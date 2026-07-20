export const API_BASE = 'demo';
export const IMAGE_BASE = '';

const MOCK_SERVICES = [
  {
    id: 1,
    name: "Yakkasaroy To'yxonasi",
    type: "TUYXONA",
    capacity: 600,
    price: 30000000,
    description: "Toshkent shahridagi eng muhtasham va hashamatli to'yxonalardan biri. 600 kishigacha bo'lgan mehmonlarni qabul qila oladi. Ajoyib interyer va yuqori darajadagi xizmat.",
    location_name: "Yakkasaroy tumani, Toshkent",
    images: [{ image_path: "https://images.unsplash.com/photo-1519167758481-83f524b72b55?q=80&w=1000&auto=format&fit=crop" }],
    provider: { name: "Yakkasaroy Admin", phone_number: "+998 90 123 45 67" },
    reviews: [
      { id: 1, user_name: "Azizbek", rating: 5, comment: "Juda ajoyib to'yxona, xizmat ko'rsatish a'lo darajada!", created_at: "2026-07-01T10:00:00Z" }
    ],
    bookings: []
  },
  {
    id: 2,
    name: "Golden Moments Foto va Video",
    type: "FOTO_VIDEO",
    capacity: null,
    price: 4500000,
    description: "To'y va marosimlarni eng zamonaviy 4K kameralarda tasvirga tushirish. Dron xizmatlari va Love Story videolar kiritilgan.",
    location_name: "Toshkent shahar",
    images: [{ image_path: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop" }],
    provider: { name: "Sardor Photographer", phone_number: "+998 99 987 65 43" },
    reviews: [],
    bookings: []
  },
  {
    id: 3,
    name: "Gulinur va Ansambli",
    type: "XONANDA",
    capacity: null,
    price: 15000000,
    description: "To'yingizni fayzli va unutilmas o'tishini ta'minlovchi professional sozandalar va xonandalar jamoasi.",
    location_name: "Barcha viloyatlar",
    images: [{ image_path: "https://images.unsplash.com/photo-1516280440502-3c13749d6373?q=80&w=1000&auto=format&fit=crop" }],
    provider: { name: "Gulinur", phone_number: "+998 97 777 77 77" },
    reviews: [],
    bookings: []
  },
  {
    id: 4,
    name: "Luxury VIP Kortej",
    type: "KORTEJ",
    capacity: null,
    price: 2500000,
    description: "Mercedes-Benz G-Class (Gelendvagen) va S-Class avtomobillaridan iborat zamonaviy to'y korteji xizmati.",
    location_name: "Toshkent",
    images: [{ image_path: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop" }],
    provider: { name: "VIP Kortej", phone_number: "+998 90 000 00 01" },
    reviews: [],
    bookings: []
  }
];

const MOCK_USER = {
  id: 99,
  name: "Demo Foydalanuvchi",
  phone_number: "+998901234567",
  role: "USER"
};

const MOCK_PROVIDER = {
  id: 100,
  name: "Demo Xizmatchi",
  phone_number: "+998991112233",
  role: "PROVIDER"
};

const MOCK_PROVIDER_DASHBOARD = {
  totalBookings: 12,
  pendingBookings: 3,
  confirmedBookings: 8,
  cancelledBookings: 1,
  servicesCount: 2,
  totalRevenue: 45000000,
  recentBookings: [
    { id: 101, user_name: "Azizbek", date: "2026-07-20", status: "PENDING", total_price: 15000000, service_name: "Yakkasaroy To'yxonasi", created_at: "2026-07-10T10:00:00Z" },
    { id: 102, user_name: "Malika", date: "2026-07-22", status: "CONFIRMED", total_price: 4500000, service_name: "Golden Moments Foto", created_at: "2026-07-09T14:30:00Z" }
  ]
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Parolga 'provider' deb yozsa provayder bo'lib kiradi.
export const api = {
  // Auth
  register: async (data) => { 
    await delay(500); 
    const isProvider = data?.role === 'PROVIDER' || data?.password === 'provider';
    return { success: true, token: 'demo-token', user: isProvider ? MOCK_PROVIDER : MOCK_USER }; 
  },
  login: async (data) => { 
    await delay(500); 
    const isProvider = data?.password === 'provider';
    return { success: true, token: 'demo-token', user: isProvider ? MOCK_PROVIDER : MOCK_USER }; 
  },
  getMe: async () => { await delay(300); return { success: true, data: MOCK_USER }; },

  // Services
  getServices: async () => { await delay(500); return { success: true, data: MOCK_SERVICES }; },
  getServiceById: async (id) => { 
    await delay(300); 
    const s = MOCK_SERVICES.find(x => x.id == id);
    return { success: true, data: s }; 
  },
  addReview: async () => { await delay(500); return { success: true }; },
  getMyReviews: async () => { return { success: true, data: [] }; },
  getMyServices: async () => { return { success: true, data: MOCK_SERVICES.slice(0, 2) }; },
  getProviderDashboard: async () => { await delay(400); return { success: true, data: MOCK_PROVIDER_DASHBOARD }; },
  createService: async () => { return { success: true }; },
  updateService: async () => { return { success: true }; },
  deleteService: async () => { return { success: true }; },
  deleteServiceImage: async () => { return { success: true }; },
  uploadImages: async () => { return { success: true }; },

  // Bookings
  createBooking: async () => { await delay(800); return { success: true }; },
  getMyBookings: async () => { await delay(500); return { success: true, data: [] }; },
  getProviderBookings: async () => { return { success: true, data: MOCK_PROVIDER_DASHBOARD.recentBookings }; },
  updateBookingStatus: async () => { return { success: true }; },
  blockDate: async () => { return { success: true }; },
  unblockDate: async () => { return { success: true }; },
};
