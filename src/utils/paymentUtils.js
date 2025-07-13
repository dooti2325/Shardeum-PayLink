// Payment utilities for secure, time-limited payment links

/**
 * Generate a secure payment link with expiry
 * @param {Object} paymentData - Payment information
 * @param {number} expirySeconds - Expiry time in seconds (default: 30)
 * @returns {string} - Encoded payment link with expiry
 */
export const generateSecurePaymentLink = (paymentData, expirySeconds = 30) => {
  const expiryTimestamp = Date.now() + (expirySeconds * 1000)
  
  const securePaymentData = {
    ...paymentData,
    expiry: expiryTimestamp,
    createdAt: Date.now()
  }
  
  return btoa(JSON.stringify(securePaymentData))
}

/**
 * Decode and validate a payment link
 * @param {string} encodedData - Base64 encoded payment data
 * @returns {Object|null} - Decoded payment data or null if invalid/expired
 */
export const decodeSecurePaymentLink = (encodedData) => {
  try {
    const paymentData = JSON.parse(atob(encodedData))
    const now = Date.now()
    
    // Check if link has expired
    if (paymentData.expiry && now > paymentData.expiry) {
      return { error: 'Payment link has expired' }
    }
    
    // Check if link is too old (additional security)
    const maxAge = 60 * 1000 // 1 minute maximum age
    if (paymentData.createdAt && (now - paymentData.createdAt) > maxAge) {
      return { error: 'Payment link is too old' }
    }
    
    return paymentData
  } catch (error) {
    console.error('Error decoding payment link:', error)
    return { error: 'Invalid payment link format' }
  }
}

/**
 * Check if a payment link is expired
 * @param {string} encodedData - Base64 encoded payment data
 * @returns {boolean} - True if expired, false otherwise
 */
export const isPaymentLinkExpired = (encodedData) => {
  try {
    const paymentData = JSON.parse(atob(encodedData))
    const now = Date.now()
    
    return paymentData.expiry && now > paymentData.expiry
  } catch (error) {
    return true // Consider invalid links as expired
  }
}

/**
 * Get time remaining until expiry
 * @param {string} encodedData - Base64 encoded payment data
 * @returns {number} - Milliseconds remaining, 0 if expired
 */
export const getTimeRemaining = (encodedData) => {
  try {
    const paymentData = JSON.parse(atob(encodedData))
    const now = Date.now()
    
    if (!paymentData.expiry) return 0
    
    const remaining = paymentData.expiry - now
    return Math.max(0, remaining)
  } catch (error) {
    return 0
  }
}

/**
 * Format time remaining for display
 * @param {number} milliseconds - Time remaining in milliseconds
 * @returns {string} - Formatted time string
 */
export const formatTimeRemaining = (milliseconds) => {
  if (milliseconds <= 0) return 'Expired'
  
  const seconds = Math.ceil(milliseconds / 1000)
  return `${seconds}s remaining`
}

/**
 * Generate a one-click payment URI with expiry
 * @param {string} address - Recipient address
 * @param {number} amount - Amount in SHM
 * @param {number} expirySeconds - Expiry time in seconds
 * @returns {string} - Ethereum URI with expiry data
 */
export const generateOneClickPaymentURI = (address, amount, expirySeconds = 30) => {
  const expiryTimestamp = Date.now() + (expirySeconds * 1000)
  
  // Create a custom data field with expiry information
  const expiryData = {
    expiry: expiryTimestamp,
    createdAt: Date.now()
  }
  
  const data = btoa(JSON.stringify(expiryData))
  
  return `ethereum:${address}@8083?value=${amount}&data=${data}`
} 