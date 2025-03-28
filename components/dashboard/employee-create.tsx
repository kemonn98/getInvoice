"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createEmployee } from "@/app/actions/employee"
import { EmployeeStatus } from "@/types/salary"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"

export function CreateEmployeeForm() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [employeeStatus, setEmployeeStatus] = useState<string>(EmployeeStatus.FULL_TIME)
  const [gender, setGender] = useState<string>("MALE")
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const [joinedDate, setJoinedDate] = useState<Date>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!session?.user?.id) {
      setError("You must be signed in to create an employee")
      return
    }

    try {
      setIsLoading(true)
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      // Add select fields explicitly
      formData.append('status', employeeStatus)
      formData.append('gender', gender)

      // Add date fields explicitly
      if (dateOfBirth) {
        formData.append('dateOfBirth', dateOfBirth.toISOString())
      }
      if (joinedDate) {
        formData.append('joinedDate', joinedDate.toISOString())
      }

      // Debug log
      console.log('Form data being sent:', Object.fromEntries(formData.entries()))

      const result = await createEmployee(formData)

      if (result.success && result.data) {
        router.push(`/dashboard/employees`)
        router.refresh()
      } else {
        setError(result.error || "Failed to create employee")
      }
    } catch (error) {
      console.error("Error creating employee:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error if not authenticated
  if (status === "unauthenticated") {
    router.replace("/login")
    return null
  }

  return (
    <>
      {/* Add overlay when form is submitting */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Creating employee...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
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
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National Identity Number*</Label>
                <Input id="nationalId" name="nationalId" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position*</Label>
                <Input id="position" name="position" required />
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
              <Input id="phone" name="phone" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address*</Label>
              <Textarea id="address" name="address" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" />
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
                <Input id="birthLocation" name="birthLocation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastEducation">Last Education</Label>
                <Input id="lastEducation" name="lastEducation" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Input id="religion" name="religion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Name</Label>
                <Input id="bank" name="bank" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankNumber">Bank Account Number</Label>
              <Input id="bankNumber" name="bankNumber" type="number" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/employees")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

