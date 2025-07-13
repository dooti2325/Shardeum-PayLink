import React, { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Share2, Check, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'

const CreatePayment = () => {
  const { account } = useWallet()
  const [formData, setFormData] = useState({
    amount: '',
    message: '',
    walletAddress: account || ''
  })
  const [generatedData, setGeneratedData] = useState({
    walletURI: '',
    webLink: ''
  })
  const [copied, setCopied] = useState({ walletURI: false, webLink: false })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Please enter a wallet address'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Please enter a valid Ethereum address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePaymentLink = () => {
    if (!validateForm()) return

    const paymentData = {
      to: formData.walletAddress,
      amount: parseFloat(formData.amount),
      message: formData.message,
      timestamp: Date.now()
    }

    // Create a direct payment URI that will trigger wallet
    const paymentURI = `ethereum:${formData.walletAddress}@8083?value=${ethers.parseEther(formData.amount.toString()).toString()}`
    
    // Also create a web link for the app
    const encodedData = btoa(JSON.stringify(paymentData))
    const webLink = `${window.location.origin}/pay/${encodedData}`
    
    setGeneratedData({
      walletURI: paymentURI,
      webLink: webLink
    })
  }

  const copyToClipboard = async (type) => {
    try {
      const text = type === 'walletURI' ? generatedData.walletURI : generatedData.webLink
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [type]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [type]: false })), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadQR = () => {
    const svg = document.getElementById('payment-qr')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `payment-request-${Date.now()}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Request',
          text: `Please pay ${formData.amount} SHM`,
          url: generatedData.walletURI
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      copyToClipboard('walletURI')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Payment Request</h1>
        <p className="text-gray-600">
          Generate a shareable payment link and QR code for SHM payments
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (SHM)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.0"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                className={`input-field ${errors.walletAddress ? 'border-red-500' : ''}`}
                placeholder="0x..."
              />
              {errors.walletAddress && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.walletAddress}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Add a note or description..."
              />
            </div>

            <button
              onClick={generatePaymentLink}
              className="btn-primary w-full py-3"
            >
              Generate Payment Link
            </button>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment QR Code</h2>
          
          {generatedData.walletURI ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  <QRCodeSVG
                    id="payment-qr"
                    value={generatedData.walletURI}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Direct Wallet Payment URI
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedData.walletURI}
                      readOnly
                      className="input-field rounded-r-none"
                    />
                    <button
                      onClick={() => copyToClipboard('walletURI')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg transition-colors"
                    >
                      {copied.walletURI ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This QR code will directly open the wallet when scanned
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Web App Link (Alternative)
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={generatedData.webLink}
                      readOnly
                      className="input-field rounded-r-none"
                    />
                    <button
                      onClick={() => copyToClipboard('webLink')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg transition-colors"
                    >
                      {copied.webLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This link opens the payment in our web app
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={downloadQR}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR</span>
                  </button>
                  <button
                    onClick={shareLink}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <p className="text-gray-500">
                Fill out the payment details and click "Generate Payment Link" to create your QR code
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {generatedData.walletURI && (
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <p className="text-gray-600">
                Share the QR code with the person who needs to pay
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 font-bold text-xs">2</span>
              </div>
              <p className="text-gray-600">
                They scan the QR code on their device
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-xs">3</span>
              </div>
              <p className="text-gray-600">
                Their wallet opens with the payment pre-filled
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePayment 