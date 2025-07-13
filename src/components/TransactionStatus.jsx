import React, { useState, useEffect } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { CheckCircle, XCircle, Clock, Loader, ExternalLink, Copy } from 'lucide-react'
import { checkTransactionStatus, formatGasUsed, getStatusColor } from '../utils/helpers'

const TransactionStatus = ({ txHash, onComplete, onError }) => {
  const { provider, updateTransactionStatus } = useWallet()
  const [status, setStatus] = useState('pending') // pending, confirmed, failed
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState(null)
  const [confirmations, setConfirmations] = useState(0)
  const [gasUsed, setGasUsed] = useState(null)
  const [blockNumber, setBlockNumber] = useState(null)

  useEffect(() => {
    if (!txHash || !provider) return

    let interval
    let timeout

    const checkStatus = async () => {
      try {
        const result = await checkTransactionStatus(provider, txHash)
        
        if (result.status === 'confirmed') {
          setStatus('confirmed')
          setReceipt(result.receipt)
          setGasUsed(result.gasUsed)
          setBlockNumber(result.blockNumber)
          
          // Update transaction status in context
          updateTransactionStatus(txHash, 'confirmed', result.receipt)
          
          onComplete?.(result.receipt)
          return true
        } else if (result.status === 'failed') {
          setStatus('failed')
          setError('Transaction failed')
          
          // Update transaction status in context
          updateTransactionStatus(txHash, 'failed', result.receipt)
          
          onError?.('Transaction failed')
          return true
        } else if (result.status === 'pending') {
          setConfirmations(result.confirmations)
          return false
        }
        
        return false
      } catch (err) {
        console.error('Error checking transaction status:', err)
        setError('Failed to check transaction status')
        return false
      }
    }

    // Check immediately
    checkStatus().then((isComplete) => {
      if (!isComplete) {
        // Set up polling every 3 seconds
        interval = setInterval(async () => {
          const isComplete = await checkStatus()
          if (isComplete) {
            clearInterval(interval)
          }
        }, 3000)

        // Timeout after 5 minutes
        timeout = setTimeout(() => {
          clearInterval(interval)
          setStatus('failed')
          setError('Transaction timeout - please check your wallet')
          
          // Update transaction status in context
          updateTransactionStatus(txHash, 'timeout')
          
          onError?.('Transaction timeout')
        }, 300000) // 5 minutes
      }
    })

    return () => {
      if (interval) clearInterval(interval)
      if (timeout) clearTimeout(timeout)
    }
  }, [txHash, provider, onComplete, onError, updateTransactionStatus])

  const getStatusIcon = () => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-500" />
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />
      default:
        return <Loader className="w-8 h-8 animate-spin text-blue-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return 'Transaction Confirmed'
      case 'failed':
        return 'Transaction Failed'
      case 'pending':
        return 'Transaction Pending'
      default:
        return 'Processing Transaction'
    }
  }

  const getStatusColorClass = () => {
    return getStatusColor(status)
  }

  const openInExplorer = () => {
    if (txHash) {
      window.open(`https://explorer-testnet.shardeum.org/tx/${txHash}`, '_blank')
    }
  }

  const copyTxHash = async () => {
    try {
      await navigator.clipboard.writeText(txHash)
    } catch (err) {
      console.error('Failed to copy transaction hash:', err)
    }
  }

  return (
    <div className="card">
      <div className="text-center">
        {getStatusIcon()}
        <h3 className={`text-xl font-semibold mt-4 ${getStatusColorClass()}`}>
          {getStatusText()}
        </h3>
        
        {status === 'pending' && (
          <p className="text-gray-600 mt-2">
            Waiting for network confirmation... ({confirmations} confirmations)
          </p>
        )}

        {error && (
          <p className="text-red-600 mt-2">{error}</p>
        )}

        {txHash && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Transaction Hash:</span>
                <button
                  onClick={copyTxHash}
                  className="text-shardeum-600 hover:text-shardeum-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-mono text-gray-800 break-all">
                {txHash}
              </p>
            </div>

            {receipt && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Block Number:</span>
                  <p className="font-medium">{blockNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Gas Used:</span>
                  <p className="font-medium">{gasUsed ? formatGasUsed(gasUsed) : 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={openInExplorer}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Explorer</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionStatus 