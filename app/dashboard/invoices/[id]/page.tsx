import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { InvoiceDetailView } from "@/components/dashboard/invoice-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

async function getInvoice(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: id,
      userId: session.user.id
    },
    include: {
      items: true,
      client: true,
      user: true
    }
  })

  return invoice
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id)

  if (!invoice) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Invoice ${invoice.invoiceNumber}`}
        text="View and manage invoice details"
      />
      <div className="grid gap-8">
        <InvoiceDetailView invoice={invoice} />
      </div>
    </DashboardShell>
  )
}

