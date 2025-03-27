import { CreateSalarySlipForm } from "@/components/dashboard/salary-slip-create"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getEmployees } from "@/app/actions/salary"
import type { Employee } from "@prisma/client"
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Explicitly mark the page as dynamic if you need to use headers
export const dynamic = 'force-dynamic'

async function SalarySlipContent() {
  const employees = await getEmployees()

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Salary Slip" text="Create a new salary slip for your employee." />
      <div className="grid gap-10">
        <CreateSalarySlipForm employees={employees} />
      </div>
    </DashboardShell>
  )
}

export default function SalarySlipPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SalarySlipContent />
    </Suspense>
  )
}

