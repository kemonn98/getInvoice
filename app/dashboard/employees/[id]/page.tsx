import { notFound } from "next/navigation"
import { EmployeeDetailView } from "@/components/dashboard/employee-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getEmployeeById } from "@/app/actions/employee"
import type { Employee } from "@/types"

type PageParams = {
  params: {
    id: string
  }
}

export default async function EmployeePage({ params }: PageParams) {
  const { employee, error } = await getEmployeeById(params.id)

  if (!employee) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Employee - ${employee.name}`} text={`${employee.position}`} />
      <div className="grid gap-8">
        <EmployeeDetailView employee={employee as Employee} />
      </div>
    </DashboardShell>
  )
}

