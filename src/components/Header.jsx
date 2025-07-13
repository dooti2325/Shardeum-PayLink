import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { Wallet, QrCode, History, Plus, Home, Users } from 'lucide-react'

const Header = () => {
  const { account, connectWallet, disconnectWallet, balance, isConnecting } = useWallet()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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
                <span>Split Payment</span>
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
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(account)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {parseFloat(balance).toFixed(4)} SHM
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
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
        </div>
      </div>
    </header>
  )
}

export default Header 