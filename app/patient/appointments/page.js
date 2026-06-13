'use client'

import { useState, useEffect } from 'react'
import { Calendar, CreditCard, Activity, UploadCloud, X } from 'lucide-react'

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Payment Modal States
  const [selectedApt, setSelectedApt] = useState(null)
  const [paymentScreenshot, setPaymentScreenshot] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  const fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      const data = await res.json()
      if (data.success) setAppointments(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleUploadPayment = async (e) => {
    e.preventDefault()
    if (!paymentScreenshot) {
      setPaymentError('Please select a file')
      return
    }

    setPaymentLoading(true)
    setPaymentError('')

    const formData = new FormData()
    formData.append('file', paymentScreenshot)
    formData.append('appointmentId', selectedApt.id)
    formData.append('amount', selectedApt.doctor.consultationFee.toString())

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        setSelectedApt(null)
        setPaymentScreenshot(null)
        fetchAppointments() // Refresh list
      } else {
        setPaymentError(data.error || 'Failed to upload payment')
      }
    } catch (err) {
      setPaymentError('Something went wrong')
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) return <div className="loading flex justify-center p-12"><Activity size={32} className="text-primary" /></div>

  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">My Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted">No appointments found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="font-medium text-white">{apt.doctor.user.name}</td>
                    <td>{apt.date} <br/><span className="text-xs text-muted">{apt.time}</span></td>
                    <td className="max-w-[200px] truncate">{apt.reason}</td>
                    <td className="font-bold text-success">${apt.doctor.consultationFee}</td>
                    <td>
                      <span className={`badge status-${apt.status.toLowerCase()}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {apt.status === 'PENDING' && (
                        <button 
                          className="btn btn-primary btn-sm w-full"
                          onClick={() => setSelectedApt(apt)}
                        >
                          <CreditCard size={14} /> Pay
                        </button>
                      )}
                      {apt.status === 'PAYMENT_UPLOADED' && (
                        <span className="text-xs text-muted">Awaiting Verification</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Upload Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#334155] fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Upload Payment Proof</h2>
              <button onClick={() => setSelectedApt(null)} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted">Doctor:</span>
                <span className="text-white font-medium">{selectedApt.doctor.user.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-muted">Amount Due:</span>
                <span className="text-success font-bold text-lg">${selectedApt.doctor.consultationFee}</span>
              </div>
              <hr className="border-[#334155] mb-4" />
              <p className="text-xs text-muted">
                Please transfer the exact amount to the clinic's bank account and upload the screenshot of the successful transaction below.
              </p>
            </div>

            <form onSubmit={handleUploadPayment} className="flex flex-col gap-4">
              {paymentError && <div className="alert alert-error">{paymentError}</div>}
              
              <div className="form-group">
                <label className="form-label">Payment Screenshot</label>
                <div className="border-2 border-dashed border-[#334155] rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                    required
                  />
                  <UploadCloud size={32} className="mx-auto text-muted mb-2" />
                  <p className="text-sm font-medium">
                    {paymentScreenshot ? paymentScreenshot.name : 'Click or drag image to upload'}
                  </p>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={paymentLoading}>
                {paymentLoading ? 'Uploading...' : 'Submit Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
