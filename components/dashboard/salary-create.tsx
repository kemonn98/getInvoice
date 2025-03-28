"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createSalarySlip } from "@/app/actions/salary"
import type { Employee } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

interface CreateSalarySlipFormProps {
  employees: Employee[]
}

export function CreateSalarySlipForm({ employees }: CreateSalarySlipFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  // Form state
  const [basicSalary, setBasicSalary] = useState<number>(3000000)
  const [positionAllowance, setPositionAllowance] = useState<number | null>(null)
  const [familyAllowance, setFamilyAllowance] = useState<number | null>(null)
  const [childAllowance, setChildAllowance] = useState<number | null>(null)
  const [foodAllowance, setFoodAllowance] = useState<number>(300000)
  const [bonus, setBonus] = useState<number | null>(null)
  const [thr, setThr] = useState<number | null>(null)
  const [others, setOthers] = useState<number | null>(null)

  // Generate months for select
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

  // Generate years for select (5 years back and 1 year ahead)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 1 - i)

  // Get current month and year
  const currentMonth = new Date().toLocaleString("default", { month: "long" })

  // Get month and year from URL parameters
  const monthParam = searchParams.get('month')
  const yearParam = searchParams.get('year')

  // Calculate total salary
  const calculateTotal = () => {
    return (basicSalary || 0) + 
    (positionAllowance || 0) + 
    (familyAllowance || 0) + 
    (childAllowance || 0) + 
    (foodAllowance || 0) + 
    (bonus || 0) + 
    (thr || 0) + 
    (others || 0)
}

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
    
    // Validate month parameter
    if (monthParam && months.includes(monthParam)) {
      // Update the month select default value
      const monthSelect = document.querySelector('select[name="month"]') as HTMLSelectElement
      if (monthSelect) {
        monthSelect.value = monthParam
      }
    }

    // Validate year parameter
    if (yearParam) {
      const yearNum = parseInt(yearParam)
      if (!isNaN(yearNum) && yearNum >= currentYear - 5 && yearNum <= currentYear + 1) {
        // Update the year select default value
        const yearSelect = document.querySelector('select[name="year"]') as HTMLSelectElement
        if (yearSelect) {
          yearSelect.value = yearParam
        }
      }
    }
  }, [status, router, monthParam, yearParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!session?.user?.id) {
      setError("You must be signed in to create a salary slip")
      return
    }

    if (!selectedEmployee) {
      setError("Please select an employee")
      return
    }

    try {
      setIsLoading(true)
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      const result = await createSalarySlip(formData)

      if (result.success && result.data) {
        router.push(`/dashboard/salary-slips/${result.data.id}`)
        router.refresh()
      } else {
        setError(result.error || "Failed to create salary slip")
      }
    } catch (error) {
      console.error("Error creating salary slip:", error)
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
    return null // useEffect will handle redirect
  }

  return (
    <>
      {/* Add overlay when form is submitting */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Creating salary slip...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 ${isLoading ? "opacity-50 pointer-events-none" : ""}`}>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">{error}</div>}

        {/* Company Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name*</Label>
                <Input id="companyName" name="companyName" required value="PT. SLABPIXEL CRETIVE GROUP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyLogo">Company Logo URL (Optional)</Label>
                <Input id="companyLogo" name="companyLogo" placeholder="https://example.com/logo.png" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address*</Label>
              <Textarea id="companyAddress" name="companyAddress" required value="Jl. Raya Tajem No.A09, RT.05/RW.27, Kenayan, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584" />
            </div>
          </CardContent>
        </Card>

        {/* Employee Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee*</Label>
              <Select name="employeeId" value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {employees.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">No employees found. Please add an employee first.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month*</Label>
                <Select name="month" defaultValue={monthParam || currentMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year*</Label>
                <Select name="year" defaultValue={yearParam || currentYear.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Components Card */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Components</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="basicSalary">Basic Salary (IDR)*</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Base monthly salary before allowances and deductions</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="basicSalary"
                name="basicSalary"
                type="number"
                min="0"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="positionAllowance">Position Allowance (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Additional compensation based on employee's position</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="positionAllowance"
                name="positionAllowance"
                type="number"
                min="0"
                placeholder="0"
                value={positionAllowance === null ? '' : positionAllowance}
                onChange={(e) => setPositionAllowance(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="familyAllowance">Family Allowance (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Additional allowance for married employees</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="familyAllowance"
                name="familyAllowance"
                type="number"
                min="0"
                placeholder="0"
                value={familyAllowance === null ? '' : familyAllowance}
                onChange={(e) => setFamilyAllowance(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="childAllowance">Child Allowance (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Additional allowance for employees with children</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="childAllowance"
                name="childAllowance"
                type="number"
                min="0"
                placeholder="0"
                value={childAllowance === null ? '' : childAllowance}
                onChange={(e) => setChildAllowance(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="foodAllowance">Food Allowance (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Monthly allowance for meals and nutrition</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="foodAllowance"
                name="foodAllowance"
                type="number"
                min="0"
                value={foodAllowance}
                onChange={(e) => setFoodAllowance(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="bonus">Bonus (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Additional performance-based or special occasion bonus</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="bonus"
                name="bonus"
                type="number"
                min="0"
                placeholder="0"
                value={bonus === null ? '' : bonus}
                onChange={(e) => setBonus(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="thr">THR (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Tunjangan Hari Raya - Religious holiday allowance</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="thr"
                name="thr"
                type="number"
                min="0"
                placeholder="0"
                value={thr === null ? '' : thr}
                onChange={(e) => setThr(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="others">Others (IDR)</Label>
            </div>
            <div className="col-span-6 space-y-2">
              <Label className="text-sm text-muted-foreground">Additional miscellaneous payments or allowances</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <Input
                id="others"
                name="others"
                type="number"
                min="0"
                placeholder="0"
                value={others === null ? '' : others}
                onChange={(e) => setOthers(e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between font-medium text-lg">
              <span>Total Salary:</span>
              <span>{formatCurrency(calculateTotal(), "IDR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Approval Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Approval Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approvedBy">Approved By*</Label>
                <Input id="approvedBy" name="approvedBy" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvedPosition">Position*</Label>
                <Input id="approvedPosition" name="approvedPosition" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" placeholder="Enter any additional notes..." className="min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/salary-slips")}
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
                "Create Salary Slip"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

