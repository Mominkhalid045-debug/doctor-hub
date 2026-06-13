import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role = 'PATIENT', 
            specialization, treatmentType, licenseNumber, experience, consultationFee } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    
    const validRoles = ['PATIENT', 'DOCTOR']
    const userRole = validRoles.includes(role) ? role : 'PATIENT'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
      }
    })

    // Create role-specific record
    if (userRole === 'PATIENT') {
      await prisma.patient.create({ data: { userId: user.id } })
    } else if (userRole === 'DOCTOR') {
      if (!specialization || !treatmentType || !licenseNumber) {
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json({ error: 'Doctor requires specialization, treatment type, and license number' }, { status: 400 })
      }
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialization,
          treatmentType,
          licenseNumber,
          experience: parseInt(experience) || 0,
          consultationFee: parseFloat(consultationFee) || 0,
        }
      })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }, { status: 201 })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
