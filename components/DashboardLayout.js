'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Activity, LayoutDashboard, Calendar, Users, 
  FileText, CreditCard, Settings, LogOut, Menu, X 
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success) {
          setUser(data.user)
        } else {
          router.push('/login')
        }
      } catch (err) {
        router.push('/login')
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="loading"><Activity size={48} className="text-primary" /></div></div>
  }

  const role = user.role
  const prefix = `/${role.toLowerCase()}`

  const navLinks = []
  
  if (role === 'PATIENT') {
    navLinks.push(
      { name: 'Dashboard', href: `${prefix}/dashboard`, icon: <LayoutDashboard size={18} /> },
      { name: 'Find Doctors', href: '/doctors', icon: <Users size={18} /> },
      { name: 'Appointments', href: `${prefix}/appointments`, icon: <Calendar size={18} /> },
      { name: 'Medical History', href: `${prefix}/history`, icon: <FileText size={18} /> }
    )
  } else if (role === 'DOCTOR') {
    navLinks.push(
      { name: 'Dashboard', href: `${prefix}/dashboard`, icon: <LayoutDashboard size={18} /> },
      { name: 'Appointments', href: `${prefix}/appointments`, icon: <Calendar size={18} /> },
      { name: 'Patients', href: `${prefix}/patients`, icon: <Users size={18} /> },
      { name: 'Prescriptions', href: `${prefix}/prescriptions`, icon: <FileText size={18} /> }
    )
  } else if (role === 'ASSISTANT') {
    navLinks.push(
      { name: 'Dashboard', href: `${prefix}/dashboard`, icon: <LayoutDashboard size={18} /> },
      { name: 'Appointments', href: `${prefix}/appointments`, icon: <Calendar size={18} /> },
      { name: 'Payments', href: `${prefix}/payments`, icon: <CreditCard size={18} /> }
    )
  } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
    navLinks.push(
      { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
      { name: 'Manage Doctors', href: '/admin/doctors', icon: <Users size={18} /> },
      { name: 'Manage Users', href: '/admin/users', icon: <Users size={18} /> },
      { name: 'System Stats', href: '/admin/stats', icon: <Activity size={18} /> }
    )
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-[#1e293b] rounded-md border border-[#334155]"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform z-40`}>
        <div className="sidebar-logo flex items-center gap-2">
          <Activity size={24} className="text-primary" />
          Doctor Hub
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="sidebar-section">
            <div className="sidebar-label">Menu</div>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-[#334155]">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#6366f1] flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{user.name}</div>
              <div className="text-xs text-muted capitalize">{role.replace('_', ' ').toLowerCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-left text-danger hover:text-danger hover:bg-[rgba(239,68,68,0.1)]">
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main fade-in">
        <header className="dashboard-header">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {pathname.split('/').pop().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-sm text-muted">Welcome back, {user.name.split(' ')[0]}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-outline btn-sm">Home Page</Link>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
