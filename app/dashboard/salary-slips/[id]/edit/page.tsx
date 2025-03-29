import { notFound } from "next/navigation"
import { EditSalarySlipForm } from "@/components/dashboard/salary-edit"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getSalarySlipById, getEmployees } from "@/app/actions/salary"
import { Employee } from "@/types"
import { SalarySlip } from "@/types/employee"
import type { SalarySlip as PrismaSalarySlip, Employee as PrismaEmployee } from "@prisma/client"

// Define the full types including relations
type SalarySlipWithEmployee = PrismaSalarySlip & {
  employee: PrismaEmployee
}

async function getSalarySlip(id: string): Promise<SalarySlipWithEmployee | null> {
  const { salarySlip, error } = await getSalarySlipById(id)
  return salarySlip as SalarySlipWithEmployee
}

export default async function EditSalarySlipPage({ params }: { params: { id: string } }) {
  const salarySlip = await getSalarySlip(params.id)
  const employees = await getEmployees()

  if (!salarySlip) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Edit Salary Slip - ${salarySlip.employee.name}`}
        text={`${salarySlip.month} ${salarySlip.year}`}
      />
      <div className="grid gap-8">
        <EditSalarySlipForm 
          salarySlip={salarySlip as SalarySlipWithEmployee} 
          employees={employees as Employee[]} 
        />
      </div>
    </DashboardShell>
  )
}

