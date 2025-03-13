import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get total revenue (from paid invoices)
    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    })

    // Get current month and last month dates
    const now = new Date()
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get invoice counts
    const currentMonthInvoices = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: firstDayThisMonth,
          lt: now
        }
      }
    })

    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: firstDayLastMonth,
          lt: firstDayThisMonth
        }
      }
    })

    // Get status counts
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true
    })

    // Convert to a map of status counts
    const statusMap = statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts: statusMap
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 