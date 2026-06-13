'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirect based on role
        const role = data.user.role
        if (role === 'PATIENT') router.push('/patient/dashboard')
        else if (role === 'DOCTOR') router.push('/doctor/dashboard')
        else if (role === 'ASSISTANT') router.push('/assistant/dashboard')
        else if (role === 'ADMIN' || role === 'SUPER_ADMIN') router.push('/admin/dashboard')
        else router.push('/')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card fade-in">
      <h2 className="text-xl font-bold mb-2">Welcome back</h2>
      <p className="text-sm text-muted mb-6">Enter your credentials to access your account</p>
      
      {error && <div className="alert alert-error mb-4">{error}</div>}
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input 
            type="email" 
            className="form-input" 
            placeholder="name@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required 
          />
        </div>
        
        <div className="form-group">
          <div className="flex justify-between items-center">
            <label className="form-label">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            className="form-input" 
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required 
          />
        </div>
        
        <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-muted">
        Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
      </div>

      <div className="mt-8 pt-6 border-t border-[#334155] text-xs text-muted">
        <p className="font-semibold mb-2">Demo Credentials:</p>
        <div className="grid grid-cols-2 gap-2">
          <span>Patient:</span> <span>john@patient.com</span>
          <span>Doctor:</span> <span>sarah@doctorhub.com</span>
          <span>Admin:</span> <span>admin@doctorhub.com</span>
          <span>Password:</span> <span>Role@123 (e.g. Patient@123)</span>
        </div>
      </div>
    </div>
  )
}
