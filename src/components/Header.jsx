import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { Wallet, QrCode, History, Plus, Home, Users, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

const Header = () => {
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    balance, 
    isConnecting, 
    connectionStatus, 
    error, 
    autoReconnect,
    refreshBalance,
    isRefreshingBalance,
    lastBalanceUpdate
  } = useWallet()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={16} className="text-green-500" />
      case 'connecting':
        return <RefreshCw size={16} className="text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <WifiOff size={16} className="text-gray-400" />
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Disconnected'
    }
  }

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never'
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleRefreshBalance = async () => {
    await refreshBalance()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-shardeum-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Shardeum PayLink</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-shardeum-100 text-shardeum-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
              
              <Link
                to="/create"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/create') 
                    ? 'bg-shardeum-100 text-shardeum-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus size={16} />
                <span>Create Payment</span>
              </Link>
              
              <Link
                to="/scan"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/scan') 
                    ? 'bg-shardeum-100 text-shardeum-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <QrCode size={16} />
                <span>Scan QR</span>
              </Link>
              
              <Link
                to="/split"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/split') 
                    ? 'bg-shardeum-100 text-shardeum-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Users size={16} />
                <span>AirDrop</span>
              </Link>
              
              <Link
                to="/history"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/history') 
                    ? 'bg-shardeum-100 text-shardeum-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <History size={16} />
                <span>History</span>
              </Link>
            </nav>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* Connection Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              {getConnectionStatusIcon()}
              <span className={`font-medium ${
                connectionStatus === 'connected' ? 'text-green-600' :
                connectionStatus === 'connecting' ? 'text-yellow-600' :
                connectionStatus === 'error' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {getConnectionStatusText()}
              </span>
            </div>

            {account ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(account)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {isRefreshingBalance ? (
                        <div className="flex items-center space-x-1">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <span>{parseFloat(balance).toFixed(4)} SHM</span>
                          <button
                            onClick={handleRefreshBalance}
                            disabled={isRefreshingBalance}
                            className="text-shardeum-600 hover:text-shardeum-700 disabled:opacity-50"
                            title="Refresh balance"
                          >
                            <RefreshCw size={12} className={isRefreshingBalance ? 'animate-spin' : ''} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {lastBalanceUpdate && (
                    <div className="text-xs text-gray-400">
                      Updated {formatLastUpdate(lastBalanceUpdate)}
                    </div>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : connectionStatus === 'error' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={autoReconnect}
                  disabled={isConnecting}
                  className="btn-primary flex items-center space-x-2 text-sm"
                >
                  <RefreshCw size={16} className={isConnecting ? 'animate-spin' : ''} />
                  <span>{isConnecting ? 'Reconnecting...' : 'Reconnect'}</span>
                </button>
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-secondary text-sm"
                >
                  Connect New
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet size={16} />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t border-gray-200">
          {/* Mobile Connection Status */}
          <div className="flex items-center justify-center mb-4 space-x-2 text-sm">
            {getConnectionStatusIcon()}
            <span className={`font-medium ${
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'connecting' ? 'text-yellow-600' :
              connectionStatus === 'error' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {getConnectionStatusText()}
            </span>
          </div>

          <nav className="flex items-center justify-around">
            <Link
              to="/"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-shardeum-100 text-shardeum-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              <span className="text-xs">Home</span>
            </Link>
            
            <Link
              to="/create"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/create') 
                  ? 'bg-shardeum-100 text-shardeum-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Plus size={20} />
              <span className="text-xs">Create</span>
            </Link>
            
            <Link
              to="/scan"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/scan') 
                  ? 'bg-shardeum-100 text-shardeum-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <QrCode size={20} />
              <span className="text-xs">Scan</span>
            </Link>
            
            <Link
              to="/split"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/split') 
                  ? 'bg-shardeum-100 text-shardeum-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users size={20} />
              <span className="text-xs">Split</span>
            </Link>
            
            <Link
              to="/history"
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/history') 
                  ? 'bg-shardeum-100 text-shardeum-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History size={20} />
              <span className="text-xs">History</span>
            </Link>
          </nav>

          {/* Mobile Wallet Connection */}
          <div className="mt-4 flex justify-center">
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(account)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRefreshingBalance ? (
                      <div className="flex items-center space-x-1">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Updating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span>{parseFloat(balance).toFixed(4)} SHM</span>
                        <button
                          onClick={handleRefreshBalance}
                          disabled={isRefreshingBalance}
                          className="text-shardeum-600 hover:text-shardeum-700 disabled:opacity-50"
                          title="Refresh balance"
                        >
                          <RefreshCw size={12} className={isRefreshingBalance ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    )}
                  </div>
                  {lastBalanceUpdate && (
                    <div className="text-xs text-gray-400">
                      Updated {formatLastUpdate(lastBalanceUpdate)}
                    </div>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : connectionStatus === 'error' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={autoReconnect}
                  disabled={isConnecting}
                  className="btn-primary flex items-center space-x-2 text-sm"
                >
                  <RefreshCw size={16} className={isConnecting ? 'animate-spin' : ''} />
                  <span>{isConnecting ? 'Reconnecting...' : 'Reconnect'}</span>
                </button>
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-secondary text-sm"
                >
                  Connect New
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet size={16} />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 