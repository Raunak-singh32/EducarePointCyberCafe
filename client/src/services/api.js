import axios from 'axios';

const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://educarepointcybercafe-1.onrender.com';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();

    // Determine if this request is specifically for admin operations
    const isAdminRequest =
        url.startsWith('/products/admin') ||
        url.startsWith('/upload/product-image') ||
        url.startsWith('/auth/admin') ||
        url.startsWith('/download') ||
        url.includes('/verify-payment') ||
        url.includes('/stats/today') ||
        (url === '/orders' && method === 'get') ||
        (url.startsWith('/orders/') && !url.includes('/by-phone') && !url.includes('/payment-screenshot') && method !== 'post') ||
        (url === '/products' && method !== 'get') ||
        (url.startsWith('/products/') && method !== 'get');

    let token = null;
    if (isAdminRequest) {
        token = localStorage.getItem('adminToken');
    } else {
        token = localStorage.getItem('educare_token');
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const productAPI = {
    getAll: (params = {}) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

export const orderAPI = {
    create: (data) => api.post('/orders', data),
    getAll: (params = {}) => api.get('/orders', { params }),
    updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
    uploadPaymentScreenshot: (id, formData) => api.post(`/orders/${id}/payment-screenshot`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    verifyPayment: (id, paymentStatus) => api.put(`/orders/${id}/verify-payment`, { paymentStatus }),
    lookup: (phone, orderId) => api.post('/orders/lookup', { phone, orderId })
};

export const uploadAPI = {
    uploadFile: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    uploadProductImage: (formData) => api.post('/upload/product-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin/login', data),
    logout: () => api.post('/auth/logout'),
    exchangeGoogleCode: (code) => api.post('/auth/google/exchange', { code }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update', data)
};

export default api;
