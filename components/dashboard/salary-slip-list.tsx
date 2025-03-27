"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, MoreHorizontal, Pencil, Trash2, ChevronLeft, ChevronRight, Plus, Calendar, ArrowUpDown, ChevronDown, ChevronUp, Download } from "lucide-react"
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
import { getSalarySlips, deleteSalarySlip } from "@/app/actions/salary"
import type { SalarySlip } from "@/types/salary"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { EmployeeStatusBadge } from "@/components/ui/employee-status-badge"
import { cn } from "@/lib/utils"
import JSZip from 'jszip'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ReactDOM from 'react-dom/client'
import { SalarySlipView } from "@/components/dashboard/salary-slip-view"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

type SortField = 'name' | 'position' | 'status' | 'salary'
type SortOrder = 'asc' | 'desc'

export function SalarySlipList() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('salary')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deletingSlip, setDeletingSlip] = useState<SalarySlip | null>(null)
  const [downloadingMonth, setDownloadingMonth] = useState<string | null>(null)
  const [copyingMonth, setCopyingMonth] = useState<string | null>(null)

  useEffect(() => {
    if (status === "authenticated" && session) {
      const fetchSalarySlips = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getSalarySlips()
          setSalarySlips(data as SalarySlip[])
        } catch (err) {
          console.error("Error fetching salary slips:", err)
          if (err instanceof Error) {
            if (err.message.includes("Unauthorized")) {
              router.replace("/login")
            } else {
              setError(err.message)
            }
          } else {
            setError("Failed to load salary slips")
          }
        } finally {
          setIsLoading(false)
        }
      }

      fetchSalarySlips()
    } else if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, session, router])

  // Sort salary slips by date (newest first)
  const sortedSalarySlips = [...salarySlips].sort((a, b) => {
    // Sort by year first
    if (a.year !== b.year) return b.year - a.year

    // Then sort by month
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months.indexOf(b.month) - months.indexOf(a.month)
  })

  // Modify the available years logic
  const databaseYears = [...new Set(salarySlips.map(slip => slip.year))].sort((a, b) => b - a)
  const minYear = databaseYears.length > 0 ? Math.min(...databaseYears) : new Date().getFullYear()
  const maxYear = databaseYears.length > 0 ? Math.max(...databaseYears) : new Date().getFullYear()
  
  // Create array of years including ±1 year
  const availableYears = Array.from(
    { length: maxYear - minYear + 3 }, // +3 to include both min-1 and max+1
    (_, i) => minYear - 1 + i
  ).sort((a, b) => b - a)

  // Filter salary slips by selected year and group by month
  const filteredAndGroupedSlips = sortedSalarySlips
    .filter(slip => slip.year === selectedYear)
    .reduce((groups, slip) => {
      const month = slip.month
      if (!groups[month]) {
        groups[month] = []
      }
      groups[month].push(slip)
      return groups
    }, {} as Record<string, SalarySlip[]>)

  // Modify the year change handler to work with the new range
  const handleYearChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newYear = selectedYear - 1
      if (newYear >= minYear - 1) {
        setSelectedYear(newYear)
      }
    } else if (direction === 'next') {
      const newYear = selectedYear + 1
      if (newYear <= maxYear + 1) {
        setSelectedYear(newYear)
      }
    }
  }

  const copyLastMonthData = async (sourceSlips: SalarySlip[], targetMonth: string, targetYear: number) => {
    try {
      setCopyingMonth(targetMonth)
      const response = await fetch('/api/salary-slips/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceSlips: sourceSlips.map(slip => ({
            ...slip, // Include all original slip data
            month: targetMonth,
            year: targetYear,
            // Make sure we include the employee data
            employee: {
              id: slip.employee.id,
              name: slip.employee.name,
              position: slip.employee.position,
              status: slip.employee.status
            }
          })),
          targetMonth,
          targetYear,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create salary slips')
      }

      // Refresh the data
      const newData = await getSalarySlips()
      setSalarySlips(newData as SalarySlip[])
      toast.success(`Successfully copied salary slips to ${targetMonth}`)
    } catch (error) {
      console.error('Error copying salary slips:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to copy salary slips')
    } finally {
      setCopyingMonth(null)
    }
  }

  const sortSlips = (slips: SalarySlip[]) => {
    return [...slips].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1
      
      switch (sortField) {
        case 'name':
          return multiplier * a.employee.name.localeCompare(b.employee.name)
        case 'position':
          return multiplier * a.employee.position.localeCompare(b.employee.position)
        case 'status':
          return multiplier * a.employee.status.localeCompare(b.employee.status)
        case 'salary':
          return multiplier * (a.totalSalary - b.totalSalary)
        default:
          return 0
      }
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  function SortableHeader({ 
    field, 
    children 
  }: { 
    field: SortField
    children: React.ReactNode 
  }) {
    const isActive = sortField === field
    
    return (
      <button
        onClick={() => handleSort(field)}
        className={cn(
          "flex items-center gap-1 hover:text-primary transition-colors",
          isActive && "text-primary"
        )}
      >
        {children}
        {isActive ? (
          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
        )}
      </button>
    )
  }

  const generateMonthlySlipsZip = async (monthSlips: SalarySlip[], month: string, year: number) => {
    try {
      setDownloadingMonth(month)
      const zip = new JSZip()
      
      // Create a temporary container
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      // Set a fixed width to control the output size
      tempContainer.style.width = '900px' // Adjust this value as needed
      document.body.appendChild(tempContainer)

      // Generate PDF for each salary slip
      for (const slip of monthSlips) {
        const slipContainer = document.createElement('div')
        slipContainer.id = `temp-slip-${slip.id}`
        slipContainer.className = 'p-8'
        tempContainer.appendChild(slipContainer)

        const root = ReactDOM.createRoot(slipContainer)
        root.render(<SalarySlipView salarySlip={slip} />)

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100))

        const canvas = await html2canvas(slipContainer, {
          scale: 2, 
          useCORS: true,
          logging: false,
          imageTimeout: 0,
          backgroundColor: '#ffffff',
        })

        // Define margins in mm
        const margin = 15 // 15mm margins

        // A4 measurements
        const imgWidth = 210 - margin * 2 // A4 width minus margins
        const pageHeight = 297 - margin * 2 // A4 height minus margins

        // Calculate dimensions with margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create PDF with compression
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true
        })

        // Add the image with optimized settings
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.7), // Use JPEG instead of PNG, with 0.7 quality
          "JPEG",
          margin,
          margin,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        )

        // Add PDF to zip with compression
        const fileName = `Salary-${slip.employee.name}-${month}-${year}.pdf`
        const pdfBlob = pdf.output('blob')
        zip.file(fileName, pdfBlob, {
          compression: "DEFLATE",
          compressionOptions: {
            level: 6 // Compression level (1-9, 9 being highest)
          }
        })

        // Clean up
        root.unmount()
        slipContainer.remove()
      }

      // Clean up temporary container
      document.body.removeChild(tempContainer)

      // Generate and download zip file with compression
      const zipContent = await zip.generateAsync({ 
        type: 'blob',
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      })

      const zipUrl = window.URL.createObjectURL(zipContent)
      const a = document.createElement('a')
      a.href = zipUrl
      a.download = `salary-slips-${month}-${year}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(zipUrl)
      document.body.removeChild(a)

      toast.success(`Downloaded salary slips for ${month} ${year}`)
    } catch (error) {
      console.error('Error generating PDFs:', error)
      toast.error('Failed to generate PDFs')
    } finally {
      setDownloadingMonth(null)
    }
  }

  const handleDelete = async (salarySlip: SalarySlip) => {
    try {
      console.log('Attempting to delete salary slip:', salarySlip.id)
      
      const result = await deleteSalarySlip(salarySlip.id.toString())
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete salary slip')
      }

      // Update the local state to remove the deleted slip
      setSalarySlips(prevSlips => {
        console.log('Updating local state, removing slip:', salarySlip.id)
        return prevSlips.filter(slip => slip.id !== salarySlip.id)
      })
      
      toast.success('Salary slip deleted successfully')
    } catch (error) {
      console.error('Error deleting salary slip:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete salary slip')
    } finally {
      setDeletingSlip(null)
    }
  }

  if (error) return <div>Error: {error}</div>

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salary Slips</CardTitle>
          <CardDescription>Loading salary slips...</CardDescription>
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Salary Slips</CardTitle>
              <CardDescription>Manage your employee salary slips.</CardDescription>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Updated Year Navigation */}
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleYearChange('prev')}
                  disabled={selectedYear === minYear - 1}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[100px] text-center font-medium">
                  {selectedYear}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleYearChange('next')}
                  disabled={selectedYear === maxYear + 1}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {salarySlips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No salary slips found</p>
              <Link href="/dashboard/salary-slips/new">
                <Button>Create your first salary slip</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {MONTHS.map((month, index) => {
                const monthSlips = filteredAndGroupedSlips[month] || []
                const monthTotal = monthSlips.reduce((sum, slip) => sum + slip.totalSalary, 0)
                
                // Get previous month's data
                const prevMonthIndex = (index - 1 + 12) % 12
                const prevMonth = MONTHS[prevMonthIndex]
                const prevMonthSlips = filteredAndGroupedSlips[prevMonth] || []
                const canCopyFromPrevMonth = monthSlips.length === 0 && prevMonthSlips.length > 0
                
                return (
                  <div 
                    key={month} 
                    className="rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-semibold text-lg">{month}</h3>
                      <div className="flex gap-2">
                        {canCopyFromPrevMonth && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const sourceSlips = prevMonthSlips
                              const targetMonth = month
                              const targetYear = prevMonthIndex === 11 ? selectedYear - 1 : selectedYear
                              copyLastMonthData(sourceSlips, targetMonth, targetYear)
                            }}
                            className="flex items-center gap-1"
                            disabled={copyingMonth === month}
                          >
                            {copyingMonth === month ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                            {copyingMonth === month ? 'Copying...' : `Copy from ${prevMonth}`}
                          </Button>
                        )}
                        {monthSlips.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateMonthlySlipsZip(monthSlips, month, selectedYear)}
                            className="flex items-center gap-1"
                            disabled={downloadingMonth === month}
                          >
                            {downloadingMonth === month ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            {downloadingMonth === month ? 'Downloading...' : 'Download All'}
                          </Button>
                        )}
                        <Link href={`/dashboard/salary-slips/new?month=${month}&year=${selectedYear}`}>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Create
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {monthSlips.length > 0 ? (
                      <>
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b text-sm font-medium group">
                          <div className="col-span-4">
                            <SortableHeader field="name">Employee Name</SortableHeader>
                          </div>
                          <div className="col-span-3">
                            <SortableHeader field="position">Position</SortableHeader>
                          </div>
                          <div className="col-span-2">
                            <SortableHeader field="status">Status</SortableHeader>
                          </div>
                          <div className="col-span-3 text-right">
                            <SortableHeader field="salary">
                              <span className="text-primary font-medium">Salary</span>
                            </SortableHeader>
                          </div>
                        </div>

                        {/* Salary Slip Items - Update to use sorted slips */}
                        <div className="divide-y divide-border">
                          {sortSlips(monthSlips).map((salarySlip) => (
                            <div
                              key={salarySlip.id.toString()}
                              onClick={() => router.push(`/dashboard/salary-slips/${salarySlip.id}`)}
                              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted cursor-pointer items-center"
                            >
                              <div className="col-span-4 text-sm font-medium">
                                {salarySlip.employee.name}
                              </div>
                              <div className="col-span-3 text-sm text-muted-foreground">
                                {salarySlip.employee.position}
                              </div>
                              <div className="col-span-2 text-sm">
                                <EmployeeStatusBadge status={salarySlip.employee.status} />
                              </div>
                              <div className="col-span-3 flex items-center justify-end gap-2">
                                <span className="font-medium text-sm">
                                  {formatCurrency(salarySlip.totalSalary, "IDR")}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/salary-slips/${salarySlip.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>View</span>
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                      <Link href={`/dashboard/salary-slips/${salarySlip.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setDeletingSlip(salarySlip)
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Delete</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Month Total */}
                        <div className="border-t px-4 py-3 bg-muted/50">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-9 font-medium text-right"></div>
                            <div className="col-span-3 text-right font-semibold">
                            Total Salary: {formatCurrency(monthTotal, "IDR")}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Calendar className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No salary slips</p>
                        <p className="text-xs">Create one for {month} {selectedYear}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingSlip} onOpenChange={(open) => {
        console.log('Dialog state changing:', { open, deletingSlip })
        if (!open) setDeletingSlip(null)
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the salary slip for {deletingSlip?.employee.name} 
              ({deletingSlip?.month} {deletingSlip?.year}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log('Delete confirmation clicked for slip:', deletingSlip?.id)
                deletingSlip && handleDelete(deletingSlip)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

