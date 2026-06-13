'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, FileText, Activity } from 'lucide-react'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAppointments(data.data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading flex justify-center p-12"><Activity size={32} className="text-primary" /></div>

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.date === todayStr)
  const pendingCount = appointments.filter(a => ['PENDING', 'PAYMENT_UPLOADED'].includes(a.status)).length
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(14,165,233,0.1)] text-[#0ea5e9]"><Calendar /></div>
          <div className="stat-value">{todayAppointments.length}</div>
          <div className="stat-label">Appointments Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><Calendar /></div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(16,185,129,0.1)] text-[#10b981]"><Users /></div>
          <div className="stat-value">{uniquePatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-bold mb-6">Today's Appointments</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-muted">No appointments scheduled for today.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient Name</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="font-semibold">{apt.time}</td>
                    <td className="text-white">{apt.patient.user.name}</td>
                    <td>{apt.reason}</td>
                    <td>
                      <span className={`badge status-${apt.status.toLowerCase()}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
