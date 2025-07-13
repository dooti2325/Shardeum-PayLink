import React from 'react'
import { useWallet } from '../contexts/WalletContext'
import { Wifi, WifiOff, AlertCircle, RefreshCw, CheckCircle, XCircle, Activity, Shield } from 'lucide-react'

const ConnectionStatus = ({ showDetails = false, className = '' }) => {
  const { 
    connectionStatus, 
    account, 
    balance, 
    error, 
    reconnectAttempts, 
    maxReconnectAttempts,
    connectionDetails,
    autoReconnect 
  } = useWallet()

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />
      case 'connecting':
        return <RefreshCw size={16} className="text-yellow-500 animate-spin" />
      case 'error':
        return <XCircle size={16} className="text-red-500" />
      default:
        return <WifiOff size={16} className="text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Wallet Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Wallet Disconnected'
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getConnectionStrengthText = (strength) => {
    if (strength >= 90) return 'Excellent'
    if (strength >= 70) return 'Good'
    if (strength >= 50) return 'Fair'
    return 'Poor'
  }

  const getConnectionStrengthColor = (strength) => {
    if (strength >= 90) return 'text-green-600'
    if (strength >= 70) return 'text-yellow-600'
    if (strength >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!showDetails) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()} ${className}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium">{getStatusText()}</h3>
            {account && (
              <p className="text-sm opacity-75">
                {formatAddress(account)} • {parseFloat(balance).toFixed(4)} SHM
              </p>
            )}
          </div>
        </div>
        
        {connectionStatus === 'error' && (
          <button
            onClick={autoReconnect}
            className="btn-primary text-sm"
          >
            Reconnect
          </button>
        )}
      </div>

      {/* Connection Details */}
      {connectionDetails && connectionStatus === 'connected' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
            <Activity size={16} className="text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Latency</p>
              <p className="font-medium">
                {connectionDetails.latencyMs}ms
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
            <Wifi size={16} className="text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Connection</p>
              <p className={`font-medium ${getConnectionStrengthColor(connectionDetails.connectionStrong ? 100 : 50)}`}>
                {connectionDetails.connectionStrong ? 'Strong' : 'Weak'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
            <Shield size={16} className="text-purple-500" />
            <div>
              <p className="text-xs text-gray-500">Network</p>
              <p className={`font-medium ${connectionDetails.networkValid ? 'text-green-600' : 'text-red-600'}`}>
                {connectionDetails.networkValid ? 'Valid' : 'Invalid'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-800">Connection Error</p>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === 'error' && reconnectAttempts > 0 && (
        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-200 rounded-md">
          <div className="flex items-center space-x-2">
            <RefreshCw size={16} className="text-yellow-600" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Reconnection Attempts</p>
              <p className="text-yellow-700">
                Attempt {reconnectAttempts} of {maxReconnectAttempts}
              </p>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2">
            <Wifi size={16} className="text-green-600" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Connection Healthy</p>
              <p className="text-green-700">
                Connected to Shardeum Testnet
                {connectionDetails && (
                  <span className="ml-2">
                    • {connectionDetails.latencyMs}ms latency
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Tips */}
      {connectionStatus === 'connected' && connectionDetails && !connectionDetails.connectionStrong && (
        <div className="mt-3 p-3 bg-blue-100 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Connection Tips</p>
              <p className="text-blue-700 mt-1">
                Your connection is weak. Try refreshing the page or switching networks for better performance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus 