import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { InvoiceStatus } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { headers } from 'next/headers'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get total revenue (only from PAID invoices for this user)
    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        userId: userId,
        status: InvoiceStatus.PAID
      },
      _sum: {
        amount: true
      }
    })

    // Get current month's invoices for this user
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const currentMonthInvoices = await prisma.invoice.count({
      where: {
        userId: userId,
        AND: [
          {
            createdAt: {
              gte: startOfMonth
            }
          }
        ]
      }
    })

    // Get last month's invoices for this user
    const startOfLastMonth = new Date(startOfMonth)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    const lastMonthInvoices = await prisma.invoice.count({
      where: {
        userId: userId,
        AND: [
          {
            createdAt: {
              gte: startOfLastMonth,
              lt: startOfMonth
            }
          },
          {
            NOT: {
              status: InvoiceStatus.CANCELLED
            }
          }
        ]
      }
    })

    // Get status counts for this user
    const statusCounts = {
      PENDING: await prisma.invoice.count({ 
        where: { 
          userId: userId,
          status: InvoiceStatus.PENDING 
        } 
      }),
      PAID: await prisma.invoice.count({ 
        where: { 
          userId: userId,
          status: InvoiceStatus.PAID 
        } 
      }),
      OVERDUE: await prisma.invoice.count({ 
        where: { 
          userId: userId,
          status: InvoiceStatus.OVERDUE 
        } 
      }),
      CANCELLED: await prisma.invoice.count({ 
        where: { 
          userId: userId,
          status: InvoiceStatus.CANCELLED 
        } 
      })
    }

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 