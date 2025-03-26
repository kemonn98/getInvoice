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

export enum EmployeeStatus {
  FULL_TIME = "FULL_TIME",
  PROBATION = "PROBATION",
  CONTRACT = "CONTRACT"
}

export type Employee = {
  id: number
  userId: string
  name: string
  nationalId: string
  position: string
  status: EmployeeStatus
  address: string
  phone: string
  createdAt: Date
  updatedAt: Date
} 