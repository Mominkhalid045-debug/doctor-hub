'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Activity, Search, ShieldCheck } from 'lucide-react'

export default function DoctorPrescriptions() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Prescription Modal
  const [selectedApt, setSelectedApt] = useState(null)
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: '',
    instructions: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Only show confirmed or completed appointments
          const validApts = data.data.filter(a => ['CONFIRMED', 'COMPLETED'].includes(a.status))
          setAppointments(validApts)
        }
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!confirm('Warning: Prescriptions are immutable once saved. Are you sure you want to submit?')) return

    setSubmitLoading(true)
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedApt.id,
          patientId: selectedApt.patientId,
          diagnosis: prescriptionData.diagnosis,
          medicines: prescriptionData.medicines,
          instructions: prescriptionData.instructions
        })
      })
      const data = await res.json()
      
      if (data.success) {
        alert('Prescription securely saved to patient history.')
        setSelectedApt(null)
        // Set appointment to COMPLETED since prescription is written
        await fetch(`/api/appointments/${selectedApt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' })
        })
        // Refresh list
        window.location.reload()
      } else {
        alert(data.error || 'Failed to save prescription')
      }
    } catch (err) {
      alert('Something went wrong')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <div className="loading flex justify-center p-12"><Activity size={32} className="text-primary" /></div>

  return (
    <div className="fade-in">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Write Prescriptions</h2>
          <div className="badge badge-warning flex items-center gap-1">
            <ShieldCheck size={14} /> Immutable Records
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted">No confirmed appointments to prescribe for.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Reason for Visit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="font-medium text-white">{apt.patient.user.name}</td>
                    <td>{apt.date} <br/><span className="text-xs text-muted">{apt.time}</span></td>
                    <td className="max-w-[200px] truncate">{apt.reason}</td>
                    <td>
                      <span className={`badge status-${apt.status.toLowerCase()}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      {apt.status === 'CONFIRMED' ? (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedApt(apt)}
                        >
                          <Plus size={14} /> Write Prescription
                        </button>
                      ) : (
                        <span className="text-xs text-muted">Prescribed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-[#334155] fade-in">
            <h2 className="text-xl font-bold mb-2">Create E-Prescription</h2>
            <p className="text-sm text-muted mb-6">For patient: {selectedApt.patient.user.name}</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="E.g. Viral Pharyngitis"
                  required
                  value={prescriptionData.diagnosis}
                  onChange={e => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medicines (JSON or List)</label>
                <textarea 
                  className="form-input min-h-[100px] font-mono text-sm" 
                  placeholder={`1. Paracetamol 500mg - 1 tab - 3x daily\n2. Amoxicillin 250mg - 1 cap - 2x daily`}
                  required
                  value={prescriptionData.medicines}
                  onChange={e => setPrescriptionData({...prescriptionData, medicines: e.target.value})}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions</label>
                <textarea 
                  className="form-input min-h-[80px]" 
                  placeholder="Drink plenty of fluids and rest."
                  value={prescriptionData.instructions}
                  onChange={e => setPrescriptionData({...prescriptionData, instructions: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedApt(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save & Lock Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
