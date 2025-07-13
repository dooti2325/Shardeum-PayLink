import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../contexts/WalletContext'
import { QrCode, Plus, History, Wallet, ArrowRight, Sparkles } from 'lucide-react'

const Home = () => {
  const { account, balance } = useWallet()

  const features = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: 'Create Payment Request',
      description: 'Generate shareable payment links and QR codes for SHM payments',
      link: '/create',
      color: 'bg-blue-500'
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Scan & Pay',
      description: 'Scan QR codes to quickly pay with pre-filled transaction details',
      link: '/scan',
      color: 'bg-green-500'
    },
    {
      icon: <History className="w-6 h-6" />,
      title: 'Transaction History',
      description: 'View your past sent and received transactions',
      link: '/history',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 bg-shardeum-100 text-shardeum-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Shardeum Sphinx Network</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Decentralized Payment
            <span className="block text-shardeum-600">Request & QR Generator</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create payment request links and QR codes for SHM (Shardeum) token payments. 
            Simple, secure, and decentralized peer-to-peer payments.
          </p>
        </div>

        {!account && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Payment Request</span>
            </Link>
            <Link
              to="/scan"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <QrCode className="w-5 h-5" />
              <span>Scan QR Code</span>
            </Link>
          </div>
        )}
      </div>

      {/* Wallet Status */}
      {account && (
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-shardeum-gradient rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Connected Wallet</h3>
                <p className="text-sm text-gray-500">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {parseFloat(balance).toFixed(4)} SHM
              </div>
              <div className="text-sm text-gray-500">Available Balance</div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="card hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-shardeum-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-shardeum-600 font-medium group-hover:text-shardeum-700 transition-colors">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* How It Works */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Request</h3>
            <p className="text-gray-600">
              Enter the amount and optional message. Generate a shareable link or QR code.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Scan</h3>
            <p className="text-gray-600">
              Share the link or QR code with the recipient. They scan and connect their wallet.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pay Instantly</h3>
            <p className="text-gray-600">
              The payment form is pre-filled. Click send to complete the SHM transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 