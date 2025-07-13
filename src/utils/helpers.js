// Utility functions for the Shardeum PayLink app

/**
 * Format an Ethereum address for display
 * @param {string} address - The full Ethereum address
 * @returns {string} - Formatted address (0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validate Ethereum address format
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format SHM amount with proper decimal places
 * @param {string|number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 4)
 * @returns {string} - Formatted amount
 */
export const formatAmount = (amount, decimals = 4) => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0.0000'
  return num.toFixed(decimals)
}

/**
 * Generate a unique payment request ID
 * @returns {string} - Unique request ID
 */
export const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Encode payment data for URL
 * @param {Object} paymentData - Payment information
 * @returns {string} - Base64 encoded data
 */
export const encodePaymentData = (paymentData) => {
  return btoa(JSON.stringify(paymentData))
}

/**
 * Decode payment data from URL
 * @param {string} encodedData - Base64 encoded data
 * @returns {Object|null} - Decoded payment data or null if invalid
 */
export const decodePaymentData = (encodedData) => {
  try {
    return JSON.parse(atob(encodedData))
  } catch (error) {
    console.error('Failed to decode payment data:', error)
    return null
  }
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Validate amount input
 * @param {string} amount - Amount string to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validateAmount = (amount) => {
  const num = parseFloat(amount)
  
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' }
  }
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' }
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' }
  }
  
  if (num > 1000000) {
    return { isValid: false, error: 'Amount is too large' }
  }
  
  return { isValid: true, error: null }
}

/**
 * Get transaction type based on addresses
 * @param {string} from - Sender address
 * @param {string} to - Recipient address
 * @param {string} currentAddress - Current user's address
 * @returns {string} - 'sent' or 'received'
 */
export const getTransactionType = (from, to, currentAddress) => {
  if (from.toLowerCase() === currentAddress.toLowerCase()) {
    return 'sent'
  }
  if (to.toLowerCase() === currentAddress.toLowerCase()) {
    return 'received'
  }
  return 'unknown'
}

/**
 * Open transaction in block explorer
 * @param {string} txHash - Transaction hash
 * @param {string} network - Network name (default: 'shardeum')
 */
export const openInExplorer = (txHash, network = 'shardeum') => {
  const explorers = {
    shardeum: `https://explorer-sphinx.shardeum.org/tx/${txHash}`,
    ethereum: `https://etherscan.io/tx/${txHash}`,
    polygon: `https://polygonscan.com/tx/${txHash}`
  }
  
  const url = explorers[network] || explorers.shardeum
  window.open(url, '_blank')
} 