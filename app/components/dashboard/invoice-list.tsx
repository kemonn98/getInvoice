import { cn } from "@/lib/utils"
import Link from "next/link"

interface Invoice {
  id: string
  customer: string
  amount: number
  status: "paid" | "pending" | "unpaid"
  date: string
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="rounded-md border">
      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium">Invoice ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Issue Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Due Date</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Amount</th>
              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {invoices?.map((invoice) => (
              <Link key={invoice.id} href={`/invoice/${invoice.id}`} className="block">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer">
                  <td className="p-4 align-middle">{invoice.id}</td>
                  <td className="p-4 align-middle">{invoice.customer}</td>
                  <td className="p-4 align-middle">{formatDate(invoice.date)}</td>
                  <td className="p-4 align-middle">{formatDate(invoice.date)}</td>
                  <td className="p-4 align-middle">${invoice.amount}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold", {
                        "bg-green-100 text-green-700": invoice.status === "paid",
                        "bg-yellow-100 text-yellow-700": invoice.status === "pending",
                        "bg-red-100 text-red-700": invoice.status === "unpaid",
                      })}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

