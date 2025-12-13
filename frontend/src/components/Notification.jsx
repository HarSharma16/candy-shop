import React, { useEffect } from 'react'
import './Notification.css'

const Notification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [onClose])

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  )
}

export default Notification

