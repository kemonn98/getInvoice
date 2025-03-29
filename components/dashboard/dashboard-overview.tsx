"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmployees, getSalarySlips } from "@/app/actions/salary"
import { Employee, SalarySlip } from "@/types/employee"
import { EmployeeStatusBadge } from "@/components/ui/employee-status-badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingDown, TrendingUp, Users, UserCheck, Clock, UserCog, Wallet, Users as UsersGroup, Calculator } from "lucide-react"
import { Loading } from "@/components/loading"

const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return `${amount.toFixed(0)}`
}

export function DashboardOverview() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [employeesData, salarySlipsData] = await Promise.all([
          getEmployees(),
          getSalarySlips()
        ])
        setEmployees(employeesData as unknown as Employee[])
        setSalarySlips(salarySlipsData as unknown as SalarySlip[])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate employee statistics
  const employeeStats = employees.reduce((acc, emp) => {
    acc[emp.status] = (acc[emp.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get last month's salary slips
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
  const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2)
  
  const lastMonthName = lastMonth.toLocaleString('default', { month: 'long' })
  const lastMonthYear = lastMonth.getFullYear()
  const twoMonthsAgoName = twoMonthsAgo.toLocaleString('default', { month: 'long' })
  const twoMonthsAgoYear = twoMonthsAgo.getFullYear()

  const lastMonthSlips = salarySlips.filter(
    slip => slip.month === lastMonthName && slip.year === lastMonthYear
  )
  const twoMonthsAgoSlips = salarySlips.filter(
    slip => slip.month === twoMonthsAgoName && slip.year === twoMonthsAgoYear
  )

  // Calculate salary totals
  const lastMonthTotal = lastMonthSlips.reduce((sum, slip) => sum + slip.totalSalary, 0)
  const twoMonthsAgoTotal = twoMonthsAgoSlips.reduce((sum, slip) => sum + slip.totalSalary, 0)
  const salaryDifference = lastMonthTotal - twoMonthsAgoTotal
  const salaryChangePercent = twoMonthsAgoTotal ? (salaryDifference / twoMonthsAgoTotal) * 100 : 0

  // Add these calculations where you calculate other salary totals
  const highestSalary = lastMonthSlips.length 
    ? Math.max(...lastMonthSlips.map(slip => slip.totalSalary))
    : 0

  const lowestSalary = lastMonthSlips.length 
    ? Math.min(...lastMonthSlips.map(slip => slip.totalSalary))
    : 0

  const averageSalary = lastMonthSlips.length 
    ? lastMonthTotal / lastMonthSlips.length 
    : 0

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Employees Overview Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Employees Overview</CardTitle>
              <CardDescription>Current employee statistics</CardDescription>
            </div>
            <Link href="/dashboard/employees">
              <Button variant="ghost" size="sm" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <UsersGroup className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">{employees.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">{employeeStats.FULL_TIME || 0}</div>
                  <div className="text-xs text-muted-foreground">Full Time</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <UserCog className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">{employeeStats.CONTRACT || 0}</div>
                  <div className="text-xs text-muted-foreground">Contract</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">{employeeStats.PROBATION || 0}</div>
                  <div className="text-xs text-muted-foreground">Probation</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Overview Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Salary Overview</CardTitle>
              <CardDescription>Summary for {lastMonthName} {lastMonthYear}</CardDescription>
            </div>
            <Link href="/dashboard/salary-slips">
              <Button variant="ghost" size="sm" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">
                    {formatCompactCurrency(lastMonthTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {salaryDifference > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {salaryChangePercent.toFixed(1)}% vs prev
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">
                    {formatCompactCurrency(highestSalary)}
                  </div>
                  <div className="text-xs text-muted-foreground">Highest</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">
                    {formatCompactCurrency(averageSalary)}
                  </div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-base font-medium">
                    {formatCompactCurrency(lowestSalary)}
                  </div>
                  <div className="text-xs text-muted-foreground">Lowest</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 