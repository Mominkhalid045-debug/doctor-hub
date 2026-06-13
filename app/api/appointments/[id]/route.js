import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// PATCH /api/appointments/[id] - Update status
export async function PATCH(request, { params }) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status, notes } = await request.json()

    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status, notes },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        payment: true,
        prescription: true,
      }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
