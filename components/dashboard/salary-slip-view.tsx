import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SalarySlip } from "@/types/salary"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

interface SalarySlipViewProps {
  salarySlip: SalarySlip
}

export function SalarySlipView({ salarySlip }: SalarySlipViewProps) {
  const formatEmployeeStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-8 md:flex-row md:justify-between">
        {/* Company Information */}
        <div className="flex items-start gap-4">
          {salarySlip.companyLogo && (
            <div className="w-16 h-16 relative">
              <Image
                src={salarySlip.companyLogo || "/placeholder.svg"}
                alt={`${salarySlip.companyName} logo`}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          )}
          <div>
            <h2 className="font-bold text-xl mb-2">{salarySlip.companyName}</h2>
            <div className="text-sm text-muted-foreground whitespace-pre-line">{salarySlip.companyAddress}</div>
          </div>
        </div>

        {/* Salary Slip Title */}
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight text-primary">SALARY SLIP</h2>
          <p className="text-xl font-medium mt-2">
            {salarySlip.month} {salarySlip.year}
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Date: {new Date(salarySlip.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Employee Information */}
      <div className="border-t pt-8">
        <h3 className="font-semibold mb-4">Employee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{salarySlip.employee.name}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">National ID:</span>
              <span>{salarySlip.employee.nationalId}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Position:</span>
              <span>{salarySlip.employee.position}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Status:</span>
              <span>{formatEmployeeStatus(salarySlip.employee.status)}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Address:</span>
              <span className="whitespace-pre-line">{salarySlip.employee.address}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-muted-foreground">Phone:</span>
              <span>{salarySlip.employee.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Components */}
      <div className="mt-8">
        <h3 className="font-semibold mb-4">Salary Components</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="text-right">Amount (IDR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Basic Salary</TableCell>
              <TableCell className="text-right">{formatCurrency(salarySlip.basicSalary, "IDR")}</TableCell>
            </TableRow>
            {salarySlip.positionAllowance > 0 && (
              <TableRow>
                <TableCell>Position Allowance</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.positionAllowance, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.familyAllowance > 0 && (
              <TableRow>
                <TableCell>Family Allowance</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.familyAllowance, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.childAllowance > 0 && (
              <TableRow>
                <TableCell>Child Allowance</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.childAllowance, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.foodAllowance > 0 && (
              <TableRow>
                <TableCell>Food Allowance</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.foodAllowance, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.bonus > 0 && (
              <TableRow>
                <TableCell>Bonus</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.bonus, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.thr > 0 && (
              <TableRow>
                <TableCell>THR</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.thr, "IDR")}</TableCell>
              </TableRow>
            )}
            {salarySlip.others > 0 && (
              <TableRow>
                <TableCell>Others</TableCell>
                <TableCell className="text-right">{formatCurrency(salarySlip.others, "IDR")}</TableCell>
              </TableRow>
            )}
            <TableRow className="font-bold">
              <TableCell>Total Salary</TableCell>
              <TableCell className="text-right">{formatCurrency(salarySlip.totalSalary, "IDR")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Signatures */}
      <div className="mt-16 grid grid-cols-2 gap-8">
        <div className="text-center">
          <p className="font-medium">Approved By:</p>
          <div className="h-16 my-4 border-b border-dashed"></div>
          <p>{salarySlip.approvedBy}</p>
          <p className="text-sm text-muted-foreground">{salarySlip.approvedPosition}</p>
        </div>
        <div className="text-center">
          <p className="font-medium">Received By:</p>
          <div className="h-16 my-4 border-b border-dashed"></div>
          <p>{salarySlip.employee.name}</p>
          <p className="text-sm text-muted-foreground">{salarySlip.employee.position}</p>
        </div>
      </div>

      {/* Notes */}
      {salarySlip.notes && (
        <div className="mt-8 border-t pt-4">
          <h3 className="font-medium mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{salarySlip.notes}</p>
        </div>
      )}
    </div>
  )
}

