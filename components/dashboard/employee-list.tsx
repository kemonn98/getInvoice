"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { getEmployees } from "@/app/actions/salary"
import { type Employee, EmployeeStatus } from "@/types/employee"
import { toast } from "sonner"

export function EmployeeList() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const fetchEmployees = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getEmployees()
          setEmployees(data as unknown as Employee[])
        } catch (err) {
          console.error("Error fetching employees:", err)
          if (err instanceof Error) {
            if (err.message.includes("Unauthorized")) {
              router.replace("/login")
            } else {
              setError(err.message)
            }
          } else {
            setError("Failed to load employees")
          }
        } finally {
          setIsLoading(false)
        }
      }

      fetchEmployees()
    } else if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, session, router])

  // Sort employees by name
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name))

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.FULL_TIME:
        return "bg-green-800/20 text-green-200 hover:bg-green-800/30"
      case EmployeeStatus.PROBATION:
        return "bg-yellow-800/20 text-yellow-200 hover:bg-yellow-800/30"
      case EmployeeStatus.CONTRACT:
        return "bg-blue-800/20 text-blue-200 hover:bg-blue-800/30"
      default:
        return "bg-gray-800/20 text-gray-200 hover:bg-gray-800/30"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (error) return <div>Error: {error}</div>

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Loading employees...</CardDescription>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Employees</CardTitle>
          <CardDescription>Manage your employees and their information.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No employees found</p>
            <Link href="/dashboard/employees/new">
              <Button>Add your first employee</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((employee) => (
                <TableRow 
                  key={employee.id.toString()} 
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                >
                  <TableCell className="font-medium">
                    {employee.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(employee.status)}>
                      {formatStatus(employee.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.email || 'Not specified'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md bg-gray-100/10 text-white text-xs"> 
                      {employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1).toLowerCase() || 'Not specified'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={employee.active 
                        ? "bg-green-800/20 text-green-200" 
                        : "bg-red-800/20 text-red-200"
                      }
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
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
                          <Link href={`/dashboard/employees/${employee.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salary-slips/new?employee=${employee.id}`}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            <span>Create Salary Slip</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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

