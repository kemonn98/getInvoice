"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, FileText, Pencil, Printer, Share2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoice"
import { InvoiceView } from "@/components/dashboard/invoice-view"
import type { Invoice as PrismaInvoice, Client as PrismaClient, InvoiceItem as PrismaInvoiceItem, InvoiceItem, Client } from "@prisma/client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { Invoice } from "@/types/invoice"

type InvoiceWithRelations = PrismaInvoice & {
  client: PrismaClient
  items: PrismaInvoiceItem[]
}

interface InvoiceDetailViewProps {
  invoice: InvoiceWithRelations
}

export function InvoiceDetailView({ invoice }: InvoiceDetailViewProps) {
  const router = useRouter()
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleStatusChange = async (status: string) => {
    setIsUpdatingStatus(true)
    try {
      const result = await updateInvoiceStatus(invoice.id.toString(), status)
      if (result.success) {
        // Refresh the page to show updated status
        router.refresh()
      } else {
        console.error("Failed to update status:", result.error)
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteInvoice(invoice.id.toString())
      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)

      const invoiceElement = document.getElementById("invoice-container")
      if (!invoiceElement) return

      // Temporarily add a dark-mode class for PDF generation
      const originalClass = invoiceElement.className
      invoiceElement.className = `${originalClass} dark-mode`
      
      // Add temporary styles for PDF generation
      const style = document.createElement('style')
      style.textContent = `
        .dark-mode {
          border: 0 0% 14.9%;
          background-color: hsl(0 0% 9%) !important;
        }
        .dark-mode * {
          border: 0 0% 14.9%;
          background-color: hsl(0 0% 9%) !important;
        }
        #invoice-container {
          background-color: hsl(0 0% 9%) !important;
        }
      `
      document.head.appendChild(style)

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: 'hsl(0 0% 9%)',
      })

      // Clean up temporary styles
      document.head.removeChild(style)
      invoiceElement.className = originalClass

      // Create PDF with dark background
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      })

      // Fill entire page with dark background
      pdf.setFillColor(23, 23, 23) // RGB equivalent of hsl(0 0% 9%)
      pdf.rect(0, 0, 210, 297, 'F')

      const margin = 15
      const imgWidth = 210 - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        imgWidth,
        imgHeight,
      )

      const fileName = `${invoice.invoiceNo}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog or copy a link
    navigator.clipboard.writeText(window.location.href)
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-800/20 text-yellow-200 hover:bg-yellow-800/30"
      case "PAID":
        return "bg-green-800/20 text-green-200 hover:bg-green-800/30"
      case "OVERDUE":
        return "bg-red-800/20 text-red-200 hover:bg-red-800/30"
      case "CANCELLED":
        return "bg-gray-800/20 text-gray-200 hover:bg-gray-800/30"
      default:
        return "bg-gray-800/20 text-gray-200 hover:bg-gray-800/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${getStatusColor(invoice.status)} font-medium px-3 py-1.5`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange("PENDING")}>Mark as Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("PAID")}>Mark as Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("OVERDUE")}>Mark as Overdue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")}>Mark as Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/invoices/${invoice.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Invoice View */}
      <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 print:p-0">
          <div id="invoice-container">
            <InvoiceView invoice={invoice as Invoice} />
          </div>
        </div>
      </Card>

      {/* Invoice Timeline - Would be implemented in a real app */}
      <Card className="print:hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Invoice Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Invoice created</p>
                <p className="text-sm text-muted-foreground">{new Date(invoice.createdAt || new Date()).toLocaleString()}</p>
              </div>
            </div>
            {invoice.status !== "PAID" && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Share2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Invoice sent to client</p>
                  <p className="text-sm text-muted-foreground">{new Date(invoice.updatedAt || new Date()).toLocaleString()}</p>
                </div>
              </div>
            )}
            {invoice.status === "PAID" && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Payment received</p>
                  <p className="text-sm text-muted-foreground">{new Date(invoice.updatedAt || new Date()).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

