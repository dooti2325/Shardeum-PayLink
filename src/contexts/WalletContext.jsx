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

  // Shardeum Sphinx network configuration
  const SHARDEUM_CONFIG = {
    chainId: '0x1F93', // 8083 in decimal
    chainName: 'Shardeum Sphinx 1.X',
    nativeCurrency: {
      name: 'SHM',
      symbol: 'SHM',
      decimals: 18,
    },
    rpcUrls: ['https://api-testnet.shardeum.org/'],
    blockExplorerUrls: ['https://explorer-sphinx.shardeum.org/'],
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

  const sendTransaction = async (to, amount, data = '') => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
        data: data || undefined,
      })

      return tx
    } catch (err) {
      throw new Error(`Transaction failed: ${err.message}`)
    }
  }

  const getTransactionHistory = async (address) => {
    if (!provider) {
      throw new Error('Provider not available')
    }

    try {
      // This would typically involve querying a block explorer API
      // For now, we'll return a mock implementation
      return []
    } catch (err) {
      throw new Error(`Failed to get transaction history: ${err.message}`)
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (account !== accounts[0]) {
          setAccount(accounts[0])
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
  }, [account])

  const value = {
    account,
    provider,
    signer,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    sendTransaction,
    getTransactionHistory,
    SHARDEUM_CONFIG,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
} 