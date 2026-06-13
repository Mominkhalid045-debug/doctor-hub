'use client'

import { useState, useEffect } from 'react'
import { Activity, CheckCircle, XCircle, CreditCard, Image as ImageIcon } from 'lucide-react'

export default function AssistantPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments')
      const data = await res.json()
      if (data.success) {
        setPayments(data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleVerify = async (paymentId, status) => {
    if (!confirm(`Are you sure you want to mark this payment as ${status}?`)) return
    
    setActionLoading(true)
    try {
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        fetchPayments()
      } else {
        alert(data.error || 'Failed to verify payment')
      }
    } catch (err) {
      alert('Error verifying payment')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="loading flex justify-center p-12"><Activity size={32} className="text-primary" /></div>

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Payment Verifications</h2>
        
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted">No payments pending verification.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Screenshot</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="font-medium text-white">{payment.appointment.patient.user.name}</td>
                    <td className="font-bold text-success">${payment.amount}</td>
                    <td>
                      <span className={`badge status-${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => setSelectedImage(payment.screenshotUrl)}
                      >
                        <ImageIcon size={14} /> View
                      </button>
                    </td>
                    <td>
                      {payment.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-success btn-sm flex-1"
                            disabled={actionLoading}
                            onClick={() => handleVerify(payment.id, 'VERIFIED')}
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm flex-1 text-danger"
                            disabled={actionLoading}
                            onClick={() => handleVerify(payment.id, 'REJECTED')}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <div className="max-w-3xl w-full relative">
            <button 
              className="absolute -top-10 right-0 text-white hover:text-primary transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle size={32} />
            </button>
            {/* Using an img tag since we are saving locally to /uploads */}
            <img 
              src={selectedImage} 
              alt="Payment Screenshot" 
              className="w-full h-auto rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
