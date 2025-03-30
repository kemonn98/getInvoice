"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"
import type { EmployeeStatus } from "@/types/employee"
import { Prisma } from "@prisma/client"

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

// Helper function to validate CSV data
function validateEmployeeData(data: any): boolean {
  console.log("Validating data object:", data); // Debug log to see the actual data structure

  const requiredFields = ['name', 'nationalid', 'position', 'status', 'address', 'phone'];
  
  // First check if the data structure looks valid
  if (!data || typeof data !== 'object') {
    console.log('Invalid data structure:', data);
    return false;
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      console.log(`Missing or empty required field: ${field}, value:`, data[field]);
      return false;
    }
  }

  // Validate status
  const status = data.status?.toUpperCase();
  if (!['FULL_TIME', 'PROBATION', 'CONTRACT'].includes(status)) {
    console.log(`Invalid status: ${status}`);
    return false;
  }

  return true;
}

// Helper function to parse date strings
function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    // Remove any trailing \r if present
    dateStr = dateStr.replace(/\r$/, '');
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log(`Invalid date: ${dateStr}`);
      return null;
    }
    return date;
  } catch (error) {
    console.log(`Error parsing date: ${dateStr}`, error);
    return null;
  }
}

// Helper function to sanitize string input
function sanitizeString(str: string | null): string | null {
  if (!str) return null;
  // Remove any non-ASCII characters and trim
  return str
    .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII characters
    .trim();
}

// Add type definition for the employee data
type EmployeeCreateInput = {
  userId: string
  name: string
  nationalId: string
  position: string 
  status: EmployeeStatus
  address: string
  phone: string 
  email?: string | null
  gender?: "MALE" | "FEMALE" | null
  dateOfBirth?: Date | null
  birthLocation?: string | null
  joinedDate?: Date | null
  lastEducation?: string | null
  religion?: string | null
  bank?: string | null
  bankNumber?: number | null
}

// Define the type for employee data
type EmployeeData = Prisma.EmployeeCreateInput; // or use Omit to exclude fields if necessary

// Import employees from CSV
export async function importEmployeesFromCsv(csvData: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in",
      };
    }

    // Get existing employees with their salary slips
    const existingEmployees = await prisma.employee.findMany({
      where: { userId: session.user.id },
      include: { salarySlips: true }
    });

    // Create a map of nationalId to existing employee data
    const existingEmployeeMap = new Map(
      existingEmployees.map(emp => [emp.nationalId, emp])
    );

    // Split CSV into rows and filter out empty rows
    const rows = csvData
      .split(/\r?\n/)
      .map(row => row.trim())
      .filter(row => row.length > 0);
    
    // Get headers and normalize them
    const headers = rows[0]
      .toLowerCase()
      .split(',')
      .map(header => header.trim());
    
    // Parse data rows
    const employeeData = rows.slice(1).map((row, index) => {
      try {
        // Handle quoted fields properly
        const values = row.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|[^,]*)/g)
          ?.map(value => {
            value = value.replace(/^,/, '');
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1).replace(/""/g, '"');
            }
            return value.trim();
          }) || [];

        // Create object with lowercase keys first
        const rawData = headers.reduce((obj, header, i) => {
          obj[header] = values[i] || null;
          return obj;
        }, {} as any);

        // Validate the raw data
        if (!validateEmployeeData(rawData)) {
          throw new Error(`Invalid data in row ${index + 2}`);
        }

        // Transform to proper database format with sanitization
        return {
          name: sanitizeString(rawData.name),
          nationalId: sanitizeString(rawData.nationalid),
          position: sanitizeString(rawData.position),
          status: rawData.status.toUpperCase(),
          address: sanitizeString(rawData.address),
          phone: sanitizeString(rawData.phone),
          email: sanitizeString(rawData.email),
          gender: rawData.gender?.toUpperCase() || null,
          dateOfBirth: rawData.dateofbirth ? new Date(rawData.dateofbirth) : null,
          birthLocation: sanitizeString(rawData.birthlocation),
          joinedDate: rawData.joineddate ? new Date(rawData.joineddate) : null,
          lastEducation: sanitizeString(rawData.lasteducation),
          religion: sanitizeString(rawData.religion),
          bank: sanitizeString(rawData.bank),
          bankNumber: rawData.banknumber ? 
            (() => {
              const cleaned = rawData.banknumber.replace(/[^\d]/g, '');
              const num = parseInt(cleaned, 10);
              // Check if the number is within safe integer bounds
              if (isNaN(num) || num > Number.MAX_SAFE_INTEGER) {
                console.warn(`Bank number ${cleaned} is too large, truncating`);
                return null;
              }
              return num;
            })() : null
        };
      } catch (error) {
        console.error(`Error parsing row ${index + 2}:`
          , error);
        throw error;
      }
      
    });

    // Log the first entry to verify the data types
    console.log("First employee data:", JSON.stringify(employeeData[0]));

    // Begin transaction with a longer timeout
    const batchSize = 10; // Adjust batch size as needed
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < employeeData.length; i += batchSize) {
        const batch = employeeData.slice(i, i + batchSize);
        await Promise.all(
          batch.map(data => {
            const existingEmployee = existingEmployeeMap.get(data.nationalId || "");
            if (existingEmployee) {
              // Update existing employee
              return tx.employee.update({
                where: { id: existingEmployee.id },
                data: {
                  ...data,
                  userId: session?.user?.id || "",
                }
              });
            } else {
              // Create new employee
              return tx.employee.create({
                data: {
                  ...data,
                  userId: session?.user?.id || "",
                }
              });
            }
          })
        );
      }
    }, {
      timeout: 60000, // Increase timeout to 60 seconds
      maxWait: 65000, // Maximum time to wait for transaction to start
    });

    revalidatePath("/dashboard/employees");
    return { 
      success: true,
      message: `Successfully imported ${employeeData.length} employees`
    };
  } catch (error) {
    console.error("Detailed error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import employees",
    };
  }
}

