import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { InvoiceDetailView } from "@/components/dashboard/invoice-details"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Invoice } from "@prisma/client"

async function getInvoice(id: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      items: true,
      client: true,
    },
  })

  return invoice
}

type PageParams = {
  params: {
    id: string
  }
}

export default async function InvoicePage({ params }: PageParams) {
  const invoice = await getInvoice(Number.parseInt(params.id))

  if (!invoice) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Invoice ${invoice.invoiceNo}`} text="View and manage invoice details" />
      <div className="grid gap-8">
        <InvoiceDetailView invoice={invoice} />
      </div>
    </DashboardShell>
  )
}

