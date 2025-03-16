import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Only retry on connection errors
      if (error.code !== 'P1001' && error.code !== 'P1002') {
        throw error
      }
      
      // Wait before retrying
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)))
      }
    }
  }
  
  throw lastError
}

export async function GET() {
  try {
    const stats = await executeWithRetry(async () => {
      // Get all invoices for calculations
      const invoices = await prisma.invoice.findMany({
        select: {
          total: true,
          status: true,
          createdAt: true,
        }
      });

      // Calculate total revenue (sum of all paid invoices)
      const totalRevenue = invoices
        .filter((inv: { status: string }) => inv.status === 'PAID')
        .reduce((sum: number, inv: { total: number }) => sum + (inv.total || 0), 0);

      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Count current and last month invoices
      const currentMonthInvoices = invoices.filter((inv: { createdAt: string }) => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() === currentMonth && 
               invDate.getFullYear() === currentYear;
      }).length;

      const lastMonthInvoices = invoices.filter((inv: { createdAt: string }) => {
        const invDate = new Date(inv.createdAt);
        return invDate.getMonth() === (currentMonth - 1) && 
               invDate.getFullYear() === currentYear;
      }).length;

      // Count statuses
      const statusCounts = {
        PENDING: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0
      };

      invoices.forEach((inv: { status: string }) => {
        if (statusCounts.hasOwnProperty(inv.status)) {
          statusCounts[inv.status as keyof typeof statusCounts]++;
        }
      });

      return {
        totalRevenue,
        currentMonthInvoices,
        lastMonthInvoices,
        statusCounts
      };
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 