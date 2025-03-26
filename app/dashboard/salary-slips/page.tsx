import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { SalarySlipList } from "@/components/dashboard/salary-slip-list"
import { Loading } from "@/components/loading"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

// Mark the page as a Server Component
export const dynamic = "force-dynamic"

export default async function SalarySlipsPage() {
  // Add authentication check
  const session = await getServerSession()

  if (!session?.user) {
    // Redirect to login if user is not authenticated
    redirect("/login")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Salary Slips" text="Manage employee salary slips.">
        <Link href="/dashboard/salary-slips/new">
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Salary Slip
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<Loading />}>
          <SalarySlipList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

