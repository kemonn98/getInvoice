import type { Invoice as PrismaInvoice } from "@prisma/client"
import { InvoiceStatus as InvoiceStatusEnum } from "@/types"

export type InvoiceStatus = InvoiceStatusEnum

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  price: number
  total: number
  invoiceId?: number
}

export interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Single Invoice interface definition
export interface Invoice extends Omit<PrismaInvoice, "items" | "client"> {
  items: InvoiceItem[]
  client: Client
  ourEmail: string | null
  clientEmail: string | null
}

