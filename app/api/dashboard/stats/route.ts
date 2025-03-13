import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get total revenue (only from PAID invoices)
    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        status: 'PAID'
      },
      _sum: {
        amount: true
      }
    })

    // Get total number of invoices
    const totalInvoices = await prisma.invoice.count()

    // Get status counts
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      _count: {
        _all: true
      }
    })

    // Initialize counts with zeros
    const counts = {
      PENDING: 0,
      PAID: 0,
      OVERDUE: 0,
      CANCELLED: 0
    }

    // Update counts from database results
    statusCounts.forEach((item) => {
      if (item.status) {
        counts[item.status] = item._count._all
      }
    })

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalInvoices,
      statusCounts: counts
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json({
      totalRevenue: 0,
      totalInvoices: 0,
      statusCounts: {
        PENDING: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0
      }
    })
  }
} 