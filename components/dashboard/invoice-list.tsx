"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

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

// Add interfaces for type safety
interface InvoiceItem {
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  date: string | Date;
  dueDate: string | Date;
  status: string;
  amount?: number;
  items?: InvoiceItem[];
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
          setIsLoading(true);
          setError(null);
          const data = await getInvoices()
          setInvoices(data || [])
        } catch (err) {
          console.error('Error fetching invoices:', err);
          if (err instanceof Error) {
            if (err.message.includes("Unauthorized")) {
              router.replace('/login');
            } else {
              setError(err.message);
            }
          } else {
            setError('Failed to load invoices');
          }
        } finally {
          setIsLoading(false);
        }
      }

      fetchInvoices()
    } else if (status === "unauthenticated") {
      router.replace('/login')
    }
  }, [status, session, router])

  const sortedInvoices = invoices

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80"
      case "PAID":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "OVERDUE":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      case "CANCELLED":
        return "bg-slate-100 text-slate-800 hover:bg-slate-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  const calculateTotal = (invoice: Invoice) => {
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return invoice.amount || 0
    }
    const subtotal = invoice.items.reduce((sum: number, item: InvoiceItem) => 
      sum + (item.quantity * item.price), 0)
    const tax = subtotal * 0.1
    return subtotal + tax
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
                  key={invoice.id}
                  onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    ${invoice.items ? 
                      calculateTotal(invoice).toFixed(2) : 
                      invoice.amount.toFixed(2)
                    }
                  </TableCell>
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

