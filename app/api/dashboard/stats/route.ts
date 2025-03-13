import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { InvoiceStatus } from "@prisma/client"

export async function GET() {
  try {
    // Get total revenue (only from PAID invoices)
    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        status: InvoiceStatus.PAID
      },
      _sum: {
        amount: true
      }
    })

    // Get current month's invoices
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const currentMonthInvoices = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Get last month's invoices
    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      }
    })

    // Get status counts
    const statusCounts = {
      PENDING: await prisma.invoice.count({ where: { status: InvoiceStatus.PENDING } }),
      PAID: await prisma.invoice.count({ where: { status: InvoiceStatus.PAID } }),
      OVERDUE: await prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      CANCELLED: await prisma.invoice.count({ where: { status: InvoiceStatus.CANCELLED } })
    }

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json({
      totalRevenue: 0,
      currentMonthInvoices: 0,
      lastMonthInvoices: 0,
      statusCounts: {
        PENDING: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0
      }
    })
  }
} 