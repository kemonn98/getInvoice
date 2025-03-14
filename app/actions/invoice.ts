'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { MOCK_USER_ID } from "../lib/constants"
import { InvoiceStatus } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/auth"

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
        invoiceNumber: formData.get("invoiceNumber") as string,
        status: formData.get("status") as string,
        amount: parseFloat(formData.get("amount") as string),
        issueDate: new Date(formData.get("issueDate") as string),
        dueDate: new Date(formData.get("dueDate") as string),
        notes: formData.get("notes") as string || "",
        ourName: formData.get("ourName") as string,
        ourBusinessName: formData.get("ourBusinessName") as string,
        ourAddress: formData.get("ourAddress") as string,
        clientName: formData.get("clientName") as string,
        clientBusinessName: formData.get("clientBusinessName") as string || null,
        clientAddress: formData.get("clientAddress") as string,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.price)
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

export async function updateInvoice(invoiceId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Please sign in"
      }
    }

    // Parse items from formData
    const items = JSON.parse(formData.get("items") as string)

    // First, delete existing items
    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: invoiceId
      }
    })

    // Then update the invoice with new items
    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: session.user.id
      },
      data: {
        invoiceNumber: formData.get("invoiceNumber") as string,
        status: formData.get("status") as string,
        amount: parseFloat(formData.get("amount") as string),
        dueDate: new Date(formData.get("dueDate") as string),
        notes: formData.get("notes") as string || "",
        ourName: formData.get("ourName") as string,
        ourBusinessName: formData.get("ourBusinessName") as string,
        ourAddress: formData.get("ourAddress") as string,
        clientName: formData.get("clientName") as string,
        clientBusinessName: formData.get("clientBusinessName") as string || null,
        clientAddress: formData.get("clientAddress") as string,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          }))
        }
      },
      include: {
        items: true,
        client: true
      }
    })

    return {
      success: true,
      data: invoice
    }
  } catch (error) {
    console.error("Error updating invoice:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update invoice"
    }
  }
}

// Add deleteInvoice function
export async function deleteInvoice(id: string) {
  try {
    // Delete all invoice items first
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    })

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id }
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

    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: session.user.id
      },
      data: {
        status: status
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
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
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

