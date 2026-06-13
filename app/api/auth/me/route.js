import { getUserFromRequest } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userData.id },
      select: {
        id: true, name: true, email: true, role: true, phone: true, avatar: true, createdAt: true,
        patient: true,
        doctor: { include: { clinics: { include: { schedules: true } } } },
        assistant: { include: { doctor: true } }
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
