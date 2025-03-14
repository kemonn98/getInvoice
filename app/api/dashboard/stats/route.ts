import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get current date info
    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Get all invoices for the user
    const [
      totalRevenue,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts
    ] = await Promise.all([
      // Calculate total revenue from paid invoices
      prisma.invoice.aggregate({
        where: {
          userId,
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),

      // Count current month invoices
      prisma.invoice.count({
        where: {
          userId,
          createdAt: {
            gte: startOfCurrentMonth
          }
        }
      }),

      // Count last month invoices
      prisma.invoice.count({
        where: {
          userId,
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfCurrentMonth
          }
        }
      }),

      // Get counts by status
      prisma.invoice.groupBy({
        where: {
          userId
        },
        by: ['status'],
        _count: true
      })
    ])

    // Format status counts
    const formattedStatusCounts = {
      PENDING: 0,
      PAID: 0,
      OVERDUE: 0,
      CANCELLED: 0
    }

    statusCounts.forEach((status) => {
      formattedStatusCounts[status.status as keyof typeof formattedStatusCounts] = status._count
    })

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts: formattedStatusCounts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { status: 500 }
    )
  }
} 