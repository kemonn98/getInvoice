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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

interface EditEmployeeFormProps {
  employee: Employee
}

export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employeeStatus, setEmployeeStatus] = useState<string>(employee.status)
  const [gender, setGender] = useState<string>(employee.gender || "MALE")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined
  )
  const [joinedDate, setJoinedDate] = useState<Date | undefined>(
    employee.joinedDate ? new Date(employee.joinedDate) : undefined
  )
  const [isActive, setIsActive] = useState<boolean>(employee.active || true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      formData.append('active', isActive.toString())

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
              <Input id="name" name="name" defaultValue={employee.name || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National Identity Number*</Label>
              <Input id="nationalId" name="nationalId" defaultValue={employee.nationalId || ''} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position*</Label>
              <Input id="position" name="position" defaultValue={employee.position || ''} required />
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
            <Label htmlFor="active">Status</Label>
            <Select name="active" value={isActive ? "true" : "false"} onValueChange={(value) => setIsActive(value === "true")}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number*</Label>
            <Input id="phone" name="phone" defaultValue={employee.phone || ''} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address*</Label>
            <Textarea id="address" name="address" defaultValue={employee.address || ''} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={employee.email || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender*</Label>
              <Select name="gender" value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <DatePicker
                date={dateOfBirth}
                onDateChange={(date) => {
                  setDateOfBirth(date)
                }}
                label="Select birth date"
              />
              <Input 
                type="hidden" 
                name="dateOfBirth" 
                value={dateOfBirth?.toISOString() ?? ''} 
              />
            </div>
            <div className="space-y-2">
              <Label>Joined Date</Label>
              <DatePicker
                date={joinedDate}
                onDateChange={(date) => {
                  setJoinedDate(date)
                }}
                label="Select join date"
              />
              <Input 
                type="hidden" 
                name="joinedDate" 
                value={joinedDate?.toISOString() ?? ''} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthLocation">Birth Location</Label>
              <Input id="birthLocation" name="birthLocation" defaultValue={employee.birthLocation || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastEducation">Last Education</Label>
              <Input id="lastEducation" name="lastEducation" defaultValue={employee.lastEducation || ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="religion">Religion</Label>
              <Input id="religion" name="religion" defaultValue={employee.religion || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank">Bank Name</Label>
              <Input id="bank" name="bank" defaultValue={employee.bank || ''} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankNumber">Bank Account Number</Label>
            <Input id="bankNumber" name="bankNumber" type="number" defaultValue={employee.bankNumber || ''} />
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

