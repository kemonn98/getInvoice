import { CreateSalarySlipForm } from "@/components/dashboard/salary-slip-create"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getEmployees } from "@/app/actions/salary"
import { Employee } from "@/types"

export default async function CreateSalarySlipPage() {
  const employees = await getEmployees()

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Salary Slip" text="Create a new salary slip for your employee." />
      <div className="grid gap-10">
        <CreateSalarySlipForm employees={employees as Employee[]} />
      </div>
    </DashboardShell>
  )
}

