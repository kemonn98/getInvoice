"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, FileText } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteEmployee } from "@/app/actions/employee"
import type { Employee } from "@/types"
import Link from "next/link"

interface EmployeeDetailViewProps {
  employee: Employee
}

export function EmployeeDetailView({ employee }: EmployeeDetailViewProps) {
  const router = useRouter()
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteEmployee(employee.id.toString())
      if (result.success) {
        router.push("/dashboard/employees")
        router.refresh()
      } else {
        setError(result.error || "Failed to delete employee")
        setShowDeleteAlert(false)
      }
    } catch (error) {
      console.error("Failed to delete employee:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatEmployeeStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULL_TIME":
        return "bg-green-100 text-green-800"
      case "PROBATION":
        return "bg-yellow-100 text-yellow-800"
      case "CONTRACT":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

      {/* Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(employee.status)}>
            {formatEmployeeStatus(employee.status)}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/salary-slips/new?employee=${employee.id}`}>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Create Salary Slip
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Employee Details */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p className="text-lg">{employee.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">National ID</h3>
                <p>{employee.nationalId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                <p>{employee.position}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p>{formatEmployeeStatus(employee.status)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{employee.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p className="whitespace-pre-line">{employee.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record. Note: You cannot delete an
              employee who has salary slips. Please delete all salary slips for this employee first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

