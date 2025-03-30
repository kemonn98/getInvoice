import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Loading } from "@/components/loading"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { InvoiceList } from "@/components/dashboard/invoice-list"

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
      <DashboardHeader heading="Invoices" text="Manage your invoices.">
        <Link href="/dashboard/invoices/new">
          <Button size="sm" className="bg-gray-100/10 text-white hover:bg-gray-100/20">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4 md:gap-8">
        <Suspense fallback={<Loading />}>
          <InvoiceList />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

