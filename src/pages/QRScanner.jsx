import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { ethers } from 'ethers'

const QRScanner = () => {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  const startScanner = () => {
    setIsScanning(true)
    setError(null)
    setScannedData(null)

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    )

    scanner.render(onScanSuccess, onScanFailure)
    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const onScanSuccess = (decodedText, decodedResult) => {
    try {
      // Check if it's a direct wallet payment URI
      if (decodedText.startsWith('ethereum:')) {
        // Extract payment details from ethereum URI
        const uri = new URL(decodedText)
        const toAddress = uri.pathname
        const value = uri.searchParams.get('value')
        
        if (toAddress && value) {
          const amount = ethers.formatEther(value)
          setScannedData({ 
            type: 'wallet_payment', 
            to: toAddress,
            amount: amount,
            uri: decodedText
          })
          stopScanner()
          return
        }
      }
      
      // Check if it's a valid payment link for our app
      if (decodedText.includes('/pay/')) {
        const requestId = decodedText.split('/pay/')[1]
        setScannedData({ type: 'payment', requestId })
        stopScanner()
        return
      }
      
      setError('Invalid QR code. Please scan a payment request QR code.')
    } catch (err) {
      setError('Invalid QR code format')
    }
  }

  const onScanFailure = (error) => {
    // Handle scan failure silently
    console.warn(`QR scan error = ${error}`)
  }

  const handleProcessPayment = () => {
    if (scannedData && scannedData.type === 'payment') {
      navigate(`/pay/${scannedData.requestId}`)
    } else if (scannedData && scannedData.type === 'wallet_payment') {
      // Open the ethereum URI directly to trigger wallet
      window.location.href = scannedData.uri
    }
  }

  const handleRetry = () => {
    setError(null)
    setScannedData(null)
    startScanner()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
        <p className="text-gray-600">
          Scan a payment request QR code to quickly pay with pre-filled details
        </p>
      </div>

      <div className="card">
        {!isScanning && !scannedData && !error && (
          <div className="text-center py-12">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Scan
            </h3>
            <p className="text-gray-600 mb-6">
              Click the button below to start scanning payment QR codes
            </p>
            <button
              onClick={startScanner}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Camera className="w-4 h-4" />
              <span>Start Scanner</span>
            </button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Scanning QR Code
              </h3>
              <p className="text-gray-600 mb-4">
                Point your camera at a payment request QR code
              </p>
            </div>
            
            <div id="qr-reader" className="w-full"></div>
            
            <div className="text-center">
              <button
                onClick={stopScanner}
                className="btn-secondary"
              >
                Stop Scanner
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scan Error
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {scannedData && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              QR Code Scanned!
            </h3>
            {scannedData.type === 'wallet_payment' ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {scannedData.amount} SHM
                  </div>
                  <p className="text-sm text-gray-600">
                    To: {scannedData.to.slice(0, 6)}...{scannedData.to.slice(-4)}
                  </p>
                </div>
                <p className="text-gray-600 mb-6">
                  Direct wallet payment detected. This will open your wallet.
                </p>
              </>
            ) : (
              <p className="text-gray-600 mb-6">
                Payment request detected. Ready to process payment.
              </p>
            )}
            <div className="space-x-4">
              <button
                onClick={handleProcessPayment}
                className="btn-primary"
              >
                {scannedData.type === 'wallet_payment' ? 'Open Wallet' : 'Process Payment'}
              </button>
              <button
                onClick={handleRetry}
                className="btn-secondary"
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use QR Scanner</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">1</span>
            </div>
            <p className="text-gray-600">
              Click "Start Scanner" to activate your device's camera
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 font-bold text-xs">2</span>
            </div>
            <p className="text-gray-600">
              Point your camera at a payment request QR code
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-600 font-bold text-xs">3</span>
            </div>
            <p className="text-gray-600">
              The payment form will automatically open with pre-filled details
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner 