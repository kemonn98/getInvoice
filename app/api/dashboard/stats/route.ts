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
          id: true,  // Added id for better logging
          total: true,
          status: true,
          createdAt: true,
        }
      });
      
      console.log('Raw invoices fetched:', JSON.stringify(invoices, null, 2));
      
      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      console.log('Current date info:', {
        currentMonth,
        currentYear,
        fullDate: now.toISOString()
      });

      // Count current and last month invoices with logging
      const currentMonthInvoices = invoices.filter((inv: { createdAt: Date }) => {
        const isCurrentMonth = inv.createdAt.getMonth() === currentMonth && 
                             inv.createdAt.getFullYear() === currentYear;
        console.log('Invoice date check (current month):', {
          invoiceId: inv.id,
          invoiceDate: inv.createdAt,
          invoiceMonth: inv.createdAt.getMonth(),
          invoiceYear: inv.createdAt.getFullYear(),
          isCurrentMonth
        });
        return isCurrentMonth;
      }).length;

      const lastMonthInvoices = invoices.filter((inv: { createdAt: Date }) => {
        const isLastMonth = inv.createdAt.getMonth() === (currentMonth - 1) && 
                          inv.createdAt.getFullYear() === currentYear;
        console.log('Invoice date check (last month):', {
          invoiceId: inv.id,
          invoiceDate: inv.createdAt,
          invoiceMonth: inv.createdAt.getMonth(),
          invoiceYear: inv.createdAt.getFullYear(),
          isLastMonth
        });
        return isLastMonth;
      }).length;

      // Log revenue calculation
      const paidInvoices = invoices.filter((inv: { status: string }) => inv.status === 'PAID');
      console.log('Paid invoices:', paidInvoices);
      
      const totalRevenue = paidInvoices
        .reduce((sum: number, inv: { total: number }) => {
          console.log('Adding to revenue:', {
            invoiceId: inv.id,
            invoiceTotal: inv.total,
            runningSum: sum + (inv.total || 0)
          });
          return sum + (inv.total || 0);
        }, 0);

      // Count statuses with logging
      const statusCounts = {
        PENDING: 0,
        PAID: 0,
        OVERDUE: 0,
        CANCELLED: 0
      };

      invoices.forEach((inv: { status: string, id: string }) => {
        if (statusCounts.hasOwnProperty(inv.status)) {
          statusCounts[inv.status as keyof typeof statusCounts]++;
          console.log('Status count update:', {
            invoiceId: inv.id,
            status: inv.status,
            newCount: statusCounts[inv.status as keyof typeof statusCounts]
          });
        }
      });

      const finalStats = {
        totalRevenue,
        currentMonthInvoices,
        lastMonthInvoices,
        statusCounts
      };
      
      console.log('Final stats:', finalStats);
      
      return finalStats;
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