import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { Clock, ArrowUpRight, ArrowDownLeft, ExternalLink, Filter } from 'lucide-react'

const History = () => {
  const { account, getTransactionHistory } = useWallet()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, sent, received
  const [error, setError] = useState(null)

  // Mock transaction data for demonstration
  const mockTransactions = [
    {
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      value: '0.5',
      type: 'sent',
      timestamp: Date.now() - 3600000, // 1 hour ago
      status: 'confirmed',
      message: 'Payment for services'
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      from: '0x1234567890abcdef1234567890abcdef1234567890',
      to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      value: '1.2',
      type: 'received',
      timestamp: Date.now() - 7200000, // 2 hours ago
      status: 'confirmed',
      message: 'Invoice payment'
    },
    {
      hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
      from: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      to: '0xabcdef1234567890abcdef1234567890abcdef1234',
      value: '0.8',
      type: 'sent',
      timestamp: Date.now() - 86400000, // 1 day ago
      status: 'confirmed',
      message: 'Event ticket payment'
    }
  ]

  useEffect(() => {
    if (account) {
      loadTransactions()
    }
  }, [account, filter])

  const loadTransactions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, this would fetch from blockchain or API
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      let filteredTransactions = mockTransactions
      
      if (filter === 'sent') {
        filteredTransactions = mockTransactions.filter(tx => tx.type === 'sent')
      } else if (filter === 'received') {
        filteredTransactions = mockTransactions.filter(tx => tx.type === 'received')
      }
      
      setTransactions(filteredTransactions)
    } catch (err) {
      setError('Failed to load transaction history')
      console.error('Error loading transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp) => {
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

  const getTransactionIcon = (type) => {
    return type === 'sent' ? (
      <ArrowUpRight className="w-4 h-4 text-red-500" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-green-500" />
    )
  }

  const getTransactionColor = (type) => {
    return type === 'sent' ? 'text-red-600' : 'text-green-600'
  }

  const openExplorer = (hash) => {
    window.open(`https://explorer-sphinx.shardeum.org/tx/${hash}`, '_blank')
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Transaction History</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your transaction history
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">
            View your past sent and received SHM transactions
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Transactions</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shardeum-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTransactions}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
            <Clock className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You haven't made any transactions yet."
              : `No ${filter} transactions found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'sent' ? '-' : '+'}{tx.value} SHM
                      </span>
                      <span className="text-xs text-gray-500">
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {tx.type === 'sent' ? 'To: ' : 'From: '}
                      {formatAddress(tx.type === 'sent' ? tx.to : tx.from)}
                    </div>
                    {tx.message && (
                      <div className="text-xs text-gray-500 mt-1">
                        {tx.message}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                  <button
                    onClick={() => openExplorer(tx.hash)}
                    className="text-shardeum-600 hover:text-shardeum-700 flex items-center space-x-1 text-sm"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Network Info */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Information</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Network:</span>
            <span className="ml-2 font-medium">Shardeum Sphinx 1.X</span>
          </div>
          <div>
            <span className="text-gray-600">Block Explorer:</span>
            <a 
              href="https://explorer-sphinx.shardeum.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-shardeum-600 hover:text-shardeum-700"
            >
              explorer-sphinx.shardeum.org
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default History 