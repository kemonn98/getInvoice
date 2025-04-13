"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, PieChart, TrendingUp } from "lucide-react"
import { DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (status === "loading") return

      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/stats")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch stats")
        }

        const data = await response.json()

        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session, status])

  const calculateTrend = () => {
    if (!stats) return 0

    const current = stats.currentMonthInvoices ?? 0
    const last = stats.lastMonthInvoices ?? 0

    if (last === 0) return 0

    return ((current - last) / last) * 100
  }

  if (status === "loading" || loading) {
    return <StatsLoading />
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  if (!stats) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue ?? 0)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Invoices This Month</CardTitle>
          <FileText className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{stats.currentMonthInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.currentMonthInvoices > 0 ? `${stats.currentMonthInvoices} total invoices` : "No invoices yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Status Overview</CardTitle>
          <PieChart className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <span className="text-sm">Pending</span>
              </div>
              <span className="text-sm font-bold">{stats.statusCounts?.PENDING ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-sm">Paid</span>
              </div>
              <span className="text-sm font-bold">{stats.statusCounts?.PAID ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <span className="text-sm">Overdue</span>
              </div>
              <span className="text-sm font-bold">{stats.statusCounts?.OVERDUE ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span className="text-sm">Cancelled</span>
              </div>
              <span className="text-sm font-bold">{stats.statusCounts?.CANCELLED ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Trend</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold text-orange-600">{calculateTrend().toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Compared to last month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

