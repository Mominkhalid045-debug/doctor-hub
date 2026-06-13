import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// PATCH /api/payments/[id]/verify - Assistant verifies payment
export async function PATCH(request, { params }) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || !['ASSISTANT', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const { status, notes } = await request.json() // status: VERIFIED | REJECTED

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    let assistantId = null
    if (userData.role === 'ASSISTANT') {
      const assistant = await prisma.assistant.findUnique({ where: { userId: userData.id } })
      assistantId = assistant?.id
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        notes,
        verifiedById: assistantId,
        verifiedAt: new Date()
      }
    })

    // Update appointment status based on payment verification
    if (status === 'VERIFIED') {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' }
      })
    } else if (status === 'REJECTED') {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'PENDING' }
      })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error('Payment verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
