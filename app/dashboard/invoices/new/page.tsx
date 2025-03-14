import { CreateInvoiceForm } from "@/components/dashboard/invoice-create"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export default function NewInvoicePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Create Invoice" text="Create a new invoice for your client." />
      <div className="grid gap-8">
        <CreateInvoiceForm />
      </div>
    </DashboardShell>
  )
}

