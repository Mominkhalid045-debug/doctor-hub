'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Search, Star, MapPin, Activity, Calendar } from 'lucide-react'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [treatmentType, setTreatmentType] = useState('')
  const [disease, setDisease] = useState('')

  // Booking Modal States
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({ search, treatmentType, disease })
      const res = await fetch(`/api/doctors?${query}`)
      const data = await res.json()
      if (data.success) {
        setDoctors(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  const handleBookClick = (doctor) => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      window.location.href = '/login'
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'PATIENT') {
      setBookingError('Only patients can book appointments. Please log in with a patient account.')
      // Still show the modal but with the error state so they understand why they can't book
      setSelectedDoctor(doctor)
      setBookingData({ date: '', time: '', reason: '' })
      return
    }
    setSelectedDoctor(doctor)
    setBookingData({ date: '', time: '', reason: '' })
    setBookingError('')
    setBookingSuccess(false)
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingLoading(true)
    setBookingError('')

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: bookingData.date,
          time: bookingData.time,
          reason: bookingData.reason
        })
      })
      const data = await res.json()

      if (data.success) {
        setBookingSuccess(true)
        setTimeout(() => {
          setSelectedDoctor(null)
          setBookingSuccess(false)
        }, 2000)
      } else {
        setBookingError(data.error || 'Failed to book appointment')
      }
    } catch (err) {
      setBookingError('Something went wrong')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="container py-8 fade-in">
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-muted mb-8">Search by specialization, treatment type, or disease.</p>

        <form onSubmit={handleSubmit} className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Search</label>
              <div className="search-bar mt-1">
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Doctor name, specialization..." 
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Treatment Type</label>
              <select 
                className="form-select mt-1"
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="ALLOPATHIC">Allopathic</option>
                <option value="HOMEOPATHIC">Homeopathic</option>
                <option value="HERBAL">Herbal / Unani</option>
              </select>
            </div>

            <div>
              <label className="form-label">Disease</label>
              <select 
                className="form-select mt-1"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
              >
                <option value="">All Diseases</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Asthma">Asthma</option>
                <option value="Arthritis">Arthritis</option>
                <option value="Heart Disease">Heart Disease</option>
                <option value="Skin Disorders">Skin Disorders</option>
                <option value="Depression">Depression</option>
                <option value="Anxiety">Anxiety</option>
                <option value="Fever">Fever</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn btn-primary">Filter Results</button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-20"><Activity size={48} className="text-primary loading" /></div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 card">
            <Search size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No doctors found</h3>
            <p className="text-muted">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="flex items-start gap-4">
                  <div className="doctor-avatar">
                    {doctor.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="doctor-name">{doctor.user.name}</h3>
                    <p className="doctor-spec mb-1">{doctor.specialization}</p>
                    <span className={`badge treatment-${doctor.treatmentType.toLowerCase()} text-xs`}>
                      {doctor.treatmentType.toLowerCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="doctor-rating">
                    <Star size={16} fill="currentColor" />
                    <span>{doctor.rating.toFixed(1)}</span>
                    <span className="text-muted font-normal">({doctor.totalReviews} reviews)</span>
                  </div>
                  <div className="mt-2 text-sm text-muted line-clamp-2">
                    <span className="font-semibold text-text-dim">Treats: </span>
                    {doctor.diseases ? JSON.parse(doctor.diseases).join(', ') : 'General'}
                  </div>
                </div>

                <div className="doctor-meta">
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wider font-bold">Consultation Fee</div>
                    <div className="doctor-fee">${doctor.consultationFee}</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleBookClick(doctor)}>
                    <Calendar size={16} /> Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#334155] fade-in">
            <h2 className="text-xl font-bold mb-2">Book Appointment</h2>
            <p className="text-sm text-muted mb-6">Booking consultation with Dr. {selectedDoctor.user.name}</p>
            
            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity size={32} />
                </div>
                <h3 className="text-lg font-bold text-green-400">Booking Requested!</h3>
                <p className="text-sm text-muted mt-2">Please upload your payment in your dashboard to confirm.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                {bookingError && <div className="alert alert-error">{bookingError}</div>}
                
                <div className="form-group">
                  <label className="form-label">Select Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Preferred Time</label>
                  <select 
                    className="form-select" 
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                  >
                    <option value="">Select a time slot</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <textarea 
                    className="form-input min-h-[100px]" 
                    placeholder="Briefly describe your symptoms or reason for consultation..."
                    required
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" className="btn btn-ghost" onClick={() => setSelectedDoctor(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={bookingLoading || bookingError !== ''}>
                    {bookingLoading ? 'Booking...' : 'Request Appointment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
