import React, { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'
import { Plus, Minus, Trash2, Send, Users, Calculator, AlertCircle } from 'lucide-react'

const PaymentSplit = () => {
  const { account, sendTransaction } = useWallet()
  const [totalAmount, setTotalAmount] = useState('')
  const [recipients, setRecipients] = useState([
    { address: '', amount: '', percentage: 0 }
  ])
  const [splitType, setSplitType] = useState('equal') // equal, percentage, custom
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState({})
  const [successCount, setSuccessCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '', percentage: 0 }])
  }

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index)
      setRecipients(newRecipients)
      recalculateAmounts(newRecipients, totalAmount)
    }
  }

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients]
    newRecipients[index] = { ...newRecipients[index], [field]: value }
    setRecipients(newRecipients)
    
    if (field === 'amount' || field === 'percentage') {
      recalculateAmounts(newRecipients, totalAmount)
    }
  }

  const recalculateAmounts = (recipientsList, total) => {
    if (!total || parseFloat(total) <= 0) return

    const totalNum = parseFloat(total)
    
    if (splitType === 'equal') {
      const equalAmount = totalNum / recipientsList.length
      const newRecipients = recipientsList.map(recipient => ({
        ...recipient,
        amount: equalAmount.toFixed(4),
        percentage: ((equalAmount / totalNum) * 100).toFixed(2)
      }))
      setRecipients(newRecipients)
    } else if (splitType === 'percentage') {
      const totalPercentage = recipientsList.reduce((sum, recipient) => 
        sum + parseFloat(recipient.percentage || 0), 0)
      
      if (totalPercentage > 100) {
        setErrors({ percentage: 'Total percentage cannot exceed 100%' })
        return
      }
      
      const newRecipients = recipientsList.map(recipient => ({
        ...recipient,
        amount: ((parseFloat(recipient.percentage || 0) / 100) * totalNum).toFixed(4)
      }))
      setRecipients(newRecipients)
    }
  }

  const handleTotalAmountChange = (value) => {
    setTotalAmount(value)
    recalculateAmounts(recipients, value)
    if (errors.totalAmount) {
      setErrors(prev => ({ ...prev, totalAmount: '' }))
    }
  }

  const handleSplitTypeChange = (type) => {
    setSplitType(type)
    recalculateAmounts(recipients, totalAmount)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      newErrors.totalAmount = 'Please enter a valid total amount'
    }
    
    if (recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required'
    }
    
    // Validate each recipient
    recipients.forEach((recipient, index) => {
      if (!recipient.address) {
        newErrors[`recipient_${index}_address`] = 'Address is required'
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.address)) {
        newErrors[`recipient_${index}_address`] = 'Invalid address format'
      }
      
      if (splitType === 'percentage') {
        const percentage = parseFloat(recipient.percentage || 0)
        if (percentage < 0 || percentage > 100) {
          newErrors[`recipient_${index}_percentage`] = 'Percentage must be between 0-100'
        }
      }
    })
    
    // Check total percentage
    if (splitType === 'percentage') {
      const totalPercentage = recipients.reduce((sum, recipient) => 
        sum + parseFloat(recipient.percentage || 0), 0)
      if (totalPercentage !== 100) {
        newErrors.percentage = `Total percentage must be 100% (currently ${totalPercentage.toFixed(2)}%)`
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sendBulkPayments = async () => {
    if (!validateForm()) return
    
    setIsProcessing(true)
    setSuccessCount(0)
    setFailedCount(0)
    
    const totalNum = parseFloat(totalAmount)
    let success = 0
    let failed = 0
    
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i]
      const amount = parseFloat(recipient.amount)
      
      try {
        const tx = await sendTransaction(recipient.address, amount.toString())
        await tx.wait()
        success++
        setSuccessCount(success)
      } catch (error) {
        console.error(`Failed to send payment to ${recipient.address}:`, error)
        failed++
        setFailedCount(failed)
      }
    }
    
    setIsProcessing(false)
  }

  const getTotalDistributed = () => {
    return recipients.reduce((sum, recipient) => 
      sum + parseFloat(recipient.amount || 0), 0).toFixed(4)
  }

  const getRemainingAmount = () => {
    const total = parseFloat(totalAmount || 0)
    const distributed = parseFloat(getTotalDistributed())
    return (total - distributed).toFixed(4)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Split</h1>
        <p className="text-gray-600">
          Split a total amount among multiple recipients
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Split Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount (SHM)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => handleTotalAmountChange(e.target.value)}
                  className={`input-field ${errors.totalAmount ? 'border-red-500' : ''}`}
                  placeholder="0.0"
                />
                {errors.totalAmount && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.totalAmount}
                </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSplitTypeChange('equal')}
                    className={`p-3 rounded-lg border transition-colors ${
                      splitType === 'equal' 
                        ? 'border-shardeum-500 bg-shardeum-50 text-shardeum-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Equal Split</span>
                  </button>
                  <button
                    onClick={() => handleSplitTypeChange('percentage')}
                    className={`p-3 rounded-lg border transition-colors ${
                      splitType === 'percentage' 
                        ? 'border-shardeum-500 bg-shardeum-50 text-shardeum-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Calculator className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Percentage</span>
                  </button>
                  <button
                    onClick={() => handleSplitTypeChange('custom')}
                    className={`p-3 rounded-lg border transition-colors ${
                      splitType === 'custom' 
                        ? 'border-shardeum-500 bg-shardeum-50 text-shardeum-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Send className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Custom</span>
                  </button>
                </div>
              </div>

              {errors.percentage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{errors.percentage}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recipients */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recipients</h2>
              <button
                onClick={addRecipient}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Recipient</span>
              </button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Recipient {index + 1}
                    </span>
                    {recipients.length > 1 && (
                      <button
                        onClick={() => removeRecipient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={recipient.address}
                        onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                        className={`input-field ${errors[`recipient_${index}_address`] ? 'border-red-500' : ''}`}
                        placeholder="0x..."
                      />
                      {errors[`recipient_${index}_address`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`recipient_${index}_address`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Amount (SHM)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          value={recipient.amount}
                          onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                          className="input-field"
                          placeholder="0.0"
                          readOnly={splitType === 'equal'}
                        />
                      </div>

                      {splitType === 'percentage' && (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Percentage (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={recipient.percentage}
                            onChange={(e) => updateRecipient(index, 'percentage', e.target.value)}
                            className={`input-field ${errors[`recipient_${index}_percentage`] ? 'border-red-500' : ''}`}
                            placeholder="0"
                          />
                          {errors[`recipient_${index}_percentage`] && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors[`recipient_${index}_percentage`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">{totalAmount || '0.0000'} SHM</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Distributed:</span>
                <span className="font-semibold">{getTotalDistributed()} SHM</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className={`font-semibold ${
                  parseFloat(getRemainingAmount()) < 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {getRemainingAmount()} SHM
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Recipients:</span>
                <span className="font-semibold">{recipients.length}</span>
              </div>
            </div>

            {parseFloat(getRemainingAmount()) !== 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm">
                  ⚠️ The total distributed amount doesn't match the total amount. 
                  Please adjust the split configuration.
                </p>
              </div>
            )}

            <button
              onClick={sendBulkPayments}
              disabled={isProcessing || parseFloat(getRemainingAmount()) !== 0 || !account}
              className="btn-primary w-full mt-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Sending Payments... ({successCount}/{recipients.length})</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send {recipients.length} Payments</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {isProcessing && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="text-green-600 font-semibold">{successCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="text-red-600 font-semibold">{failedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="text-blue-600 font-semibold">
                    {recipients.length - successCount - failedCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentSplit 