import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/jwt'
import { NextResponse } from 'next/server'

// GET /api/admin/stats - Admin dashboard stats
export async function GET(request) {
  try {
    const userData = getUserFromRequest(request)
    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [
      totalUsers, totalDoctors, totalPatients, totalAppointments,
      pendingPayments, totalRevenue, recentAppointments
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ where: { status: 'VERIFIED' }, _sum: { amount: true } }),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { include: { user: { select: { name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, totalDoctors, totalPatients, totalAppointments,
        pendingPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentAppointments
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
