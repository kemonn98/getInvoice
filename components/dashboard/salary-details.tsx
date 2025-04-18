"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Pencil, Printer, Trash2 } from "lucide-react"
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
import { deleteSalarySlip } from "@/app/actions/salary"
import { SalarySlipView } from "@/components/dashboard/salary-view"
import type { SalarySlip as PrismaSalarySlip, Employee as PrismaEmployee } from "@prisma/client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { SalarySlip } from "@/types/employee"

type SalarySlipWithEmployee = PrismaSalarySlip & {
  employee: PrismaEmployee
}

interface SalarySlipDetailViewProps {
  salarySlip: SalarySlipWithEmployee
}

export function SalarySlipDetailView({ salarySlip }: SalarySlipDetailViewProps) {
  const router = useRouter()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const result = await deleteSalarySlip(salarySlip.id.toString())
      if (result.success) {
        router.push("/dashboard/salary-slips")
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete salary slip:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteAlert(false)
    }
  }

  const handlePrint = () => {
    // Add print-specific styles before printing
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          margin: 0;
          padding: 0;
        }

        #salary-slip-container {
          zoom: 0.65;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `
    document.head.appendChild(style)

    window.print()

    // Clean up the style after printing
    document.head.removeChild(style)
  }

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)

      const salarySlipElement = document.getElementById("salary-slip-container")
      if (!salarySlipElement) return

      // Temporarily add a dark-mode class for PDF generation
      const originalClass = salarySlipElement.className
      salarySlipElement.className = `${originalClass} dark-mode`
      
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
        #salary-slip-container {
          background-color: hsl(0 0% 9%) !important;
        }
      `
      document.head.appendChild(style)

      const canvas = await html2canvas(salarySlipElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: 'hsl(0 0% 9%)',
      })

      // Clean up temporary styles
      document.head.removeChild(style)
      salarySlipElement.className = originalClass

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

      const fileName = `Salary-${salarySlip.employee.name}-${salarySlip.month}-${salarySlip.year}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Created on {format(new Date(salarySlip.createdAt || new Date()), "MMMM d, yyyy")}
          </span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/salary-slips/${salarySlip.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAlert(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Salary Slip View */}
      <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 print:p-0">
          <div id="salary-slip-container">
            <SalarySlipView salarySlip={salarySlip as unknown as SalarySlip} /> 
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this salary slip?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the salary slip and all its data.
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

