'use client'

import { useState, useEffect } from 'react'
import { Calendar, FileText, CreditCard, Activity } from 'lucide-react'
import Link from 'next/link'

export default function PatientDashboard() {
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

  const pendingCount = appointments.filter(a => ['PENDING', 'PAYMENT_UPLOADED'].includes(a.status)).length
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(245,158,11,0.1)] text-[#f59e0b]"><Calendar /></div>
          <div className="stat-value">{pendingCount}</div>
          <div className="stat-label">Pending Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(16,185,129,0.1)] text-[#10b981]"><Calendar /></div>
          <div className="stat-value">{confirmedCount}</div>
          <div className="stat-label">Confirmed Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-[rgba(14,165,233,0.1)] text-[#0ea5e9]"><FileText /></div>
          <div className="stat-value">{completedCount}</div>
          <div className="stat-label">Completed Consultations</div>
        </div>
      </div>

      <div className="card mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Recent Appointments</h2>
          <Link href="/patient/appointments" className="btn btn-outline btn-sm">View All</Link>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <p className="text-muted mb-4">You have no appointments yet.</p>
            <Link href="/doctors" className="btn btn-primary">Book an Appointment</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map(apt => (
                  <tr key={apt.id}>
                    <td className="font-medium text-white">{apt.doctor.user.name}</td>
                    <td>{apt.date} at {apt.time}</td>
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
