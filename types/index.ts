import type { Employee as PrismaEmployee, SalarySlip as PrismaSalarySlip } from "@prisma/client"

export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

export interface Client {
  id: number
  userId: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface InvoiceItem {
  id: number
  invoiceId: number
  description: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: number
  userId: string
  clientId: number
  invoiceNo: string
  status: InvoiceStatus
  total: number
  date: Date
  dueDate: Date | null
  notes: string | null
  ourName: string
  ourBusinessName: string
  ourAddress: string
  ourEmail: string | null
  clientName: string
  clientBusinessName: string | null
  clientAddress: string
  clientEmail: string | null
  createdAt: Date | null
  updatedAt: Date | null
  client: Client
  items: InvoiceItem[]
}

export enum EmployeeStatus {
  FULL_TIME = "FULL_TIME",
  PROBATION = "PROBATION",
  CONTRACT = "CONTRACT"
}

// Create a type that extends Prisma's Employee type
export type Employee = Omit<PrismaEmployee, 'status'> & {
  status: EmployeeStatus
}

export type SalarySlipWithRelations = PrismaSalarySlip & {
  employee: Employee
}

export type SalarySlip = Omit<PrismaSalarySlip, 'notes'> & {
  notes: string | null
}

const statusCounts: Record<InvoiceStatus, number> = {
  [InvoiceStatus.PENDING]: 0,
  [InvoiceStatus.PAID]: 0,
  [InvoiceStatus.OVERDUE]: 0,
  [InvoiceStatus.CANCELLED]: 0,
}; 