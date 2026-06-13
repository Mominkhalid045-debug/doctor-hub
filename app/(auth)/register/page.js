'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'PATIENT' // Default to patient registration
        })
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push('/patient/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card fade-in">
      <h2 className="text-xl font-bold mb-2">Create an account</h2>
      <p className="text-sm text-muted mb-6">Join Doctor Hub to manage your healthcare</p>
      
      {error && <div className="alert alert-error mb-4">{error}</div>}
      
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input 
            type="text" name="name"
            className="form-input" placeholder="John Doe"
            value={formData.name} onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" name="email"
            className="form-input" placeholder="name@example.com"
            value={formData.email} onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input 
            type="tel" name="phone"
            className="form-input" placeholder="+1-555-000-0000"
            value={formData.phone} onChange={handleChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" name="password"
            className="form-input" placeholder="••••••••"
            value={formData.password} onChange={handleChange}
            required minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input 
            type="password" name="confirmPassword"
            className="form-input" placeholder="••••••••"
            value={formData.confirmPassword} onChange={handleChange}
            required minLength={6}
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
      </div>
    </div>
  )
}
