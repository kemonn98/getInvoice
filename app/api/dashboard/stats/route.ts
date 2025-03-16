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
      const [totalInvoices, totalPending, totalPaid, recentInvoices] = await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({
          where: { status: 'PENDING' }
        }),
        prisma.invoice.count({
          where: { status: 'PAID' }
        }),
        prisma.invoice.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { client: true }
        })
      ])

      return {
        totalInvoices,
        totalPending,
        totalPaid,
        recentInvoices
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
} 