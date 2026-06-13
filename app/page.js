import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Search, Calendar, HeartPulse, ShieldCheck, Activity, Users, Star } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="container relative z-10">
            <div className="hero-content fade-in">
              <div className="hero-badge">
                <Activity size={16} /> Advanced Healthcare System
              </div>
              <h1 className="hero-title">
                Find the right doctor, <br />
                <span>book your appointment</span> <br />
                instantly.
              </h1>
              <p className="hero-desc">
                Doctor Hub is your premier medical consultation platform. 
                Search specialists by disease, treatment type, and location. 
                Experience seamless booking and secure medical history.
              </p>
              
              <div className="hero-actions">
                <Link href="/doctors" className="btn btn-primary btn-lg">
                  <Search size={20} /> Find Doctors
                </Link>
                <Link href="/register" className="btn btn-outline btn-lg">
                  Register as Patient
                </Link>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="hero-stat-num">500+</div>
                  <div className="hero-stat-label">Verified Specialists</div>
                </div>
                <div>
                  <div className="hero-stat-num">10k+</div>
                  <div className="hero-stat-label">Happy Patients</div>
                </div>
                <div>
                  <div className="hero-stat-num">4.9</div>
                  <div className="hero-stat-label">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="section bg-[#1e293b] border-y border-[#334155]">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-center mb-8">Quick Search</h2>
              <div className="search-bar">
                <Search size={20} className="text-muted" />
                <input 
                  type="text" 
                  placeholder="Search by doctor name, disease, or specialization..." 
                  className="search-input"
                />
                <button className="btn btn-primary">Search</button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <span className="badge badge-primary">Allopathic</span>
                <span className="badge badge-success">Homeopathic</span>
                <span className="badge badge-warning">Herbal / Unani</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="section-title">Why Choose Doctor Hub?</h2>
              <p className="section-subtitle">
                We bring advanced technology to healthcare, making it easier for you to manage your health journey.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon bg-[rgba(14,165,233,0.1)] text-[#0ea5e9]">
                  <Search />
                </div>
                <h3 className="feature-title">Smart Filtering</h3>
                <p className="feature-desc">
                  Find the exact specialist you need by filtering through diseases, treatment types, and ratings.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-[rgba(16,185,129,0.1)] text-[#10b981]">
                  <Calendar />
                </div>
                <h3 className="feature-title">Easy Booking</h3>
                <p className="feature-desc">
                  Book appointments seamlessly. Upload payment proofs and get instant verification from clinic assistants.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-[rgba(99,102,241,0.1)] text-[#6366f1]">
                  <ShieldCheck />
                </div>
                <h3 className="feature-title">Immutable History</h3>
                <p className="feature-desc">
                  Your medical history and prescriptions are securely stored and immutable, ensuring complete data integrity.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-[#334155] py-12 mt-12">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="navbar-logo">
              <Activity className="text-primary" size={24} /> Doctor Hub
            </div>
            <p className="text-[#94a3b8] text-sm">
              &copy; {new Date().getFullYear()} Doctor Hub. Final Semester Project.
            </p>
          </div>
        </footer>
      </main>
    </>
  )
}
