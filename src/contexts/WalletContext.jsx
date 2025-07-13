import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  SHARDEUM_CONFIG, 
  switchToShardeumNetwork, 
  validateWalletConnection, 
  createRobustProvider,
  getDetailedConnectionStatus,
  fetchBalanceWithRetry
} from '../utils/networkUtils'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [balance, setBalance] = useState('0')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // 'disconnected', 'connecting', 'connected', 'error'
  const [lastConnectedAccount, setLastConnectedAccount] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [maxReconnectAttempts] = useState(5)
  const [connectionDetails, setConnectionDetails] = useState(null)
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState(null)

  // Load saved wallet state from localStorage
  useEffect(() => {
    const savedAccount = localStorage.getItem('shardeum_connected_account')
    const savedConnectionStatus = localStorage.getItem('shardeum_connection_status')
    
    if (savedAccount && savedConnectionStatus === 'connected') {
      setLastConnectedAccount(savedAccount)
      // Auto-reconnect on page load
      setTimeout(() => {
        autoReconnect()
      }, 1000) // Small delay to ensure everything is loaded
    }
  }, [])

  // Save connection state to localStorage
  useEffect(() => {
    if (account && connectionStatus === 'connected') {
      localStorage.setItem('shardeum_connected_account', account)
      localStorage.setItem('shardeum_connection_status', 'connected')
    } else if (connectionStatus === 'disconnected') {
      localStorage.removeItem('shardeum_connected_account')
      localStorage.setItem('shardeum_connection_status', 'disconnected')
    }
  }, [account, connectionStatus])

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('shardeum_transactions')
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions))
      } catch (err) {
        console.error('Error loading transactions from localStorage:', err)
      }
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('shardeum_transactions', JSON.stringify(transactions))
    }
  }, [transactions])

  // Validate and strengthen connection
  const validateAndStrengthenConnection = async (provider, account) => {
    try {
      const validation = await validateWalletConnection(provider, account)
      
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      
      if (!validation.isCorrectNetwork) {
        await switchToShardeumNetwork()
        // Re-validate after network switch
        const revalidation = await validateWalletConnection(provider, account)
        if (!revalidation.valid || !revalidation.isCorrectNetwork) {
          throw new Error('Failed to switch to correct network')
        }
      }
      
      setConnectionDetails(validation.details)
      return validation
    } catch (error) {
      throw new Error(`Connection validation failed: ${error.message}`)
    }
  }

  // Auto-reconnect function with enhanced error handling
  const autoReconnect = async () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      setConnectionStatus('error')
      setError('Max reconnection attempts reached. Please connect manually.')
      return
    }

    if (!window.ethereum) {
      setConnectionStatus('error')
      setError('MetaMask is not installed.')
      return
    }

    setConnectionStatus('connecting')
    setReconnectAttempts(prev => prev + 1)

    try {
      // Check if MetaMask is already connected
      const accounts = await window.ethereum.request({
        method: 'eth_accounts', // Use eth_accounts instead of eth_requestAccounts for auto-reconnect
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const account = accounts[0]
      
      // Create robust provider with enhanced error handling
      const provider = createRobustProvider()
      const signer = await provider.getSigner()

      // Validate and strengthen connection
      const validation = await validateAndStrengthenConnection(provider, account)

      setAccount(account)
      setProvider(provider)
      setSigner(signer)
      setConnectionStatus('connected')
      setError(null)
      setReconnectAttempts(0)

      // Get balance using enhanced balance fetching
      const balance = await fetchBalanceWithRetry(provider, account)
      setBalance(balance)
      setLastBalanceUpdate(Date.now())

      // Add received transactions
      await addReceivedTransactions()

    } catch (err) {
      console.error('Auto-reconnect failed:', err)
      setConnectionStatus('error')
      setError(`Auto-reconnect failed: ${err.message}`)
      
      // Retry after a delay
      setTimeout(() => {
        autoReconnect()
      }, 3000)
    }
  }

  // Refresh balance function with enhanced error handling
  const refreshBalance = async () => {
    if (!account || !provider) return

    setIsRefreshingBalance(true)
    try {
      const balance = await fetchBalanceWithRetry(provider, account)
      setBalance(balance)
      setLastBalanceUpdate(Date.now())
      console.log('Balance updated successfully:', balance)
    } catch (err) {
      console.error('Error refreshing balance:', err)
      // If balance refresh fails, it might indicate a connection issue
      if (err.message.includes('network') || err.message.includes('connection')) {
        setConnectionStatus('error')
        setError('Connection lost. Attempting to reconnect...')
        setTimeout(() => {
          autoReconnect()
        }, 2000)
      }
    } finally {
      setIsRefreshingBalance(false)
    }
  }

  // Add transaction to history
  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: Date.now(),
      status: 'pending'
    }
    setTransactions(prev => [newTransaction, ...prev])
  }

  // Update transaction status
  const updateTransactionStatus = (txHash, status, receipt = null) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === txHash 
          ? { ...tx, status, receipt, confirmedAt: status === 'confirmed' ? Date.now() : null }
          : tx
      )
    )
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)
    setConnectionStatus('connecting')
    setReconnectAttempts(0)
    
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this app.')
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.')
      }

      const account = accounts[0]
      
      // Create robust provider with enhanced error handling
      const provider = createRobustProvider()
      const signer = await provider.getSigner()

      // Validate and strengthen connection
      const validation = await validateAndStrengthenConnection(provider, account)

      setAccount(account)
      setProvider(provider)
      setSigner(signer)
      setConnectionStatus('connected')
      setLastConnectedAccount(account)

      // Get balance using enhanced balance fetching
      const balance = await fetchBalanceWithRetry(provider, account)
      setBalance(balance)
      setLastBalanceUpdate(Date.now())

      // Add received transactions
      await addReceivedTransactions()

    } catch (err) {
      setError(err.message)
      setConnectionStatus('error')
      console.error('Error connecting wallet:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setBalance('0')
    setError(null)
    setConnectionStatus('disconnected')
    setLastConnectedAccount(null)
    setReconnectAttempts(0)
    setConnectionDetails(null)
    setLastBalanceUpdate(null)
  }

  const sendTransaction = async (to, amount, data = '', message = '') => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }

    try {
      // Validate connection before sending transaction
      if (provider && account) {
        const validation = await validateWalletConnection(provider, account)
        if (!validation.valid) {
          throw new Error('Connection validation failed. Please reconnect your wallet.')
        }
      }

      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
        data: data || undefined,
      })

      // Add transaction to history
      addTransaction({
        hash: tx.hash,
        from: account,
        to: to,
        value: amount.toString(),
        type: 'sent',
        message: message || 'Payment',
        gasPrice: tx.gasPrice?.toString(),
        nonce: tx.nonce
      })

      // Start monitoring the transaction
      monitorTransaction(tx.hash)

      return tx
    } catch (err) {
      // Check if it's a connection-related error
      if (err.message.includes('network') || err.message.includes('connection')) {
        setConnectionStatus('error')
        setError('Connection lost. Please reconnect your wallet.')
      }
      throw new Error(`Transaction failed: ${err.message}`)
    }
  }

  // Monitor transaction status
  const monitorTransaction = async (txHash) => {
    if (!provider) return

    let attempts = 0
    const maxAttempts = 60 // 5 minutes with 5-second intervals

    const checkStatus = async () => {
      try {
        const receipt = await provider.getTransactionReceipt(txHash)
        
        if (receipt) {
          if (receipt.status === 1) {
            // Transaction confirmed
            updateTransactionStatus(txHash, 'confirmed', receipt)
            // Refresh balance after successful transaction
            await refreshBalance()
          } else {
            // Transaction failed
            updateTransactionStatus(txHash, 'failed', receipt)
          }
          return true
        }
        
        attempts++
        if (attempts >= maxAttempts) {
          updateTransactionStatus(txHash, 'timeout')
          return true
        }
        
        return false
      } catch (err) {
        console.error('Error monitoring transaction:', err)
        attempts++
        if (attempts >= maxAttempts) {
          updateTransactionStatus(txHash, 'error')
          return true
        }
        return false
      }
    }

    // Check immediately
    const isComplete = await checkStatus()
    if (!isComplete) {
      // Poll every 5 seconds
      const interval = setInterval(async () => {
        const isComplete = await checkStatus()
        if (isComplete) {
          clearInterval(interval)
        }
      }, 5000)
    }
  }

  // Add received transactions from blockchain
  const addReceivedTransactions = async () => {
    if (!account || !provider) return

    try {
      // This is a simplified approach - in a real app you'd use a block explorer API
      // For now, we'll just check if there are any transactions in the last few blocks
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = currentBlock - 1000 // Check last 1000 blocks
      
      // Get transaction history from the last few blocks
      // Note: This is a simplified approach. In production, you'd use a proper API
      
      // For now, we'll just add a placeholder for received transactions
      // In a real implementation, you'd query the blockchain or use an API
      const mockReceivedTx = {
        hash: '0x' + '0'.repeat(64),
        from: '0x1234567890123456789012345678901234567890',
        to: account,
        value: '0.1',
        type: 'received',
        message: 'Test received transaction',
        timestamp: Date.now() - 3600000, // 1 hour ago
        status: 'confirmed'
      }
      
      // Only add if it doesn't already exist
      const exists = transactions.find(tx => 
        tx.hash === mockReceivedTx.hash && tx.type === 'received'
      )
      
      if (!exists) {
        addTransaction(mockReceivedTx)
      }
    } catch (err) {
      console.error('Error adding received transactions:', err)
    }
  }

  const getTransactionHistory = async (address) => {
    // If no address provided, return all transactions
    if (!address) {
      return transactions
    }
    
    // Filter transactions by the provided address
    return transactions.filter(tx => 
      tx.from?.toLowerCase() === address.toLowerCase() || 
      tx.to?.toLowerCase() === address.toLowerCase()
    )
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (account !== accounts[0]) {
          setAccount(accounts[0])
          // Refresh balance when account changes
          if (provider) {
            refreshBalance()
          }
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      const handleConnect = () => {
        console.log('MetaMask connected')
        if (lastConnectedAccount) {
          autoReconnect()
        }
      }

      const handleDisconnect = () => {
        console.log('MetaMask disconnected')
        setConnectionStatus('disconnected')
        setError('Wallet disconnected')
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('connect', handleConnect)
      window.ethereum.on('disconnect', handleDisconnect)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
        window.ethereum.removeListener('connect', handleConnect)
        window.ethereum.removeListener('disconnect', handleDisconnect)
      }
    }
  }, [account, provider, lastConnectedAccount])

  // Auto-refresh balance when account or provider changes
  useEffect(() => {
    if (account && provider) {
      refreshBalance()
    }
  }, [account, provider])

  // Periodic balance refresh (every 30 seconds when connected)
  useEffect(() => {
    if (connectionStatus === 'connected' && account && provider) {
      const balanceInterval = setInterval(() => {
        refreshBalance()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(balanceInterval)
    }
  }, [connectionStatus, account, provider])

  // Periodic connection health check with detailed validation
  useEffect(() => {
    if (connectionStatus === 'connected' && provider && account) {
      const healthCheck = setInterval(async () => {
        try {
          const detailedStatus = await getDetailedConnectionStatus(provider, account)
          
          if (detailedStatus.status !== 'connected') {
            console.error('Connection health check failed:', detailedStatus.error)
            setConnectionStatus('error')
            setError(`Connection lost: ${detailedStatus.error}`)
            setTimeout(() => {
              autoReconnect()
            }, 2000)
          } else {
            // Update connection details
            setConnectionDetails(detailedStatus.details)
          }
        } catch (err) {
          console.error('Connection health check failed:', err)
          setConnectionStatus('error')
          setError('Connection lost. Attempting to reconnect...')
          setTimeout(() => {
            autoReconnect()
          }, 2000)
        }
      }, 30000) // Check every 30 seconds

      return () => clearInterval(healthCheck)
    }
  }, [connectionStatus, provider, account])

  const value = {
    account,
    provider,
    signer,
    balance,
    isConnecting,
    isRefreshingBalance,
    error,
    transactions,
    connectionStatus,
    lastConnectedAccount,
    reconnectAttempts,
    maxReconnectAttempts,
    connectionDetails,
    lastBalanceUpdate,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getTransactionHistory,
    refreshBalance,
    addTransaction,
    updateTransactionStatus,
    addReceivedTransactions,
    autoReconnect,
    SHARDEUM_CONFIG,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 