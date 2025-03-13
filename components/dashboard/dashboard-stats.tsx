"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, FileText, Users } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    activeClients: 0,
    lastMonthInvoices: 0,
    lastMonthRevenue: 0,
    lastMonthClients: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        const data = await response.json()
        setStats({
          totalInvoices: data.totalInvoices || 0,
          totalRevenue: data.totalRevenue || 0,
          activeClients: data.activeClients || 0,
          lastMonthInvoices: data.lastMonthInvoices || 0,
          lastMonthRevenue: data.lastMonthRevenue || 0,
          lastMonthClients: data.lastMonthClients || 0
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
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

  const revenueChange = stats.lastMonthRevenue ? 
    ((stats.totalRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalInvoices - stats.lastMonthInvoices > 0 ? '+' : ''}
            {stats.totalInvoices - stats.lastMonthInvoices} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            {revenueChange.toFixed(1)}% from last month
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeClients}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeClients - stats.lastMonthClients > 0 ? '+' : ''}
            {stats.activeClients - stats.lastMonthClients} new client this month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

