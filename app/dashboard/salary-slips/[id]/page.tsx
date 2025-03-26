import { notFound } from "next/navigation"
import { SalarySlipDetailView } from "@/components/dashboard/salary-slip-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getSalarySlipById } from "@/app/actions/salary"

type PageParams = {
  params: {
    id: string
  }
}

export default async function SalarySlipPage({ params }: PageParams) {
  const { salarySlip, error } = await getSalarySlipById(params.id)

  if (!salarySlip) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Salary Slip - ${salarySlip.employee.name}`}
        text={`${salarySlip.month} ${salarySlip.year}`}
      />
      <div className="grid gap-8">
        <SalarySlipDetailView salarySlip={salarySlip} />
      </div>
    </DashboardShell>
  )
}

