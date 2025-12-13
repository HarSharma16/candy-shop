import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration and connection errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network/connection errors (backend not running or network issues)
    if (!error.response) {
      // Check if it's a connection refused error (backend not running)
      if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
        error.message = 'Unable to connect to server. Please ensure the backend server is running on port 5000.'
      } else if (error.request) {
        // Request was made but no response received
        error.message = 'Server is not responding. Please ensure the backend server is running.'
      } else {
        // Network error
        error.message = 'Network error. Please check your connection and try again.'
      }
      return Promise.reject(error)
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials)
}

export const sweetsAPI = {
  getAll: () => api.get('/sweets'),
  getById: (id) => api.get(`/sweets/${id}`),
  create: (sweetData, imageFile) => {
    const formData = new FormData()
    formData.append('name', sweetData.name)
    formData.append('category', sweetData.category)
    formData.append('price', sweetData.price)
    formData.append('quantity', sweetData.quantity)
    if (imageFile) {
      formData.append('image', imageFile)
    } else if (sweetData.image && typeof sweetData.image === 'string') {
      // If image is a URL string, send it as regular form data
      formData.append('image', sweetData.image)
    }
    return api.post('/sweets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  update: (id, sweetData, imageFile) => {
    const formData = new FormData()
    if (sweetData.name) formData.append('name', sweetData.name)
    if (sweetData.category) formData.append('category', sweetData.category)
    if (sweetData.price !== undefined) formData.append('price', sweetData.price)
    if (sweetData.quantity !== undefined) formData.append('quantity', sweetData.quantity)
    if (imageFile) {
      formData.append('image', imageFile)
    } else if (sweetData.image && typeof sweetData.image === 'string') {
      // If image is a URL string, send it as regular form data
      formData.append('image', sweetData.image)
    }
    return api.put(`/sweets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  delete: (id) => api.delete(`/sweets/${id}`),
  purchase: (id, quantity = 1) => api.post(`/sweets/${id}/purchase`, { quantity }),
  restock: (id, quantity) => api.post(`/sweets/${id}/restock`, { quantity })
}

export default api

