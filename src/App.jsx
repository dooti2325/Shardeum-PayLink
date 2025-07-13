import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import Header from './components/Header'
import Home from './pages/Home'
import CreatePayment from './pages/CreatePayment'
import PayRequest from './pages/PayRequest'
import History from './pages/History'
import QRScanner from './pages/QRScanner'
import PaymentSplit from './pages/PaymentSplit'
import TransactionNotification from './components/TransactionNotification'

// Global transaction monitor component
const TransactionMonitor = () => {
  const { transactions } = useWallet()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Show notification for new transactions
    if (transactions.length > 0) {
      const latestTransaction = transactions[0]
      
      // Only show notification if it's a new transaction (within last 10 seconds)
      const isRecent = Date.now() - latestTransaction.timestamp < 10000
      
      if (isRecent && !notifications.find(n => n.id === latestTransaction.id)) {
        setNotifications(prev => [
          {
            id: latestTransaction.id,
            transaction: latestTransaction
          },
          ...prev.slice(0, 2) // Keep only last 3 notifications
        ])
      }
    }
  }, [transactions])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {notifications.map(notification => (
        <TransactionNotification
          key={notification.id}
          transaction={notification.transaction}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  )
}

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePayment />} />
              <Route path="/pay/:requestId" element={<PayRequest />} />
              <Route path="/history" element={<History />} />
              <Route path="/scan" element={<QRScanner />} />
              <Route path="/split" element={<PaymentSplit />} />
            </Routes>
          </main>
          <TransactionMonitor />
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App 