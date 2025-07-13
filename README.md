# Shardeum PayLink – Decentralized Payment Request & QR Generator

A modern dApp that allows users to create payment request links and QR codes for SHM (Shardeum) token payments on the Shardeum Sphinx network.

## 🚀 Features

### Core Functionality
- **Create Payment Requests**: Generate shareable payment links and QR codes
- **QR Code Scanner**: Scan payment QR codes to quickly pay with pre-filled details
- **Wallet Integration**: Seamless MetaMask integration with Shardeum network support
- **Transaction History**: View past sent and received transactions with real-time updates
- **Multi-Account Support**: Manage payments from different wallet addresses
- **Payment Splitting**: Split amounts among multiple recipients automatically

### Persistent Connection Features
- **Auto-Reconnection**: Automatically reconnects wallet on page reload
- **Connection Persistence**: Remembers connected wallet across browser sessions
- **Connection Strength Monitoring**: Real-time connection health and latency tracking
- **Network Validation**: Automatic network switching and validation
- **Error Recovery**: Intelligent error handling with automatic retry mechanisms
- **Connection Status Indicators**: Visual feedback for connection health

### Real-time Features
- **Live Balance Updates**: Automatic balance refresh after transactions
- **Transaction Monitoring**: Real-time transaction status tracking
- **Transaction Notifications**: Desktop notifications for transaction updates
- **Local Storage**: Persistent transaction history across sessions

### User Experience
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Mobile-First**: Optimized for mobile devices with touch-friendly interface
- **Real-time Updates**: Live balance updates and transaction status
- **Error Handling**: Comprehensive error handling and user feedback
- **Connection Health**: Detailed connection status with latency and strength metrics

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Blockchain**: Ethers.js for Web3 integration
- **QR Codes**: qrcode.react + html5-qrcode for scanning
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API with localStorage persistence
- **Network Utilities**: Custom network validation and connection strengthening

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- MetaMask wallet extension
- Shardeum Sphinx network configured in MetaMask

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   cd "Pay Fi Hack 2"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Shardeum Network Setup

The app automatically configures the Shardeum Sphinx network in MetaMask. Network details:

- **Network Name**: Shardeum PayLink
- **RPC URL**: https://api-testnet.shardeum.org/
- **Chain ID**: 8083 (0x1f93)
- **Currency Symbol**: SHM
- **Block Explorer**: https://explorer-testnet.shardeum.org/

### Persistent Connection Setup

The app automatically handles wallet connection persistence:

- **Auto-Reconnection**: Automatically reconnects on page reload
- **Session Persistence**: Remembers wallet across browser sessions
- **Network Validation**: Ensures correct network connection
- **Connection Monitoring**: Continuous health checks every 30 seconds

## 📱 How to Use

### Wallet Connection

1. **Initial Connection**: Click "Connect Wallet" to connect MetaMask
2. **Auto-Reconnection**: Wallet automatically reconnects on page reload
3. **Connection Status**: View detailed connection health in the header
4. **Network Validation**: App automatically switches to Shardeum network
5. **Error Recovery**: Automatic retry with intelligent error handling

### Connection Health Monitoring

The app provides detailed connection information:

- **Connection Status**: Connected, Connecting, Error, or Disconnected
- **Latency**: Real-time connection latency measurement
- **Connection Strength**: Strong, Weak, or Unstable connection
- **Network Validation**: Ensures correct Shardeum network connection
- **Auto-Recovery**: Automatic reconnection attempts on connection loss

### Creating a Payment Request

1. Navigate to "Create Payment" page
2. Enter the amount in SHM
3. Add recipient wallet address
4. Optionally add a message
5. Generate payment link and QR code
6. Share the link or QR code with the recipient

### Paying via QR Code

1. Navigate to "Scan QR" page
2. Click "Start Scanner" to activate camera
3. Point camera at payment QR code
4. Review pre-filled payment details
5. Connect wallet and confirm transaction

### Viewing Transaction History

1. Navigate to "History" page
2. Filter transactions by type (All/Sent/Received)
3. Click "Refresh" to update balance and transactions
4. Click "View" to open transaction on block explorer
5. Click "Details" to see transaction information

### Splitting Payments

1. Navigate to "Split Payments" page
2. Enter total amount to split
3. Choose split type (Equal, Percentage, Custom)
4. Add recipient addresses and amounts
5. Review split distribution
6. Send payments to all recipients

## 🔐 Security Features

- **Input Validation**: Comprehensive form validation for amounts and addresses
- **Balance Checks**: Automatic balance verification before transactions
- **Network Validation**: Ensures transactions are sent on correct network
- **Error Handling**: Graceful error handling with user-friendly messages
- **Transaction Monitoring**: Real-time transaction status tracking
- **Local Storage**: Secure transaction history persistence
- **Connection Security**: Robust connection validation and error recovery
- **Auto-Reconnection**: Intelligent reconnection with exponential backoff

## 🎨 UI Components

### Design System
- **Colors**: Custom Shardeum purple theme
- **Typography**: Inter font family
- **Components**: Reusable button, input, and card components
- **Animations**: Smooth transitions and loading states

### Connection Status Components
- **ConnectionStatus**: Detailed connection health display
- **Status Indicators**: Visual connection status in header
- **Health Monitoring**: Real-time connection metrics
- **Error Recovery**: User-friendly error messages and recovery options

### Real-time Features
- **Balance Display**: Live balance with refresh button
- **Transaction Notifications**: Desktop notifications for transaction updates
- **Status Indicators**: Visual status indicators for transaction states
- **Loading States**: Smooth loading animations during transactions
- **Connection Monitoring**: Continuous connection health checks

### Responsive Design
- **Mobile**: Touch-friendly interface with bottom navigation
- **Tablet**: Optimized layout for medium screens
- **Desktop**: Full-featured interface with sidebar navigation

## 📊 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx     # Navigation and wallet connection
│   ├── ConnectionStatus.jsx # Connection health display
│   ├── TransactionStatus.jsx # Transaction status display
│   ├── TransactionNotification.jsx # Real-time notifications
│   └── CountdownTimer.jsx # Payment link expiry timer
├── contexts/           # React contexts
│   └── WalletContext.jsx # Wallet and blockchain state management
├── pages/              # Application pages
│   ├── Home.jsx       # Landing page with balance display
│   ├── CreatePayment.jsx # Payment request creation
│   ├── PayRequest.jsx # Payment processing
│   ├── QRScanner.jsx  # QR code scanning
│   ├── History.jsx    # Transaction history with filters
│   └── PaymentSplit.jsx # Payment splitting functionality
├── utils/              # Utility functions
│   ├── helpers.js     # Common utility functions
│   ├── paymentUtils.js # Payment-specific utilities
│   └── networkUtils.js # Network validation and connection utilities
├── App.jsx            # Main app component with transaction monitor
├── main.jsx          # Application entry point
└── index.css         # Global styles
```

## 🔄 Development Workflow

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style

- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standard commit message format

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Recommended Hosting

- **Vercel**: Zero-config deployment
- **Netlify**: Easy static site hosting
- **GitHub Pages**: Free hosting for open source projects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shardeum Team**: For building the amazing Shardeum network
- **Ethers.js**: For excellent Web3 integration
- **Tailwind CSS**: For the beautiful design system
- **React Community**: For the amazing ecosystem

## 📞 Support

If you have any questions or need help:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

**Built with ❤️ for the Shardeum ecosystem** 