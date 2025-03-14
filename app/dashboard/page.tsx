import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Loading } from "@/components/loading"

// Mark the page as a Server Component
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard" 
        text="Manage your invoices and track payments." 
      />
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<Loading />}>
          <DashboardStats />
        </Suspense>
        <Suspense fallback={<Loading />}>
          <InvoiceList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

// You can call this once to create a test client
// await createTestClient()

