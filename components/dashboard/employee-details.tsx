"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, FileText, Copy } from "lucide-react"
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
import { toast } from "sonner"

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`Copied ${label} to clipboard`)
      },
      (err) => {
        console.error('Failed to copy text: ', err)
        toast.error('Failed to copy to clipboard')
      }
    )
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
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Full Name</div>
              <div 
                className="col-span-2 font-medium group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(employee.name, 'name')}
              >
                {employee.name}
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Position</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(employee.position, 'position')}
              >
                {employee.position}
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Employment Status</div>
              <div className="col-span-2">
                <Badge variant="outline" className={getStatusColor(employee.status)}>
                  {formatEmployeeStatus(employee.status)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">National ID</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(employee.nationalId, 'National ID')}
              >
                {employee.nationalId}
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Gender</div>
              <div className="col-span-2">
                {employee.gender 
                  ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1).toLowerCase() 
                  : 'Not specified'}
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Date of Birth</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(
                  employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not specified',
                  'date of birth'
                )}
              >
                {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not specified'}
                {employee.dateOfBirth && <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Joined Date</div>
              <div className="col-span-2">
                {employee.joinedDate ? new Date(employee.joinedDate).toLocaleDateString() : 'Not specified'}
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Religion</div>
              <div className="col-span-2">{employee.religion || 'Not specified'}</div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Email</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(employee.email || '', 'email')}
              >
                {employee.email || 'Not specified'}
                {employee.email && <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Phone</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(employee.phone, 'phone number')}
              >
                {employee.phone}
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Bank Account</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary"
                onClick={() => copyToClipboard(
                  employee.bank && employee.bankNumber 
                    ? `${employee.bank} - ${employee.bankNumber.toString()}`
                    : employee.bank 
                    ? employee.bank 
                    : 'Not specified',
                  'bank account'
                )}
              >
                {employee.bank && employee.bankNumber 
                  ? `${employee.bank} - ${employee.bankNumber.toString()}`
                  : employee.bank 
                  ? employee.bank 
                  : 'Not specified'}
                {(employee.bank || employee.bankNumber) && 
                  <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              </div>
            </div>

            <div className="grid grid-cols-3 py-3">
              <div className="text-sm text-muted-foreground">Address</div>
              <div 
                className="col-span-2 group flex items-center gap-2 cursor-pointer hover:text-primary whitespace-pre-line"
                onClick={() => copyToClipboard(employee.address, 'address')}
              >
                {employee.address}
                <Copy className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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


