"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import type { EmployeeStatus } from "@/types/employee"

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

// Get all salary slips for the current user
export async function getSalarySlips() {
  try {
    return await executeWithRetry(async () => {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return [] // Return empty array instead of throwing error
      }

      const salarySlips = await prisma.salarySlip.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          employee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return salarySlips
    })
  } catch (error) {
    console.error("Error in getSalarySlips:", error)
    throw error
  }
}

// Get a single salary slip by ID
export async function getSalarySlipById(id: string) {
  try {
    const numericId = Number(id)

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return { salarySlip: null, error: "Unauthorized: Please sign in" }
    }

    const salarySlip = await prisma.salarySlip.findUnique({
      where: {
        id: numericId,
        userId: session.user.id,
      },
      include: {
        employee: true,
      },
    })

    if (!salarySlip) {
      return { salarySlip: null, error: "Salary slip not found" }
    }

    return { salarySlip, error: null }
  } catch (error) {
    console.error("Failed to fetch salary slip:", error)
    return { salarySlip: null, error: "Failed to fetch salary slip" }
  }
}

// Get all employees for the current user
export async function getEmployees() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return []
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
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return []
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

    const employee = await prisma.employee.create({
      data: {
        userId: session.user.id,
        name: formData.get("name") as string,
        nationalId: formData.get("nationalId") as string,
        position: formData.get("position") as string,
        status: formData.get("status") as EmployeeStatus,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
      },
    })

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

// Create a new salary slip
export async function createSalarySlip(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    // Parse salary components
    const basicSalary = Number.parseFloat(formData.get("basicSalary") as string) || 0
    const positionAllowance = Number.parseFloat(formData.get("positionAllowance") as string) || 0
    const familyAllowance = Number.parseFloat(formData.get("familyAllowance") as string) || 0
    const childAllowance = Number.parseFloat(formData.get("childAllowance") as string) || 0
    const foodAllowance = Number.parseFloat(formData.get("foodAllowance") as string) || 0
    const bonus = Number.parseFloat(formData.get("bonus") as string) || 0
    const thr = Number.parseFloat(formData.get("thr") as string) || 0
    const others = Number.parseFloat(formData.get("others") as string) || 0

    // Calculate total
    const totalSalary =
      basicSalary + positionAllowance + familyAllowance + childAllowance + foodAllowance + bonus + thr + others

    // Get employee ID
    const employeeId = Number.parseInt(formData.get("employeeId") as string)

    // Create salary slip
    const salarySlip = await prisma.salarySlip.create({
      data: {
        userId: session.user.id,
        employeeId: employeeId,
        month: formData.get("month") as string,
        year: Number.parseInt(formData.get("year") as string),
        companyName: formData.get("companyName") as string,
        companyAddress: formData.get("companyAddress") as string,
        companyLogo: (formData.get("companyLogo") as string) || null,
        basicSalary,
        positionAllowance,
        familyAllowance,
        childAllowance,
        foodAllowance,
        bonus,
        thr,
        others,
        totalSalary,
        approvedBy: formData.get("approvedBy") as string,
        approvedPosition: formData.get("approvedPosition") as string,
        notes: (formData.get("notes") as string) || "",
      },
      include: {
        employee: true,
      },
    })

    return {
      success: true,
      data: salarySlip,
    }
  } catch (error) {
    console.error("Error in createSalarySlip:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create salary slip",
    }
  }
}

// Update a salary slip
export async function updateSalarySlip(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    const salarySlipId = Number(id)

    // Parse salary components
    const basicSalary = Number.parseFloat(formData.get("basicSalary") as string) || 0
    const positionAllowance = Number.parseFloat(formData.get("positionAllowance") as string) || 0
    const familyAllowance = Number.parseFloat(formData.get("familyAllowance") as string) || 0
    const childAllowance = Number.parseFloat(formData.get("childAllowance") as string) || 0
    const foodAllowance = Number.parseFloat(formData.get("foodAllowance") as string) || 0
    const bonus = Number.parseFloat(formData.get("bonus") as string) || 0
    const thr = Number.parseFloat(formData.get("thr") as string) || 0
    const others = Number.parseFloat(formData.get("others") as string) || 0

    // Calculate total
    const totalSalary =
      basicSalary + positionAllowance + familyAllowance + childAllowance + foodAllowance + bonus + thr + others

    // Update salary slip
    const salarySlip = await prisma.salarySlip.update({
      where: {
        id: salarySlipId,
        userId: session.user.id,
      },
      data: {
        month: formData.get("month") as string,
        year: Number.parseInt(formData.get("year") as string),
        companyName: formData.get("companyName") as string,
        companyAddress: formData.get("companyAddress") as string,
        companyLogo: (formData.get("companyLogo") as string) || null,
        basicSalary,
        positionAllowance,
        familyAllowance,
        childAllowance,
        foodAllowance,
        bonus,
        thr,
        others,
        totalSalary,
        approvedBy: formData.get("approvedBy") as string,
        approvedPosition: formData.get("approvedPosition") as string,
        notes: (formData.get("notes") as string) || "",
      },
    })

    revalidatePath("/dashboard/salary-slips")
    return { success: true }
  } catch (error) {
    console.error("Failed to update salary slip:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Delete a salary slip
export async function deleteSalarySlip(id: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      }
    }

    const salarySlipId = Number(id)

    await prisma.salarySlip.delete({
      where: {
        id: salarySlipId,
        userId: session.user.id,
      },
    })

    revalidatePath("/dashboard/salary-slips")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete salary slip:", error)
    return { success: false, error: "Failed to delete salary slip" }
  }
}

export async function deleteEmployee(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete the employee from your database
    await prisma.employee.delete({
      where: {
        id: parseInt(id),
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting employee:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete employee",
    }
  }
}

