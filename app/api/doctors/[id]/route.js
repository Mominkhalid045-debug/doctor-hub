import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, avatar: true, createdAt: true } },
        clinics: {
          where: { isActive: true },
          include: { schedules: { where: { isActive: true } } }
        },
        _count: { select: { appointments: true, prescriptions: true } }
      }
    })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: doctor })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
