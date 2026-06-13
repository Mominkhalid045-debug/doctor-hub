'use client'

import Link from 'next/link'
import { Activity, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <Activity className="text-primary" size={28} />
          Doctor Hub
        </Link>
        
        <div className="navbar-links">
          <Link href="/doctors" className="navbar-link">Find Doctors</Link>
          <Link href="/about" className="navbar-link">About Us</Link>
          <Link href="/contact" className="navbar-link">Contact</Link>
        </div>

        <div className="navbar-actions hidden md:flex">
          <Link href="/login" className="btn btn-ghost">Log In</Link>
          <Link href="/register" className="btn btn-primary">Sign Up</Link>
        </div>
        
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#1e293b] border-b border-[#334155] p-4 flex flex-col gap-4">
          <Link href="/doctors" className="navbar-link">Find Doctors</Link>
          <Link href="/about" className="navbar-link">About Us</Link>
          <Link href="/contact" className="navbar-link">Contact</Link>
          <hr className="border-[#334155]" />
          <Link href="/login" className="btn btn-outline w-full justify-center">Log In</Link>
          <Link href="/register" className="btn btn-primary w-full justify-center">Sign Up</Link>
        </div>
      )}
    </nav>
  )
}
