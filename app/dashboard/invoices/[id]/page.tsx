import { notFound } from "next/navigation"
import { getInvoiceById } from "@/app/actions/invoice"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { InvoiceDetailView } from "@/components/dashboard/invoice-details"

interface InvoicePageProps {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const result = await getInvoiceById(params.id)

  if (!result || result.error || !result.invoice) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Invoice Details"
        text="View and manage invoice details."
      />
      <InvoiceDetailView invoice={result.invoice} />
    </DashboardShell>
  )
}

