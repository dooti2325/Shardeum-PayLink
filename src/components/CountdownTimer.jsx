import React, { useState, useEffect } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

const CountdownTimer = ({ expiryTimestamp, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!expiryTimestamp) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = expiryTimestamp - now
      
      if (remaining <= 0) {
        setTimeRemaining(0)
        setIsExpired(true)
        onExpire?.()
      } else {
        setTimeRemaining(remaining)
        setIsExpired(false)
      }
    }

    // Update immediately
    updateTimer()

    // Update every second
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiryTimestamp, onExpire])

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return '00:00'
    
    const seconds = Math.ceil(milliseconds / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    if (isExpired) return 'text-red-600'
    if (timeRemaining < 10000) return 'text-red-500' // Less than 10 seconds
    if (timeRemaining < 20000) return 'text-yellow-500' // Less than 20 seconds
    return 'text-green-600'
  }

  const getTimeIcon = () => {
    if (isExpired) return <AlertTriangle className="w-4 h-4" />
    if (timeRemaining < 10000) return <AlertTriangle className="w-4 h-4" />
    return <Clock className="w-4 h-4" />
  }

  if (isExpired) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        {getTimeIcon()}
        <span className="font-medium">Link Expired</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
      {getTimeIcon()}
      <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
      <span className="text-sm">remaining</span>
    </div>
  )
}

export default CountdownTimer 