"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSalarySlips } from "@/app/actions/salary"
import type { SalarySlip } from "@/types/salary"
import { formatCurrency } from "@/lib/utils"

export function SalarySlipList() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const fetchSalarySlips = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getSalarySlips()
          setSalarySlips(data as SalarySlip[])
        } catch (err) {
          console.error("Error fetching salary slips:", err)
          if (err instanceof Error) {
            if (err.message.includes("Unauthorized")) {
              router.replace("/login")
            } else {
              setError(err.message)
            }
          } else {
            setError("Failed to load salary slips")
          }
        } finally {
          setIsLoading(false)
        }
      }

      fetchSalarySlips()
    } else if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, session, router])

  // Sort salary slips by date (newest first)
  const sortedSalarySlips = [...salarySlips].sort((a, b) => {
    // Sort by year first
    if (a.year !== b.year) return b.year - a.year

    // Then sort by month
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months.indexOf(b.month) - months.indexOf(a.month)
  })

  if (error) return <div>Error: {error}</div>

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Slips</CardTitle>
          <CardDescription>Loading salary slips...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Slips</CardTitle>
        <CardDescription>Manage your employee salary slips.</CardDescription>
      </CardHeader>
      <CardContent>
        {salarySlips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No salary slips found</p>
            <Link href="/dashboard/salary-slips/new">
              <Button>Create your first salary slip</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalarySlips.map((salarySlip) => (
                <TableRow
                  key={salarySlip.id.toString()}
                  onClick={() => router.push(`/dashboard/salary-slips/${salarySlip.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{salarySlip.employee.name}</TableCell>
                  <TableCell>
                    {salarySlip.month} {salarySlip.year}
                  </TableCell>
                  <TableCell>{salarySlip.employee.position}</TableCell>
                  <TableCell>{salarySlip.employee.status}</TableCell>
                  <TableCell>{formatCurrency(salarySlip.totalSalary, "IDR")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salary-slips/${salarySlip.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salary-slips/${salarySlip.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salary-slips/${salarySlip.id}`} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

