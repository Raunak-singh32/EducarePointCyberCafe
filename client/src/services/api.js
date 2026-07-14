import axios from 'axios';

const API_URL = 'https://educarepointcybercafe-1.onrender.com';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ── Auto-attach JWT token to every request if logged in ──
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('educare_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Product APIs
export const productAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// Order APIs
export const orderAPI = {
    create: (data) => api.post('/orders', data),
    getAll: () => api.get('/orders'),
    updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
     uploadPaymentScreenshot: (id, formData) => api.post(`/orders/${id}/payment-screenshot`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    verifyPayment: (id, paymentStatus) => api.put(`/orders/${id}/verify-payment`, { paymentStatus }),
    getByPhone: (phone) => api.get(`/orders/by-phone/${phone}`)
};

// Upload APIs
export const uploadAPI = {
    uploadFile: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Auth APIs ── NEW ──
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update', data)
};

export default api;