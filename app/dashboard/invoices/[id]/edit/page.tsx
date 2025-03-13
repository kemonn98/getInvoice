import { notFound } from "next/navigation"
import { getInvoiceById } from "@/app/actions/invoice"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EditInvoiceForm } from "@/components/dashboard/edit-invoice-form"

interface EditInvoicePageProps {
  params: {
    id: string
  }
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { invoice, error } = await getInvoiceById(params.id)

  if (error || !invoice) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Edit Invoice ${invoice.invoiceNumber}`} text="Update invoice details and items." />
      <div className="grid gap-8">
        <EditInvoiceForm invoice={invoice} />
      </div>
    </DashboardShell>
  )
}

