import Link from 'next/link'
import { Activity } from 'lucide-react'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0ea5e9] opacity-5 blur-[100px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#6366f1] opacity-5 blur-[100px]"></div>
      
      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#6366f1] text-transparent bg-clip-text">
            <Activity className="text-[#0ea5e9]" size={32} />
            Doctor Hub
          </Link>
        </div>
        
        {children}
      </div>
    </div>
  )
}
