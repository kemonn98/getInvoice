"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import type { EmployeeStatus } from "@/types/salary"

// Helper function for database retries
async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000
  let lastError

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      if (error.code !== "P1001" && error.code !== "P1002") {
        throw error
      }
      if (i < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (i + 1)))
      }
    }
  }
  throw lastError
}

// Get all employees for the current user
export async function getEmployees() {
  try {
    return await executeWithRetry(async () => {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return [] // Return empty array instead of throwing error
      }

      const employees = await prisma.employee.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          name: "asc",
        },
      })

      return employees
    })
  } catch (error) {
    console.error("Error in getEmployees:", error)
    return []
  }
}

// Get a single employee by ID
export async function getEmployeeById(id: string) {
  try {
    const numericId = Number(id)

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { employee: null, error: "Unauthorized: Please sign in" }
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: numericId,
        userId: session.user.id,
      },
    })

    if (!employee) {
      return { employee: null, error: "Employee not found" }
    }

    return { employee, error: null }
  } catch (error) {
    console.error("Failed to fetch employee:", error)
    return { employee: null, error: "Failed to fetch employee" }
  }
}

// Create a new employee
export async function createEmployee(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    const bankNumber = formData.get("bankNumber")
    const dateOfBirth = formData.get("dateOfBirth")
    const joinedDate = formData.get("joinedDate")

    const employee = await prisma.employee.create({
      data: {
        userId: session.user.id,
        name: formData.get("name") as string,
        nationalId: formData.get("nationalId") as string,
        position: formData.get("position") as string,
        status: formData.get("status") as EmployeeStatus,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string || null,
        gender: formData.get("gender") as "MALE" | "FEMALE" || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth as string) : null,
        birthLocation: formData.get("birthLocation") as string || null,
        joinedDate: joinedDate ? new Date(joinedDate as string) : null,
        lastEducation: formData.get("lastEducation") as string || null,
        religion: formData.get("religion") as string || null,
        bank: formData.get("bank") as string || null,
        bankNumber: bankNumber ? parseInt(bankNumber as string, 10) : null,
      },
    })

    revalidatePath("/dashboard/employees")
    return {
      success: true,
      data: employee,
    }
  } catch (error) {
    console.error("Error in createEmployee:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create employee",
    }
  }
}

// Update an employee
export async function updateEmployee(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    const employeeId = Number(id)

    const bankNumber = formData.get("bankNumber")
    const dateOfBirth = formData.get("dateOfBirth")
    const joinedDate = formData.get("joinedDate")

    const employee = await prisma.employee.update({
      where: {
        id: employeeId,
        userId: session.user.id,
      },
      data: {
        name: formData.get("name") as string,
        nationalId: formData.get("nationalId") as string,
        position: formData.get("position") as string,
        status: formData.get("status") as EmployeeStatus,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string || null,
        gender: formData.get("gender") as "MALE" | "FEMALE" || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth as string) : null,
        birthLocation: formData.get("birthLocation") as string || null,
        joinedDate: joinedDate ? new Date(joinedDate as string) : null,
        lastEducation: formData.get("lastEducation") as string || null,
        religion: formData.get("religion") as string || null,
        bank: formData.get("bank") as string || null,
        bankNumber: bankNumber ? parseInt(bankNumber as string, 10) : null,
      },
    })

    revalidatePath("/dashboard/employees")
    return { success: true }
  } catch (error) {
    console.error("Failed to update employee:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Delete an employee
export async function deleteEmployee(id: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    const employeeId = Number(id)

    // Check if employee has any salary slips
    const salarySlips = await prisma.salarySlip.findMany({
      where: {
        employeeId: employeeId,
        userId: session.user.id,
      },
    })

    if (salarySlips.length > 0) {
      return {
        success: false,
        error: "Cannot delete employee with existing salary slips. Please delete the salary slips first.",
      }
    }

    await prisma.employee.delete({
      where: {
        id: employeeId,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/employees")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete employee:", error)
    return { success: false, error: "Failed to delete employee" }
  }
}

