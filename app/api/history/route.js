import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/history - Get medical history
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    let targetPatientId = patientId

    if (userData.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
      targetPatientId = patient?.id
    }

    if (!targetPatientId) {
      return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
    }

    const history = await prisma.medicalHistory.findMany({
      where: { patientId: targetPatientId },
      include: {
        patient: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/history - Add medical history (doctor only)
export async function POST(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || !['DOCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Only doctors can add medical history' }, { status: 403 })
    }

    const { patientId, title, description, diagnosis, fileUrl } = await request.json()

    if (!patientId || !title || !description) {
      return NextResponse.json({ error: 'Patient ID, title and description are required' }, { status: 400 })
    }

    const history = await prisma.medicalHistory.create({
      data: {
        patientId,
        title,
        description,
        diagnosis,
        fileUrl,
        addedBy: userData.id
      }
    })

    return NextResponse.json({ success: true, data: history }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
