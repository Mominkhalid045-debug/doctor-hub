import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/appointments - get user's appointments
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let where = {}

    if (userData.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
      if (!patient) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      where.patientId = patient.id
    } else if (userData.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: userData.id } })
      if (!doctor) return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      where.doctorId = doctor.id
    } else if (userData.role === 'ASSISTANT') {
      const assistant = await prisma.assistant.findUnique({ where: { userId: userData.id } })
      if (!assistant) return NextResponse.json({ error: 'Assistant profile not found' }, { status: 404 })
      where.doctorId = assistant.doctorId
    }

    if (status) where.status = status

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true, avatar: true } } } },
        doctor: { include: { user: { select: { name: true, email: true, phone: true, avatar: true } } } },
        payment: true,
        prescription: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: appointments })
  } catch (error) {
    console.error('Appointments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/appointments - book appointment
export async function POST(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || userData.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Only patients can book appointments' }, { status: 403 })
    }

    const { doctorId, date, time, reason } = await request.json()

    if (!doctorId || !date || !time || !reason) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
    if (!patient) return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } })
    if (!doctor) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        date,
        time,
        reason,
        status: 'PENDING'
      },
      include: {
        doctor: { include: { user: { select: { name: true } } } }
      }
    })

    return NextResponse.json({ success: true, data: appointment }, { status: 201 })
  } catch (error) {
    console.error('Book appointment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
