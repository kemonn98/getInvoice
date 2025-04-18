"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { type Invoice as PrismaInvoice } from "@prisma/client" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getInvoices } from "@/app/actions/invoice"
import { InvoiceStatus as InvoiceStatusEnum } from "@/types"
import { formatCurrency } from "@/lib/utils"

// Update the interfaces to match Prisma's types
interface InvoiceItem {
  id: number
  description: string
  quantity: number
  price: number
  total: number
  invoiceId: number
}

interface Invoice extends Omit<PrismaInvoice, "items" | "client"> {
  id: number // Changed from string to number
  invoiceNo: string
  clientName: string
  date: Date // Changed from string | Date to Date
  dueDate: Date | null // Changed to match Prisma's type
  status: InvoiceStatusEnum
  total: number // Added to match Prisma
  items: InvoiceItem[]
  client: {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
  }
}

export function InvoiceList() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const fetchInvoices = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getInvoices()
          setInvoices(data as Invoice[])
        } catch (err) {
          console.error("Error fetching invoices:", err)
          if (err instanceof Error) {
            if (err.message.includes("Unauthorized")) {
              router.replace("/login")
            } else {
              setError(err.message)
            }
          } else {
            setError("Failed to load invoices")
          }
        } finally {
          setIsLoading(false)
        }
      }

      fetchInvoices()
    } else if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, session, router])

  const sortedInvoices = invoices

  const getStatusColor = (status: InvoiceStatusEnum) => {
    switch (status) {
      case InvoiceStatusEnum.PENDING:
        return "bg-yellow-800/20 text-yellow-200 hover:bg-yellow-800/30"
      case InvoiceStatusEnum.PAID:
        return "bg-green-800/20 text-green-200 hover:bg-green-800/30"
      case InvoiceStatusEnum.OVERDUE:
        return "bg-red-800/20 text-red-200 hover:bg-red-800/30"
      case InvoiceStatusEnum.CANCELLED:
        return "bg-gray-800/20 text-gray-200 hover:bg-gray-800/30"
      default:
        return "bg-gray-800/20 text-gray-200 hover:bg-gray-800/30"
    }
  }

  const calculateTotal = (invoice: Invoice) => {
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return invoice.total || 0
    }
    return invoice.items.reduce((sum, item) => sum + item.total, 0)
  }

  if (error) return <div>Error: {error}</div>

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Loading invoices...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Manage your recent invoices and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No invoices found</p>
            <Link href="/dashboard/invoices/new">
              <Button>Create your first invoice</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id.toString()}
                  onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>{formatCurrency(calculateTotal(invoice))}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

