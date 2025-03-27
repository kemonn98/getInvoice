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
import { updateSalarySlip } from "@/app/actions/salary"
import type { SalarySlip as PrismaSalarySlip, Employee as PrismaEmployee } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

type SalarySlipWithEmployee = PrismaSalarySlip & {
  employee: PrismaEmployee
}

interface EditSalarySlipFormProps {
  salarySlip: SalarySlipWithEmployee
  employees: PrismaEmployee[]
}

export function EditSalarySlipForm({ salarySlip, employees }: EditSalarySlipFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [basicSalary, setBasicSalary] = useState<number>(salarySlip.basicSalary)
  const [positionAllowance, setPositionAllowance] = useState<number>(salarySlip.positionAllowance)
  const [familyAllowance, setFamilyAllowance] = useState<number>(salarySlip.familyAllowance)
  const [childAllowance, setChildAllowance] = useState<number>(salarySlip.childAllowance)
  const [foodAllowance, setFoodAllowance] = useState<number>(salarySlip.foodAllowance)
  const [bonus, setBonus] = useState<number>(salarySlip.bonus)
  const [thr, setThr] = useState<number>(salarySlip.thr)
  const [others, setOthers] = useState<number>(salarySlip.others)

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

  // Generate years for select (current year and 5 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i)

  // Calculate total salary
  const calculateTotal = () => {
    return basicSalary + positionAllowance + familyAllowance + childAllowance + foodAllowance + bonus + thr + others
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      const result = await updateSalarySlip(salarySlip.id.toString(), formData)

      if (result.success) {
        router.push(`/dashboard/salary-slips/${salarySlip.id}`)
        router.refresh()
      } else {
        setError(result.error || "Failed to update salary slip")
      }
    } catch (error) {
      console.error("Error updating salary slip:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              <Input id="companyName" name="companyName" defaultValue={salarySlip.companyName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Company Logo URL (Optional)</Label>
              <Input
                id="companyLogo"
                name="companyLogo"
                defaultValue={salarySlip.companyLogo || ""}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address*</Label>
            <Textarea id="companyAddress" name="companyAddress" defaultValue={salarySlip.companyAddress} required />
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
            <Select name="employeeId" defaultValue={salarySlip.employeeId.toString()}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month*</Label>
              <Select name="month" defaultValue={salarySlip.month}>
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
              <Select name="year" defaultValue={salarySlip.year.toString()}>
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
                placeholder="0"
                value={basicSalary || ''}
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
                value={positionAllowance || ''}
                onChange={(e) => setPositionAllowance(Number(e.target.value))}
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
                value={familyAllowance || ''}
                onChange={(e) => setFamilyAllowance(Number(e.target.value))}
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
                value={childAllowance || ''}
                onChange={(e) => setChildAllowance(Number(e.target.value))}
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
                placeholder="0"
                value={foodAllowance || ''}
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
                value={bonus || ''}
                onChange={(e) => setBonus(Number(e.target.value))}
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
                value={thr || ''}
                onChange={(e) => setThr(Number(e.target.value))}
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
                value={others || ''}
                onChange={(e) => setOthers(Number(e.target.value))}
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
              <Input id="approvedBy" name="approvedBy" defaultValue={salarySlip.approvedBy} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approvedPosition">Position*</Label>
              <Input
                id="approvedPosition"
                name="approvedPosition"
                defaultValue={salarySlip.approvedPosition}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={salarySlip.notes || ""}
              placeholder="Enter any additional notes..."
              className="min-h-[100px]"
            />
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

