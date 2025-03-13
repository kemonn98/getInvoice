"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Pencil, Printer, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteInvoice, updateInvoiceStatus } from "@/app/actions/invoice"
import { InvoicePDF } from "@/components/dashboard/invoice-pdf"

interface InvoiceDetailsProps {
  invoice: any
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true)
    await updateInvoiceStatus(invoice.id, status)
    setIsUpdatingStatus(false)
  }

  const handleDelete = async () => {
    await deleteInvoice(invoice.id)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    // In a real app, this would generate and download a PDF
    // For demo purposes, we'll just simulate a delay
    setTimeout(() => {
      setIsGeneratingPDF(false)
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-800/20"
      case "PAID":
        return "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-800/20"
      case "OVERDUE":
        return "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-800/20"
      case "CANCELLED":
        return "bg-slate-100 text-slate-800 hover:bg-slate-100/80 border-slate-800/20"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80 border-gray-800/20"
    }
  }

  return (
    <div className="space-y-6 print:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(invoice.status)} font-medium px-3 py-1.5 text-sm`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
          </Badge>
          {invoice.status !== "paid" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-4" disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {invoice.status !== "draft" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("draft")}>Mark as Draft</DropdownMenuItem>
                )}
                {invoice.status !== "sent" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("sent")}>Mark as Sent</DropdownMenuItem>
                )}
                {invoice.status !== "paid" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("paid")}>Mark as Paid</DropdownMenuItem>
                )}
                {invoice.status !== "overdue" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("overdue")}>Mark as Overdue</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-9 px-4" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="h-9 px-4" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" className="h-9 px-4" onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="h-9 px-4">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this invoice?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the invoice and remove it from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="print:block" id="invoice-content">
        <InvoicePDF invoice={invoice} />
      </div>
    </div>
  )
}

