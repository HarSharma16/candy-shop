import React, { useState, useEffect } from 'react'
import { sweetsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Notification from '../components/Notification'
import './AdminPanel.css'

const AdminPanel = () => {
  const [sweets, setSweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSweet, setEditingSweet] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    image: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchSweets()
  }, [])

  const fetchSweets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sweetsAPI.getAll()
      setSweets(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sweets.')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    
    if (formData.quantity === '' || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Valid quantity is required'
    }
    
    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      quantity: '',
      image: ''
    })
    setImageFile(null)
    setImagePreview(null)
    setFormErrors({})
    setEditingSweet(null)
    setShowAddForm(false)
  }

  const handleAdd = () => {
    resetForm()
    setShowAddForm(true)
  }

  const handleEdit = (sweet) => {
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: sweet.price.toString(),
      quantity: sweet.quantity.toString(),
      image: sweet.image || ''
    })
    setImageFile(null)
    setImagePreview(sweet.image ? `http://localhost:5000${sweet.image}` : null)
    setEditingSweet(sweet)
    setShowAddForm(true)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Please select an image file'
        }))
        return
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }))
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      if (formErrors.image) {
        setFormErrors(prev => ({
          ...prev,
          image: ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormLoading(true)
    try {
      const sweetData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        image: formData.image
      }

      if (editingSweet) {
        await sweetsAPI.update(editingSweet._id, sweetData, imageFile)
        setNotification({ message: 'Sweet updated successfully! 🎉', type: 'success' })
      } else {
        await sweetsAPI.create(sweetData, imageFile)
        setNotification({ message: 'Sweet added successfully! 🎉', type: 'success' })
      }

      resetForm()
      fetchSweets()
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || 'Operation failed. Please try again.',
        type: 'error'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return
    }

    try {
      await sweetsAPI.delete(id)
      setNotification({ message: 'Sweet deleted successfully!', type: 'success' })
      fetchSweets()
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || 'Delete failed. Please try again.',
        type: 'error'
      })
    }
  }

  const handleRestock = async (id, currentQuantity) => {
    const restockAmount = prompt(`Current quantity: ${currentQuantity}\nEnter amount to add:`)
    
    if (!restockAmount || isNaN(restockAmount) || parseInt(restockAmount) <= 0) {
      return
    }

    try {
      await sweetsAPI.restock(id, parseInt(restockAmount))
      setNotification({ message: 'Restocked successfully! 🎉', type: 'success' })
      fetchSweets()
    } catch (err) {
      setNotification({
        message: err.response?.data?.message || 'Restock failed. Please try again.',
        type: 'error'
      })
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading admin panel..." />
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h1>🍬 Admin Panel</h1>
        <p>Manage sweets inventory</p>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchSweets} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="admin-actions">
        <button onClick={handleAdd} className="add-button">
          + Add New Sweet
        </button>
      </div>

      {showAddForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h2>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'input-error' : ''}
                  placeholder="Sweet name"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={formErrors.category ? 'input-error' : ''}
                  placeholder="e.g., Chocolate, Candy, Pastry"
                />
                {formErrors.category && <span className="error-message">{formErrors.category}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={formErrors.price ? 'input-error' : ''}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {formErrors.price && <span className="error-message">{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={formErrors.quantity ? 'input-error' : ''}
                  placeholder="0"
                  min="0"
                />
                {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="image">Product Image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={formErrors.image ? 'input-error' : ''}
                />
                {formErrors.image && <span className="error-message">{formErrors.image}</span>}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setImageFile(null)
                      }}
                      className="remove-image-button"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingSweet ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-message">
                  No sweets available. Add your first sweet!
                </td>
              </tr>
            ) : (
              sweets.map(sweet => (
                <tr key={sweet._id}>
                  <td>
                    {sweet.image ? (
                      <img 
                        src={`http://localhost:5000${sweet.image}`} 
                        alt={sweet.name}
                        className="admin-table-image"
                      />
                    ) : (
                      <div className="admin-table-image-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{sweet.name}</td>
                  <td>{sweet.category}</td>
                  <td>${sweet.price.toFixed(2)}</td>
                  <td>
                    <span className={sweet.quantity === 0 ? 'out-of-stock-badge' : 'in-stock-badge'}>
                      {sweet.quantity}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(sweet)}
                        className="edit-button"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleRestock(sweet._id, sweet.quantity)}
                        className="restock-button"
                        title="Restock"
                      >
                        📦
                      </button>
                      <button
                        onClick={() => handleDelete(sweet._id)}
                        className="delete-button"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminPanel

