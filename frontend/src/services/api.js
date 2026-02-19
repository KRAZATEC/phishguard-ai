import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('phishguard_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 — auto logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('phishguard_token')
            localStorage.removeItem('phishguard_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    register: (data) => api.post('/register', data),
    login: (data) => api.post('/login', data),
    me: () => api.get('/me'),
}

export const detectAPI = {
    predictUrl: (url) => api.post('/predict-url', { url }),
    predictEmail: (subject, body) => api.post('/predict-email', { subject, body }),
    reportPhishing: (data) => api.post('/report-phishing', data),
    checkBreach: (email) => api.post('/check-breach', { email }),
}

export const dashboardAPI = {
    history: (limit = 20) => api.get(`/history?limit=${limit}`),
    stats: () => api.get('/stats'),
}

export default api
