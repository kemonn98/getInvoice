'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { MOCK_USER_ID } from "../lib/constants"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"

// Add this enum instead
enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

export async function getInvoices() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return [] // Return empty array instead of throwing error
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        client: true,
        items: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return invoices
  } catch (error) {
    console.error("Error in getInvoices:", error)
    return [] // Return empty array on error
  }
}

export async function createInvoice(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in"
      }
    }

    const userId = session.user.id
    const items = JSON.parse(formData.get("items") as string)

    // Generate invoice number
    const now = new Date()
    const invoiceNo = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(-4).toUpperCase()}`

    // Calculate total from items
    const total = items.reduce((sum: number, item: InvoiceItem) => {
      return sum + (Number(item.price) * Number(item.quantity))
    }, 0)

    // First, create the client with proper relation
    const client = await prisma.client.create({
      data: {
        name: formData.get("clientName") as string,
        email: null,
        phone: null,
        address: formData.get("clientAddress") as string,
        user: {
          connect: { id: userId }
        }
      }
    })

    // Then create the invoice
    const invoice = await prisma.invoice.create({
      data: {
        user: {
          connect: { id: userId }
        },
        client: {
          connect: { id: client.id }
        },
        invoiceNo,  // Use generated invoice number
        status: formData.get("status") as InvoiceStatus || "PENDING",
        total,      // Use calculated total
        date: new Date(formData.get("date") as string || now), // Use current date if not provided
        dueDate: new Date(formData.get("dueDate") as string),
        notes: formData.get("notes") as string || "",
        ourName: formData.get("ourName") as string,
        ourBusinessName: formData.get("ourBusinessName") as string,
        ourAddress: formData.get("ourAddress") as string,
        clientName: formData.get("clientName") as string,
        clientBusinessName: formData.get("clientBusinessName") as string || null,
        clientAddress: formData.get("clientAddress") as string,
        items: {
          create: items.map((item: InvoiceItem) => ({
            description: item.description,
            quantity: parseInt(item.quantity.toString()),
            price: parseFloat(item.price.toString()),
            total: parseInt(item.quantity.toString()) * parseFloat(item.price.toString())
          }))
        }
      },
      include: {
        items: true,
        user: true,
        client: true
      }
    })

    return {
      success: true,
      data: invoice
    }
  } catch (error) {
    console.error("Error in createInvoice:", error)
    return {
      
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invoice"
    }
  }
}

// Add this function to create a test client
async function ensureTestClient() {
  const testClient = await prisma.client.findFirst({
    where: { userId: MOCK_USER_ID }

  })

  if (!testClient) {
    return await prisma.client.create({
      data: {


        userId: MOCK_USER_ID,
        name: "Test Client",
        email: "client@example.com",
        phone: "123-456-7890",
        address: "123 Test St"
      }
    })
  }

  return testClient
}

// Update the getClients function
export async function getClients() {
  try {
    // Ensure at least one test client exists
    await ensureTestClient()

    const clients = await prisma.client.findMany({
      where: {
        userId: MOCK_USER_ID
      },
      orderBy: {
        name: 'asc'
      }
    })
    return clients
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return []
  }
}

export async function updateInvoice(id: string | number, formData: FormData) {
  try {
    const invoiceId = Number(id)
    const items = JSON.parse(formData.get("items") as string)

    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: invoiceId
      }
    })

    const itemsData = items.map((item: InvoiceItem) => ({
      invoiceId: invoiceId,
      description: item.description,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.quantity) * Number(item.price)
    }))

    const [updatedInvoice, createdItems] = await prisma.$transaction([
      prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          invoiceNo: formData.get("invoiceNo") as string,
          status: formData.get("status") as InvoiceStatus,
          date: new Date(formData.get("date") as string),
          dueDate: new Date(formData.get("dueDate") as string),
          notes: formData.get("notes") as string,
          ourName: formData.get("ourName") as string,
          ourBusinessName: formData.get("ourBusinessName") as string,
          ourAddress: formData.get("ourAddress") as string,
          clientName: formData.get("clientName") as string,
          clientBusinessName: formData.get("clientBusinessName") as string,
          clientAddress: formData.get("clientAddress") as string,
          total: Number(formData.get("total"))
        }
      }),
      prisma.invoiceItem.createMany({
        data: itemsData
      })
    ])

    revalidatePath("/dashboard/invoices")
    return { success: true }
  } catch (error) {
    console.error("Failed to update invoice:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

// Add deleteInvoice function
export async function deleteInvoice(id: string) {
  try {
    // Convert id to number
    const invoiceId = Number(id)
    
    // Delete all invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoiceId }  // Pass as number
    })

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId }  // Also update this to use number
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return { success: false, error: 'Failed to delete invoice' }
  }
}

// Add updateInvoiceStatus function
export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in"
      }
    }

    // Convert invoiceId to number
    const numericInvoiceId = Number(invoiceId)

    const invoice = await prisma.invoice.update({
      where: {
        id: numericInvoiceId,  // Use the converted number
        userId: session.user.id
      },
      data: {
        status: status as InvoiceStatus
      },
      include: {
        items: true,
        client: true,
        user: true
      }
    })

    return {
      success: true,
      data: invoice
    }
  } catch (error) {
    console.error("Error updating invoice status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice status"
    }
  }
}

// Add getInvoiceById function
export async function getInvoiceById(id: string) {
  try {
    // Convert id to number
    const numericId = Number(id)

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: numericId,  // Use the converted number
        userId: MOCK_USER_ID
      },
      include: {
        client: true,
        items: true
      }
    })

    if (!invoice) {
      return { invoice: null, error: 'Invoice not found' }
    }

    return { invoice, error: null }
  } catch (error) {
    console.error('Failed to fetch invoice:', error)
    return { invoice: null, error: 'Failed to fetch invoice' }
  }
}

// Add this interface above your functions
interface InvoiceItem {
  description: string
  quantity: number | string
  price: number | string
  total?: number
}

