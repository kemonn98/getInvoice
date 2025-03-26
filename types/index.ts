export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

export interface Invoice {
  // ... other fields ...
  status: InvoiceStatus
  // ... other fields ...
} 