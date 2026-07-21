import { Platform } from 'react-native';

// Jonli server (Production)
export const API_BASE = 'https://api.tuytantana.uz/api';
export const IMAGE_BASE = 'https://api.tuytantana.uz';

const jsonPost = async (url, data, token) => {
  const headers = { 
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { method: 'POST', headers, body: JSON.stringify(data) });
  return res.json();
};

const jsonPut = async (url, data, token) => {
  const headers = { 
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${url}`, { method: 'PUT', headers, body: JSON.stringify(data) });
  return res.json();
};

const authGet = async (url, token) => {
  const headers = {
    'Bypass-Tunnel-Reminder': 'true'
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${url}`, { headers });
  return res.json();
};

const authDelete = async (url, token) => {
  const res = await fetch(`${API_BASE}${url}`, { 
    method: 'DELETE', 
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Bypass-Tunnel-Reminder': 'true'
    } 
  });
  return res.json();
};

export const api = {
  // Auth
  register: (data) => jsonPost('/auth/register', data),
  login: (data) => jsonPost('/auth/login', data),
  getMe: (token) => authGet('/auth/me', token),

  // Services
  getServices: (params) => {
    const q = new URLSearchParams(params).toString();
    return authGet(`/services?${q}`);
  },
  getServiceById: (id) => authGet(`/services/${id}`),
  addReview: (id, data, token) => jsonPost(`/services/${id}/add_review`, data, token),
  getMyReviews: (token) => authGet('/services/my_reviews', token),
  getMyServices: (token) => authGet('/services/my/list', token),
  createService: (data, token) => jsonPost('/services', data, token),
  updateService: (id, data, token) => jsonPut(`/services/${id}`, data, token),
  deleteService: (id, token) => authDelete(`/services/${id}`, token),
  deleteServiceImage: (imageId, token) => authDelete(`/upload/${imageId}/delete`, token),
  setMainImage: (imageId, token) => jsonPost(`/upload/${imageId}/main`, {}, token),

  // Images
  uploadImages: async (serviceId, files, token) => {
    const formData = new FormData();
    files.forEach((file, i) => {
      let localUri = file.uri;
      let filename = file.fileName || localUri.split('/').pop() || `image_${i}.jpg`;
      
      // Some Android devices return weird filenames, let's normalize it
      if (!filename.includes('.')) {
        filename += '.jpg';
      }

      formData.append('images', {
        uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
        type: file.mimeType || 'image/jpeg',
        name: filename,
      });
    });
    const res = await fetch(`${API_BASE}/upload/${serviceId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Bypass-Tunnel-Reminder': 'true'
      },
      body: formData,
    });
    return res.json();
  },

  // Bookings
  createBooking: (data, token) => jsonPost('/bookings', data, token),
  getMyBookings: (token) => authGet('/bookings/my', token),
  getProviderBookings: (token) => authGet('/bookings/provider', token),
  updateBookingStatus: (id, status, token) => jsonPut(`/bookings/${id}/status`, { status }, token),
  blockDate: (data, token) => jsonPost('/bookings/block', data, token),
  unblockDate: (data, token) => jsonPost('/bookings/unblock', data, token),

  // Notifications
  getNotifications: (token) => authGet('/notifications/', token),
  markNotificationAsRead: (id, token) => jsonPost(`/notifications/${id}/read/`, {}, token),
  markAllNotificationsAsRead: (token) => jsonPost('/notifications/read-all/', {}, token),
};
