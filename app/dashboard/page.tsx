import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { InvoiceList } from "@/components/dashboard/invoice-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Manage your invoices and track payments." />
      <div className="grid gap-4 md:gap-8">
        <DashboardStats />
        <InvoiceList />
      </div>
    </DashboardShell>
  )
}

// You can call this once to create a test client
// await createTestClient()

