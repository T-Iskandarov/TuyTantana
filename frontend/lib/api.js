const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tuytantana.uz/api';

// ===== Umumiy fetch helper =====
const jsonPost = (url, data, token) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

const jsonPut = (url, data, token) =>
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  }).then((r) => r.json());

const authGet = (url, token) =>
  fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

const authDelete = (url, token) =>
  fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

export const api = {
  // ===== Auth =====
  register: (data) => jsonPost(`${API_BASE}/auth/register`, data),
  login: (data) => jsonPost(`${API_BASE}/auth/login`, data),
  getMe: (token) => authGet(`${API_BASE}/auth/me`, token),

  // ===== Services (Ochiq) =====
  getServices: (params) => {
    const q = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/services?${q}`).then((r) => r.json());
  },
  getServiceById: (id) => fetch(`${API_BASE}/services/${id}`).then((r) => r.json()),
  addReview: (id, data, token) => jsonPost(`${API_BASE}/services/${id}/add_review`, data, token),

  // ===== Services (Provider) =====
  getMyServices: (token) => authGet(`${API_BASE}/services/my/list`, token),

  createService: (data, token) => jsonPost(`${API_BASE}/services`, data, token),

  updateService: (id, data, token) => jsonPut(`${API_BASE}/services/${id}`, data, token),

  deleteService: (id, token) => authDelete(`${API_BASE}/services/${id}`, token),

  deleteServiceImage: (imageId, token) => authDelete(`${API_BASE.replace('/api', '')}/api/upload/${imageId}/delete`, token),

  // ===== Rasm yuklash (multipart/form-data) =====
  uploadImages: (serviceId, files, token) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return fetch(`${API_BASE}/upload/${serviceId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((r) => r.json());
  },

  deleteImage: (imageId, token) => authDelete(`${API_BASE}/upload/${imageId}`, token),

  // ===== Bookings (User) =====
  createBooking: (data, token) => jsonPost(`${API_BASE}/bookings`, data, token),
  getMyBookings: (token) => authGet(`${API_BASE}/bookings/my`, token),

  // ===== Bookings (Provider) =====
  getProviderBookings: (token) => authGet(`${API_BASE}/bookings/provider`, token),
  blockDate: (data, token) => jsonPost(`${API_BASE}/bookings/block`, data, token),
  unblockDate: (data, token) => jsonPost(`${API_BASE}/bookings/unblock`, data, token),
  updateBookingStatus: (id, status, token) =>
    jsonPut(`${API_BASE}/bookings/${id}/status`, { status }, token),

  // ===== Admin =====
  adminDashboard: (token) => authGet(`${API_BASE}/admin/dashboard`, token),
  adminAnalytics: (token, timeframe = 'daily') => authGet(`${API_BASE}/admin/analytics?timeframe=${timeframe}`, token),
  adminUsers: (token, params = '') => authGet(`${API_BASE}/admin/users?${params}`, token),
  adminServices: (token, params = '') => authGet(`${API_BASE}/admin/services?${params}`, token),
  adminBookings: (token, params = '') => authGet(`${API_BASE}/admin/bookings?${params}`, token),
};

export const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.tuytantana.uz';
