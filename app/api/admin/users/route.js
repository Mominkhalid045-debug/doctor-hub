import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/admin/users
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const where = role ? { role } : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, phone: true, createdAt: true,
        doctor: { select: { isVerified: true, specialization: true, treatmentType: true } },
        patient: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/users - Verify doctor
export async function PATCH(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { doctorId, isVerified } = await request.json()
    
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { isVerified }
    })

    return NextResponse.json({ success: true, data: doctor })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
