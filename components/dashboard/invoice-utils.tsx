import { Invoice, InvoiceItem } from '@/types/invoice'

export function calculateInvoiceTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
}

export function formatInvoiceData(data: any): Invoice {
  return {
    ...data,
    date: data.date ? new Date(data.date) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    total: Number(data.total),
    items: data.items.map((item: any): InvoiceItem => ({
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.quantity) * Number(item.price)
    }))
  }
} 