import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user ID from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = user.id

    // Get all status counts first
    const allStatuses = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true,
      where: {
        userId
      }
    })

    // Convert status counts to the expected format
    const statusCounts = {
      PAID: 0,
      PENDING: 0,
      OVERDUE: 0,
      CANCELLED: 0,
      ...Object.fromEntries(
        allStatuses.map(({ status, _count }) => [status, _count])
      )
    }

    const [totalRevenue, currentMonthInvoices, lastMonthInvoices] = await Promise.all([
      // Calculate total revenue from paid invoices
      prisma.invoice.aggregate({
        _sum: {
          total: true  // Changed from 'amount' to 'total'
        },
        where: {
          userId,
          status: 'PAID'
        }
      }),

      // Current month invoices
      prisma.invoice.count({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      }),

      // Last month invoices
      prisma.invoice.count({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    return Response.json({
      totalRevenue: totalRevenue._sum.total || 0,
      currentMonthInvoices,
      lastMonthInvoices,
      statusCounts
    });

  } catch (error) {
    console.error('Error in dashboard stats:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 