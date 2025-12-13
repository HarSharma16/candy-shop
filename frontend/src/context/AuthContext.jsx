import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  // Register new user
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { token, user: userInfo } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userInfo))
      setUser(userInfo)
      
      return { success: true }
    } catch (error) {
      // Extract error message from response
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage
      } else if (error.message) {
        // Network or other error
        errorMessage = error.message
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token, user: userInfo } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userInfo))
      setUser(userInfo)
      
      return { success: true }
    } catch (error) {
      // Extract error message from response
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage
      } else if (error.message) {
        // Network or other error
        errorMessage = error.message
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAdmin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

