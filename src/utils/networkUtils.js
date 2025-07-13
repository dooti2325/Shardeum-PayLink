import { ethers } from 'ethers'

// Shardeum Sphinx network configuration
export const SHARDEUM_CONFIG = {
  chainId: '0x1F93', // 8083 in decimal
  chainName: 'Shardeum Testnet',
  nativeCurrency: {
    name: 'SHM',
    symbol: 'SHM',
    decimals: 18,
  },
  rpcUrls: ['https://api-testnet.shardeum.org/'],
  blockExplorerUrls: ['https://explorer-testnet.shardeum.org/'],
}

// Validate if we're connected to the correct network
export const validateNetwork = async (provider) => {
  try {
    const network = await provider.getNetwork()
    return network.chainId === BigInt(SHARDEUM_CONFIG.chainId)
  } catch (error) {
    console.error('Error validating network:', error)
    return false
  }
}

// Switch to Shardeum network
export const switchToShardeumNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  try {
    // Try to switch to Shardeum network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SHARDEUM_CONFIG.chainId }],
    })
    return true
  } catch (switchError) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SHARDEUM_CONFIG],
        })
        return true
      } catch (addError) {
        throw new Error(`Failed to add Shardeum network: ${addError.message}`)
      }
    } else {
      throw new Error(`Failed to switch to Shardeum network: ${switchError.message}`)
    }
  }
}

// Test connection strength by making multiple RPC calls
export const testConnectionStrength = async (provider) => {
  const tests = []
  
  try {
    // Test 1: Get latest block number
    const blockNumber = await provider.getBlockNumber()
    tests.push({ name: 'Block Number', success: true, data: blockNumber })
  } catch (error) {
    tests.push({ name: 'Block Number', success: false, error: error.message })
  }

  try {
    // Test 2: Get network info
    const network = await provider.getNetwork()
    tests.push({ name: 'Network Info', success: true, data: network })
  } catch (error) {
    tests.push({ name: 'Network Info', success: false, error: error.message })
  }

  try {
    // Test 3: Get gas price
    const gasPrice = await provider.getFeeData()
    tests.push({ name: 'Gas Price', success: true, data: gasPrice })
  } catch (error) {
    tests.push({ name: 'Gas Price', success: false, error: error.message })
  }

  const successfulTests = tests.filter(test => test.success)
  const failedTests = tests.filter(test => !test.success)

  return {
    success: successfulTests.length >= 2, // At least 2 out of 3 tests should pass
    tests,
    successfulTests,
    failedTests,
    strength: (successfulTests.length / tests.length) * 100
  }
}

// Get connection latency
export const measureConnectionLatency = async (provider) => {
  const startTime = Date.now()
  
  try {
    await provider.getBlockNumber()
    const endTime = Date.now()
    return endTime - startTime
  } catch (error) {
    throw new Error(`Connection test failed: ${error.message}`)
  }
}

// Validate wallet connection
export const validateWalletConnection = async (provider, account) => {
  if (!provider || !account) {
    return { valid: false, error: 'Provider or account not available' }
  }

  try {
    // Check if account is still accessible
    const balance = await provider.getBalance(account)
    
    // Check if we're on the correct network
    const isCorrectNetwork = await validateNetwork(provider)
    
    // Test connection strength
    const connectionTest = await testConnectionStrength(provider)
    
    // Measure latency
    const latency = await measureConnectionLatency(provider)

    return {
      valid: true,
      balance: ethers.formatEther(balance),
      isCorrectNetwork,
      connectionTest,
      latency,
      details: {
        account,
        networkValid: isCorrectNetwork,
        connectionStrong: connectionTest.success,
        latencyMs: latency
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      details: {
        account,
        networkValid: false,
        connectionStrong: false,
        latencyMs: null
      }
    }
  }
}

// Create a robust provider with fallback RPC URLs
export const createRobustProvider = () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  // Create the main provider
  const provider = new ethers.BrowserProvider(window.ethereum)
  
  // Add connection monitoring with better error handling
  const originalGetBalance = provider.getBalance.bind(provider)
  const originalGetBlockNumber = provider.getBlockNumber.bind(provider)
  
  // Wrap methods with error handling and retry logic
  provider.getBalance = async (address) => {
    let lastError = null
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const balance = await originalGetBalance(address)
        return balance
      } catch (error) {
        lastError = error
        console.error(`Balance fetch attempt ${attempt} failed:`, error.message)
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    throw new Error(`Failed to fetch balance after 3 attempts: ${lastError?.message || 'Unknown error'}`)
  }
  
  provider.getBlockNumber = async () => {
    let lastError = null
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const blockNumber = await originalGetBlockNumber()
        return blockNumber
      } catch (error) {
        lastError = error
        console.error(`Block number fetch attempt ${attempt} failed:`, error.message)
        
        if (attempt < 3) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    throw new Error(`Failed to fetch block number after 3 attempts: ${lastError?.message || 'Unknown error'}`)
  }
  
  return provider
}

// Check if MetaMask is installed and accessible
export const checkMetaMaskAvailability = () => {
  if (typeof window === 'undefined') {
    return { available: false, error: 'Window object not available' }
  }
  
  if (!window.ethereum) {
    return { available: false, error: 'MetaMask is not installed' }
  }
  
  if (!window.ethereum.isMetaMask) {
    return { available: false, error: 'MetaMask is not the primary wallet' }
  }
  
  return { available: true }
}

// Get connection status with detailed information
export const getDetailedConnectionStatus = async (provider, account) => {
  const metaMaskCheck = checkMetaMaskAvailability()
  
  if (!metaMaskCheck.available) {
    return {
      status: 'unavailable',
      error: metaMaskCheck.error,
      details: null
    }
  }
  
  if (!provider || !account) {
    return {
      status: 'disconnected',
      error: 'No provider or account',
      details: null
    }
  }
  
  try {
    const validation = await validateWalletConnection(provider, account)
    
    if (!validation.valid) {
      return {
        status: 'error',
        error: validation.error,
        details: validation.details
      }
    }
    
    if (!validation.isCorrectNetwork) {
      return {
        status: 'wrong_network',
        error: 'Connected to wrong network',
        details: validation.details
      }
    }
    
    if (!validation.connectionTest.success) {
      return {
        status: 'weak_connection',
        error: 'Connection is weak or unstable',
        details: validation.details
      }
    }
    
    return {
      status: 'connected',
      error: null,
      details: validation.details
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      details: null
    }
  }
}

// Enhanced balance fetching with better error handling
export const fetchBalanceWithRetry = async (provider, account, maxRetries = 3) => {
  if (!provider || !account) {
    throw new Error('Provider or account not available')
  }

  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const balance = await provider.getBalance(account)
      return ethers.formatEther(balance)
    } catch (error) {
      lastError = error
      console.error(`Balance fetch attempt ${attempt} failed:`, error.message)
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw new Error(`Failed to fetch balance after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`)
} 