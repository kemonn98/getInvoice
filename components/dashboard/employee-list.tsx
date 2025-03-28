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
import { getEmployees, deleteEmployee } from "@/app/actions/salary"
import { type Employee, EmployeeStatus } from "@/types/employee"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export function EmployeeList() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const fetchEmployees = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getEmployees()
          setEmployees(data as Employee[])
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
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case EmployeeStatus.PROBATION:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case EmployeeStatus.CONTRACT:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleDelete = async (employee: Employee) => {
    try {
      const result = await deleteEmployee(employee.id.toString())
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete employee')
      }

      // Update the local state to remove the deleted employee
      setEmployees(prevEmployees => 
        prevEmployees.filter(emp => emp.id !== employee.id)
      )
      
      toast.success('Employee deleted successfully')
    } catch (error) {
      console.error('Error deleting employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete employee')
    } finally {
      setDeletingEmployee(null)
    }
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
    <>
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
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEmployees.map((employee) => (
                  <TableRow key={employee.id.toString()} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(employee.status)}>
                        {formatStatus(employee.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm">
                        {employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault()
                              setDeletingEmployee(employee)
                            }}
                            className="text-red-600"
                          >
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

      <AlertDialog 
        open={!!deletingEmployee} 
        onOpenChange={(open) => {
          if (!open) setDeletingEmployee(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingEmployee?.name}'s record. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEmployee && handleDelete(deletingEmployee)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

