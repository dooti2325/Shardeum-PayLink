import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './contexts/WalletContext'
import Header from './components/Header'
import Home from './pages/Home'
import CreatePayment from './pages/CreatePayment'
import PayRequest from './pages/PayRequest'
import History from './pages/History'
import QRScanner from './pages/QRScanner'

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
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App 