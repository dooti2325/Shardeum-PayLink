import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, X } from 'lucide-react'

const TransactionNotification = ({ transaction, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
      case 'error':
      case 'timeout':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (transaction.status) {
      case 'confirmed':
        return 'Transaction Confirmed'
      case 'failed':
        return 'Transaction Failed'
      case 'pending':
        return 'Transaction Pending'
      case 'timeout':
        return 'Transaction Timeout'
      default:
        return 'Transaction Processing'
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200'
      case 'failed':
      case 'error':
      case 'timeout':
        return 'bg-red-50 border-red-200'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className={`card border ${getStatusColor()} shadow-lg`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {getStatusText()}
              </p>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {transaction.value} SHM {transaction.type === 'sent' ? 'sent' : 'received'}
            </p>
            {transaction.message && (
              <p className="text-xs text-gray-500 mt-1">
                {transaction.message}
              </p>
            )}
            {transaction.hash && (
              <p className="text-xs font-mono text-gray-500 mt-1">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionNotification 