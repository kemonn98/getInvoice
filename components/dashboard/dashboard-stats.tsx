"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, PieChart } from "lucide-react"

interface DashboardStats {
  totalRevenue: number
  currentMonthInvoices: number
  lastMonthInvoices: number
  statusCounts: {
    PENDING: number
    PAID: number
    OVERDUE: number
    CANCELLED: number
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(stats.totalRevenue || 0).toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            From all paid invoices
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month's Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentMonthInvoices}</div>
          <p className="text-xs text-muted-foreground">
            {stats.currentMonthInvoices > stats.lastMonthInvoices ? '+' : ''}
            {stats.currentMonthInvoices - stats.lastMonthInvoices} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Draft</span>
              <span className="font-bold">{stats.statusCounts?.DRAFT || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600">Pending</span>
              <span className="font-bold">{stats.statusCounts?.PENDING || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Paid</span>
              <span className="font-bold">{stats.statusCounts?.PAID || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600">Overdue</span>
              <span className="font-bold">{stats.statusCounts?.OVERDUE || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Cancelled</span>
              <span className="font-bold">{stats.statusCounts?.CANCELLED || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

