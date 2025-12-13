import React, { useState, useEffect } from 'react'
import { sweetsAPI } from '../services/api'
import SweetCard from '../components/SweetCard'
import LoadingSpinner from '../components/LoadingSpinner'
import Notification from '../components/Notification'
import './Dashboard.css'

const Dashboard = () => {
  const [sweets, setSweets] = useState([])
  const [filteredSweets, setFilteredSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  // Fetch sweets on component mount
  useEffect(() => {
    fetchSweets()
  }, [])

  // Apply filters whenever relevant state changes
  useEffect(() => {
    applyFilters()
  }, [sweets, searchTerm, selectedCategory, priceRange, availabilityFilter])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sweetsAPI.getAll()
      setSweets(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sweets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...sweets]

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(sweet =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(sweet => sweet.category === selectedCategory)
    }

    // Filter by price range
    if (priceRange.min !== '') {
      const min = parseFloat(priceRange.min)
      if (!isNaN(min)) {
        filtered = filtered.filter(sweet => sweet.price >= min)
      }
    }
    if (priceRange.max !== '') {
      const max = parseFloat(priceRange.max)
      if (!isNaN(max)) {
        filtered = filtered.filter(sweet => sweet.price <= max)
      }
    }

    // Filter by availability
    if (availabilityFilter === 'in-stock') {
      filtered = filtered.filter(sweet => sweet.quantity > 0)
    } else if (availabilityFilter === 'out-of-stock') {
      filtered = filtered.filter(sweet => sweet.quantity === 0)
    }

    setFilteredSweets(filtered)
  }

  const handlePurchaseSuccess = (sweetId) => {
    setSweets(prevSweets =>
      prevSweets.map(sweet =>
        sweet._id === sweetId
          ? { ...sweet, quantity: sweet.quantity - 1 }
          : sweet
      )
    )
    setNotification({ message: 'Purchase successful! 🎉', type: 'success' })
  }

  // Get unique categories for filter
  const categories = ['all', ...new Set(sweets.map(sweet => sweet.category))]

  if (loading) {
    return <LoadingSpinner message="Loading sweets..." />
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchSweets} className="retry-button">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🍭 Sweet Shop Dashboard</h1>
        <p>Browse and purchase your favorite sweets!</p>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Search and Filter Section */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search sweets by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="minPrice">Min Price ($)</label>
            <input
              type="number"
              id="minPrice"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price ($)</label>
            <input
              type="number"
              id="maxPrice"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              placeholder="100.00"
              min="0"
              step="0.01"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {filteredSweets.length} of {sweets.length} sweets
      </div>

      {/* Sweets Grid */}
      {filteredSweets.length === 0 ? (
        <div className="empty-state">
          <p>🍬 No sweets found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setPriceRange({ min: '', max: '' })
              setAvailabilityFilter('all')
            }}
            className="clear-filters-button"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="sweets-grid">
          {filteredSweets.map(sweet => (
            <SweetCard
              key={sweet._id}
              sweet={sweet}
              onPurchaseSuccess={handlePurchaseSuccess}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard

