import { CreateEmployeeForm } from "@/components/dashboard/employee-create"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function CreateEmployeePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Add New Employee" text="Create a new employee record." />
      <div className="grid gap-10">
        <CreateEmployeeForm />
      </div>
    </DashboardShell>
  )
}

