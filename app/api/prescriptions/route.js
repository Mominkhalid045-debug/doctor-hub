import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/prescriptions
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    let where = {}
    if (appointmentId) where.appointmentId = appointmentId

    if (userData.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
      where = { ...where, appointment: { patientId: patient?.id } }
    } else if (userData.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: userData.id } })
      where.doctorId = doctor?.id
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        appointment: {
          include: {
            patient: { include: { user: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: prescriptions })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/prescriptions - Doctor adds prescription (immutable)
export async function POST(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || userData.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can add prescriptions' }, { status: 403 })
    }

    const { appointmentId, medications, instructions, diagnosis, followUpDate } = await request.json()

    if (!appointmentId || !medications || !instructions) {
      return NextResponse.json({ error: 'Appointment ID, medications and instructions are required' }, { status: 400 })
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: userData.id } })
    
    // Check if prescription already exists (immutable - cannot replace)
    const existing = await prisma.prescription.findUnique({ where: { appointmentId } })
    if (existing) {
      return NextResponse.json({ error: 'Prescription already exists for this appointment and cannot be modified' }, { status: 409 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        doctorId: doctor.id,
        medications: JSON.stringify(medications),
        instructions,
        diagnosis,
        followUpDate
      }
    })

    // Mark appointment as completed
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({ success: true, data: prescription }, { status: 201 })
  } catch (error) {
    console.error('Prescription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
