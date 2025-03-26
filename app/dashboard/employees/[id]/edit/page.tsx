import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import { notFound } from "next/navigation"
import { EditEmployeeForm } from "@/components/dashboard/employee-edit"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import prisma from "@/lib/prisma"

async function getEmployee(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const employee = await prisma.employee.findUnique({
    where: {
      id: Number.parseInt(id),
      userId: session.user.id,
    },
  })

  return employee
}

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const employee = await getEmployee(params.id)

  if (!employee) {
    notFound()
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Edit Employee - ${employee.name}`} text="Update employee information." />
      <div className="grid gap-8">
        <EditEmployeeForm employee={employee} />
      </div>
    </DashboardShell>
  )
}

