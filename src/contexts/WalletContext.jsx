import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

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

  // Shardeum Sphinx network configuration
  const SHARDEUM_CONFIG = {
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

  // Refresh balance function
  const refreshBalance = async () => {
    if (!account || !provider) return

    setIsRefreshingBalance(true)
    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error('Error refreshing balance:', err)
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
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Check if we're on the correct network
      const network = await provider.getNetwork()
      if (network.chainId !== BigInt(SHARDEUM_CONFIG.chainId)) {
        // Try to switch to Shardeum network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SHARDEUM_CONFIG.chainId }],
          })
        } catch (switchError) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SHARDEUM_CONFIG],
            })
          } else {
            throw switchError
          }
        }
      }

      setAccount(account)
      setProvider(provider)
      setSigner(signer)

      // Get balance
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))

      // Add received transactions
      await addReceivedTransactions()

    } catch (err) {
      setError(err.message)
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
  }

  const sendTransaction = async (to, amount, data = '', message = '') => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }

    try {
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

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [account, provider])

  // Auto-refresh balance when account or provider changes
  useEffect(() => {
    if (account && provider) {
      refreshBalance()
    }
  }, [account, provider])

  const value = {
    account,
    provider,
    signer,
    balance,
    isConnecting,
    isRefreshingBalance,
    error,
    transactions,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getTransactionHistory,
    refreshBalance,
    addTransaction,
    updateTransactionStatus,
    addReceivedTransactions,
    SHARDEUM_CONFIG,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 