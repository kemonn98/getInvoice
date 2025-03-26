import type { Employee as PrismaEmployee } from "@prisma/client"
import { InvoiceStatus as InvoiceStatusEnum } from "@/types"
import type { SalarySlip as PrismaSalarySlip } from "@prisma/client"

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

export interface Employee extends PrismaEmployee {
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

export interface SalarySlip extends PrismaSalarySlip {
  id: number
  userId: string
  employeeId: number
  month: string
  year: number
  companyName: string
  companyAddress: string
  companyLogo?: string | null
  basicSalary: number
  positionAllowance: number
  familyAllowance: number
  childAllowance: number
  foodAllowance: number
  bonus: number
  thr: number
  others: number
  totalSalary: number
  approvedBy: string
  approvedPosition: string
  notes?: string | null
  createdAt: Date | null
  updatedAt: Date | null
  employee: Employee
}

export enum EmployeeStatus {
  FULL_TIME = "FULL_TIME",
  PROBATION = "PROBATION",
  CONTRACT = "CONTRACT"
}

const statusCounts: Record<InvoiceStatus, number> = {
  [InvoiceStatus.PENDING]: 0,
  [InvoiceStatus.PAID]: 0,
  [InvoiceStatus.OVERDUE]: 0,
  [InvoiceStatus.CANCELLED]: 0,
}; 