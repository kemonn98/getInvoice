import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditInvoiceForm } from "@/components/dashboard/invoice-edit"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

async function getInvoice(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: parseInt(id),
      userId: session.user.id
    },
    include: {
      items: true,
      client: true
    }
  })

  return invoice
}

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id)

  if (!invoice) {
    notFound()
  }

  // Convert the invoice data to match the expected types
  const formattedInvoice = {
    ...invoice,
    id: invoice.id.toString(), // Convert number to string
    items: invoice.items.map(item => ({
      ...item,
      id: item.id.toString() // Convert item ids to strings if needed
    }))
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Edit Invoice ${invoice.invoiceNo}`}
        text="Update invoice information and items"
      />
      <div className="grid gap-8">
        <EditInvoiceForm invoice={formattedInvoice} />
      </div>
    </DashboardShell>
  )
}

