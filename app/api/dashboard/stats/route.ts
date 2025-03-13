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

    // Get total number of invoices
    const totalInvoices = await prisma.invoice.count()

    // Get status counts using the correct enum values
    const statusCounts = {
      PENDING: await prisma.invoice.count({
        where: { status: InvoiceStatus.PENDING }
      }),
      PAID: await prisma.invoice.count({
        where: { status: InvoiceStatus.PAID }
      }),
      OVERDUE: await prisma.invoice.count({
        where: { status: InvoiceStatus.OVERDUE }
      }),
      CANCELLED: await prisma.invoice.count({
        where: { status: InvoiceStatus.CANCELLED }
      })
    }

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalInvoices,
      statusCounts
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