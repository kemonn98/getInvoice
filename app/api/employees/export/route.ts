import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { format } from "date-fns"

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Fetch employees with their data
    const employees = await prisma.employee.findMany({
      where: {
        userId: session.user?.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Create CSV headers
    const headers = [
      "Name",
      "National ID",
      "Position",
      "Status",
      "Address",
      "Phone",
      "Email",
      "Gender",
      "Date of Birth",
      "Birth Location",
      "Joined Date",
      "Last Education",
      "Religion",
      "Bank",
      "Bank Account Number",
      "Created At",
      "Updated At"
    ]

    // Convert employee data to CSV rows
    const rows = employees.map((employee) => {
      const formatDate = (date: Date | null | undefined) => {
        return date ? format(new Date(date), 'yyyy-MM-dd') : ''
      }

      return [
        employee.name,
        employee.nationalId,
        employee.position,
        employee.status,
        employee.address,
        employee.phone,
        employee.email || '',
        employee.gender || '',
        formatDate(employee.dateOfBirth),
        employee.birthLocation || '',
        formatDate(employee.joinedDate),
        employee.lastEducation || '',
        employee.religion || '',
        employee.bank || '',
        employee.bankNumber?.toString() || '',
        formatDate(employee.createdAt),
        formatDate(employee.updatedAt)
      ].map(field => {
        // Escape fields containing commas by wrapping them in quotes
        if (field && field.includes(',')) {
          return `"${field.replace(/"/g, '""')}"`
        }
        return field
      })
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Create response with CSV content
    const response = new NextResponse("\ufeff" + csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="employees-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    })

    return response
  } catch (error) {
    console.error("Error exporting employees:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 