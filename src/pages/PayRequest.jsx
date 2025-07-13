import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { Send, AlertCircle, CheckCircle, XCircle, Loader, Clock } from 'lucide-react'
import TransactionStatus from '../components/TransactionStatus'
import { decodeSecurePaymentLink, getTimeRemaining, formatTimeRemaining } from '../utils/paymentUtils'
import CountdownTimer from '../components/CountdownTimer'

const PayRequest = () => {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { account, connectWallet, sendTransaction, balance } = useWallet()
  
  const [paymentData, setPaymentData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [showTransactionStatus, setShowTransactionStatus] = useState(false)
  const [linkExpired, setLinkExpired] = useState(false)

  useEffect(() => {
    try {
      const result = decodeSecurePaymentLink(requestId)
      
      if (result.error) {
        setError(result.error)
        if (result.error.includes('expired')) {
          setLinkExpired(true)
        }
      } else {
        setPaymentData(result)
      }
    } catch (err) {
      setError('Invalid payment request link')
    } finally {
      setIsLoading(false)
    }
  }, [requestId])

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (err) {
      setError('Failed to connect wallet')
    }
  }

  const handleSendPayment = async () => {
    if (!account || !paymentData) return

    setIsProcessing(true)
    setError(null)

    try {
      // Check if user has sufficient balance
      if (parseFloat(balance) < paymentData.amount) {
        throw new Error('Insufficient balance')
      }

      // Send transaction
      const tx = await sendTransaction(
        paymentData.to,
        paymentData.amount.toString()
      )

      setTxHash(tx.hash)
      setShowTransactionStatus(true)
      
    } catch (err) {
      setError(err.message)
      setIsProcessing(false)
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-shardeum-600" />
        <p className="text-gray-600">Loading payment request...</p>
      </div>
    )
  }

  if (error && !paymentData) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {linkExpired ? 'Link Expired' : 'Invalid Request'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          {linkExpired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700 text-sm">
                This payment link has expired for security reasons. 
                Please request a new payment link from the sender.
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (showTransactionStatus) {
    return (
      <div className="max-w-md mx-auto py-8">
        <TransactionStatus 
          txHash={txHash}
          onComplete={(receipt) => {
            setSuccess(true)
            setShowTransactionStatus(false)
          }}
          onError={(error) => {
            setError(error)
            setShowTransactionStatus(false)
          }}
        />
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="card">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of {paymentData.amount} SHM has been sent successfully.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Request</h1>
        <p className="text-gray-600">
          Complete the payment using your connected wallet
        </p>
      </div>

      <div className="card">
        {paymentData && (
          <div className="space-y-6">
            {/* Countdown Timer */}
            {paymentData.expiry && (
              <div className="text-center">
                <CountdownTimer 
                  expiryTimestamp={paymentData.expiry}
                  onExpire={() => {
                    setLinkExpired(true)
                    setError('Payment link has expired')
                    setPaymentData(null) // Clear payment data when expired
                  }}
                />
              </div>
            )}
            
            {/* Payment Details */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {paymentData.amount} SHM
              </div>
              <p className="text-gray-600">Amount to Pay</p>
            </div>

            {paymentData.message && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Message:</p>
                <p className="text-gray-900">{paymentData.message}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-mono text-sm">{formatAddress(paymentData.to)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-mono text-sm">
                  {account ? formatAddress(account) : 'Not connected'}
                </span>
              </div>
              {account && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Balance:</span>
                  <span className="font-mono text-sm">{parseFloat(balance).toFixed(4)} SHM</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!account ? (
              <button
                onClick={handleConnectWallet}
                className="btn-primary w-full py-3"
              >
                Connect Wallet to Pay
              </button>
            ) : (
              <div className="space-y-3">
                {parseFloat(balance) < paymentData.amount && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-700 text-sm">
                        Insufficient balance. You need {paymentData.amount} SHM but have {parseFloat(balance).toFixed(4)} SHM.
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleSendPayment}
                  disabled={isProcessing || parseFloat(balance) < paymentData.amount}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Payment</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          This payment will be processed on the Shardeum Sphinx network
        </p>
      </div>
    </div>
  )
}

export default PayRequest 