"use client"

import { Button } from "@/components/ui/button"
import { Upload, Download, Loader2 } from "lucide-react"
import { importEmployeesFromCsv } from "@/app/actions/employee"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Add CSV template
const csvTemplate = `name,nationalId,position,status,address,phone,email,gender,dateOfBirth,birthLocation,joinedDate,lastEducation,religion,bank,bankNumber
John Doe,1234567890,Manager,FULL_TIME,"123 Main St, Suite 100",+62-123-4567-890,john@example.com,MALE,1990-01-01,New York,2024-01-01,Bachelor,Islam,BCA,1234567890
Jane Doe,0987654321,Designer,FULL_TIME,"456 Oak St, Unit 2",+62-098-7654-321,jane@example.com,FEMALE,1992-01-01,Chicago,2024-01-01,Master,Christian,BNI,0987654321`;

export function ImportButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }

    console.log("Selected file:", file.name)

    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast.error("Please select a CSV file")
      event.target.value = ''
      return
    }

    // Confirm overwrite
    if (!window.confirm(
      "This will:\n" +
      "- Update existing employees\n" +
      "- Add new employees\n" +
      
      "- Remove employees not in the CSV (only if they have no salary slips)\n\n" +
      "Do you want to continue?"
    )) {
      event.target.value = ''
      return
    }

    setIsLoading(true)

    try {
      console.log("Reading file...")
      const text = await file.text()
      
      // Log the first few lines of CSV for debugging
      console.log("CSV Preview:", text.split('\n').slice(0, 2))

      console.log("Importing data...")
      const result = await importEmployeesFromCsv(text)
      
      if (result.success) {
        toast.success("Employees imported successfully")
        // Add a small delay before refreshing
        setTimeout(() => {
          router.refresh()
          // Force a full page refresh as fallback
          window.location.reload()
        }, 1000)
      } else {
        toast.error(result.error || "Failed to import employees")
        console.error("Import error:", result.error)
      }
    } catch (error) {
      toast.error("Error importing CSV file")
      console.error("Import error:", error)
    } finally {
      setIsLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-dark-100/10 text-white hover:bg-gray-100/10"
        onClick={handleDownloadTemplate}
      >
        <Download className="mr-2 h-4 w-4" />
        Template
      </Button>
      <div>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-dark-100/10 text-white hover:bg-gray-100/10"
          onClick={() => {
            const fileInput = document.getElementById('csvInput') as HTMLInputElement
            if (fileInput) {
              fileInput.click()
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Importing...' : 'Import CSV'}
        </Button>
        <input
          id="csvInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleCsvImport}
          disabled={isLoading}
        />
      </div>
    </div>
  )
} 