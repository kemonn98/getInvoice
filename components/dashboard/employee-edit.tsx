"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Employee, EmployeeStatus } from "@/types"
import { updateEmployee } from "@/app/actions/employee"

interface EditEmployeeFormProps {
  employee: Employee
}

export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employeeStatus, setEmployeeStatus] = useState<string>(employee.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      const result = await updateEmployee(employee.id.toString(), formData)

      if (result.success) {
        router.push("/dashboard/employees")
        router.refresh()
      } else {
        setError(result.error || "Failed to update employee")
      }
    } catch (error) {
      console.error("Error updating employee:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

      {/* Employee Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name*</Label>
              <Input id="name" name="name" defaultValue={employee.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National Identity Number*</Label>
              <Input id="nationalId" name="nationalId" defaultValue={employee.nationalId} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position*</Label>
              <Input id="position" name="position" defaultValue={employee.position} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Employment Status*</Label>
              <Select name="status" value={employeeStatus} onValueChange={setEmployeeStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EmployeeStatus.FULL_TIME}>Full Time</SelectItem>
                  <SelectItem value={EmployeeStatus.PROBATION}>Probation</SelectItem>
                  <SelectItem value={EmployeeStatus.CONTRACT}>Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number*</Label>
            <Input id="phone" name="phone" defaultValue={employee.phone} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address*</Label>
            <Textarea id="address" name="address" defaultValue={employee.address} required />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

