export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled"

export interface Invoice {
  // ... other fields ...
  status: InvoiceStatus
  // ... other fields ...
} 