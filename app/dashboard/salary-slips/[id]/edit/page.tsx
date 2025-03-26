import { notFound } from "next/navigation"
import { EditSalarySlipForm } from "@/components/dashboard/salary-slip-edit"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getSalarySlipById, getEmployees } from "@/app/actions/salary"

async function getSalarySlip(id: string) {
  const { salarySlip, error } = await getSalarySlipById(id)
  return salarySlip
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
        <EditSalarySlipForm salarySlip={salarySlip} employees={employees} />
      </div>
    </DashboardShell>
  )
}

