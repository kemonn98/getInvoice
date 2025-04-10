import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EmployeeList } from "@/components/dashboard/employee-list"
import { Loading } from "@/components/loading"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, Download } from "lucide-react"
import { ExportButton } from "@/components/dashboard/csv-export"
import { ImportButton } from "@/components/dashboard/csv-import"

// Mark the page as a Server Component
export const dynamic = "force-dynamic"

export default async function EmployeesPage() {
  // Add authentication check
  const session = await getServerSession()

  if (!session?.user) {
    // Redirect to login if user is not authenticated
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Employees" text="Manage your employees.">
        <div className="flex items-center gap-4">
          <ImportButton />
          <ExportButton />
          <Link href="/dashboard/employees/new">
            <Button size="sm" className="bg-gray-100/10 text-white hover:bg-gray-100/20">
              <UserPlus className="mr-2 h-4 w-4" />
              New Employee
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<Loading />}>
          <EmployeeList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

