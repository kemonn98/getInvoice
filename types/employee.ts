export enum EmployeeStatus {
  FULL_TIME = "FULL_TIME",
  PROBATION = "PROBATION",
  CONTRACT = "CONTRACT",
}

export interface Employee {
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
  gender: string
  email: string
  dateOfBirth: Date
  birthLocation: string
  joinedDate: Date
  lastEducation: string
  religion: string
  bank: string
  bankNumber: string
  active: boolean
}

export interface SalarySlip {
  id: number
  userId: string
  employeeId: number
  employee: Employee
  month: string
  year: number
  companyName: string
  companyAddress: string
  companyLogo: string | null
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
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

