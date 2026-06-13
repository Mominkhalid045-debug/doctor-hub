import Navbar from '@/components/Navbar'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="container py-12 fade-in">
        <h1 className="text-4xl font-bold mb-6">About Doctor Hub</h1>
        <div className="card max-w-4xl">
          <p className="text-lg text-muted mb-4">
            Doctor Hub is a comprehensive healthcare consultation platform dedicated to providing 
            easy access to medical professionals. Our mission is to bridge the gap between patients 
            and healthcare providers, ensuring everyone gets the right treatment at the right time.
          </p>
          <p className="text-lg text-muted mb-4">
            We offer a wide range of medical disciplines including Allopathic, Homeopathic, and 
            Herbal (Unani) medicine. Our platform allows patients to easily search for doctors 
            based on their specific diseases, view verified doctor profiles, and securely book 
            appointments online.
          </p>
          <p className="text-lg text-muted">
            With Doctor Hub, your medical history is securely maintained and your prescriptions 
            are always accessible. We strive to make healthcare accessible, transparent, and 
            efficient for everyone.
          </p>
        </div>
      </div>
    </>
  )
}
