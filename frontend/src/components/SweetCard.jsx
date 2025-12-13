import React, { useState } from 'react'
import { sweetsAPI } from '../services/api'
import './SweetCard.css'

const SweetCard = ({ sweet, onPurchaseSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePurchase = async () => {
    if (sweet.quantity === 0 || loading) return

    setLoading(true)
    setError(null)

    try {
      await sweetsAPI.purchase(sweet._id, 1)
      onPurchaseSuccess(sweet._id)
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const imageUrl = sweet.image 
    ? (sweet.image.startsWith('http') ? sweet.image : `http://localhost:5000${sweet.image}`)
    : null

  return (
    <div className={`sweet-card ${sweet.quantity === 0 ? 'out-of-stock' : ''}`}>
      {imageUrl && (
        <div className="sweet-card-image">
          <img src={imageUrl} alt={sweet.name} />
        </div>
      )}
      <div className="sweet-card-header">
        <h3 className="sweet-name">{sweet.name}</h3>
        <span className="sweet-category">{sweet.category}</span>
      </div>
      <div className="sweet-card-body">
        <div className="sweet-info">
          <div className="sweet-price">${sweet.price.toFixed(2)}</div>
          <div className="sweet-quantity">
            {sweet.quantity > 0 ? (
              <span className="in-stock">In Stock: {sweet.quantity}</span>
            ) : (
              <span className="out-of-stock-label">Out of Stock</span>
            )}
          </div>
        </div>
        {error && <div className="sweet-error">{error}</div>}
        <button
          className="purchase-button"
          onClick={handlePurchase}
          disabled={sweet.quantity === 0 || loading}
        >
          {loading ? 'Processing...' : sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
        </button>
      </div>
    </div>
  )
}

export default SweetCard

