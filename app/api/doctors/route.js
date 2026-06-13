import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/doctors - Search and filter doctors
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const treatmentType = searchParams.get('treatmentType') || ''
    const disease = searchParams.get('disease') || ''
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12

    const where = {
      isVerified: true,
      AND: []
    }

    if (treatmentType && ['ALLOPATHIC', 'HOMEOPATHIC', 'HERBAL'].includes(treatmentType)) {
      where.treatmentType = treatmentType
    }

    if (search) {
      where.AND.push({
        OR: [
          { specialization: { contains: search } },
          { user: { name: { contains: search } } },
          { diseases: { contains: search } },
        ]
      })
    }

    if (disease) {
      where.AND.push({ diseases: { contains: disease } })
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, avatar: true } },
          clinics: { where: { isActive: true }, include: { schedules: true } },
          _count: { select: { appointments: true } }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { rating: 'desc' }
      }),
      prisma.doctor.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Doctors fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
