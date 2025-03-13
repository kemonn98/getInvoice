'use server'

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { MOCK_USER_ID } from "../lib/constants"

export async function getInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: MOCK_USER_ID
      },
      include: {
        client: true  // Include the client relationship
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return invoices
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return [] // Return empty array instead of throwing error
  }
}

export async function createInvoice(formData: FormData) {
  try {
    // First ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: MOCK_USER_ID }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: MOCK_USER_ID,
          name: "Test User",
          email: "test@example.com",
        }
      })
    }

    // Ensure default client exists
    let defaultClient = await prisma.client.findFirst({
      where: { userId: MOCK_USER_ID }
    })

    if (!defaultClient) {
      defaultClient = await prisma.client.create({
        data: {
          userId: MOCK_USER_ID,
          name: formData.get('clientName') as string,
          email: "client@example.com",
          address: formData.get('clientAddress') as string,
        }
      })
    }

    // Calculate total from items
    const items = JSON.parse(formData.get('items') as string)
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.price), 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    // Create invoice with all required fields
    const invoice = await prisma.invoice.create({
      data: {
        // Invoice details
        invoiceNumber: formData.get('invoiceNumber') as string,
        status: formData.get('status') as string || 'pending',
        amount: total,
        issueDate: new Date(formData.get('issueDate') as string),
        dueDate: new Date(formData.get('dueDate') as string),
        notes: formData.get('notes') as string || '',
        
        // Our details (with defaults if not provided)
        ourName: formData.get('ourName') as string || "Nadia Tateanna",
        ourBusinessName: formData.get('ourBusinessName') as string || "PT. SlabPixel Creative Group",
        ourAddress: formData.get('ourAddress') as string || "Jl. Raya Tajem No.A09, RT.05/RW.27, Kenayan, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584",
        
        // Client details
        clientName: formData.get('clientName') as string,
        clientBusinessName: formData.get('clientBusinessName') as string || null,
        clientAddress: formData.get('clientAddress') as string,
        
        // Relations
        userId: MOCK_USER_ID,
        clientId: defaultClient.id,
        
        // Line items
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        }
      },
      include: {
        items: true,
        client: true
      }
    })

    revalidatePath('/dashboard')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return { success: false, error: 'Failed to create invoice' }
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

export async function updateInvoice(id: string, formData: FormData) {
  try {
    // Calculate total from items
    const items = JSON.parse(formData.get('items') as string)
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: formData.get('invoiceNumber') as string,
        status: formData.get('status') as string,
        dueDate: new Date(formData.get('dueDate') as string),
        amount: total,
        notes: formData.get('notes') as string || '',
        items: {
          deleteMany: {}, // Delete existing items
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: {
        items: true,
        client: true
      }
    })

    revalidatePath('/dashboard')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to update invoice:', error)
    return { success: false, error: 'Failed to update invoice' }
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
    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: MOCK_USER_ID
      },
      data: {
        status: status
      }
    })

    revalidatePath('/dashboard')
    return { success: true, data: invoice }
  } catch (error) {
    console.error('Failed to update invoice status:', error)
    return { success: false, error: 'Failed to update invoice status' }
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

