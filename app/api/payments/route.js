import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST /api/payments - Upload payment screenshot
export async function POST(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || userData.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Only patients can upload payments' }, { status: 403 })
    }

    const formData = await request.formData()
    const appointmentId = formData.get('appointmentId')
    const amount = formData.get('amount')
    const screenshot = formData.get('screenshot')

    if (!appointmentId || !amount || !screenshot) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })

    if (!appointment || appointment.patientId !== patient?.id) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Save file
    const bytes = await screenshot.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payments')
    await mkdir(uploadsDir, { recursive: true })
    const filename = `payment_${appointmentId}_${Date.now()}${path.extname(screenshot.name)}`
    await writeFile(path.join(uploadsDir, filename), buffer)
    
    const screenshotUrl = `/uploads/payments/${filename}`

    // Create or update payment
    const existingPayment = await prisma.payment.findUnique({ where: { appointmentId } })
    
    let payment
    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { appointmentId },
        data: { amount: parseFloat(amount), screenshot: screenshotUrl, status: 'PENDING' }
      })
    } else {
      payment = await prisma.payment.create({
        data: {
          appointmentId,
          patientId: patient.id,
          amount: parseFloat(amount),
          screenshot: screenshotUrl,
          status: 'PENDING'
        }
      })
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'PAYMENT_UPLOADED' }
    })

    return NextResponse.json({ success: true, data: payment }, { status: 201 })
  } catch (error) {
    console.error('Payment upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/payments - Get payments (for assistants/doctors/admins)
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let where = {}
    
    if (userData.role === 'ASSISTANT') {
      const assistant = await prisma.assistant.findUnique({ where: { userId: userData.id } })
      if (assistant) {
        where = {
          appointment: { doctorId: assistant.doctorId }
        }
      }
    } else if (userData.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: userData.id } })
      if (patient) where.patientId = patient.id
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: { include: { user: { select: { name: true } } } },
            doctor: { include: { user: { select: { name: true } } } }
          }
        },
        assistant: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
