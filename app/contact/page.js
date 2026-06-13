import Navbar from '@/components/Navbar'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="container py-12 fade-in">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <form className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="Your email address" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input min-h-[150px]" placeholder="How can we help you?"></textarea>
              </div>
              <button type="button" className="btn btn-primary mt-2">Send Message</button>
            </form>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="flex flex-col gap-4 text-muted">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary" size={20} />
                  <span>support@doctorhub.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-primary" size={20} />
                  <span>+1 (800) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary" size={20} />
                  <span>123 Healthcare Ave, Medical City, NY 10001</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
