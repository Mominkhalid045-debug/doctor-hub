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
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Booking functionality coming next!')}>
                    <Calendar size={16} /> Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
