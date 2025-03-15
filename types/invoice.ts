export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
  invoiceId?: number;
}

export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: number;
  invoiceNo: string;
  status: InvoiceStatus;
  date: Date | null;
  dueDate: Date | null;
  notes: string | null;
  total: number;
  ourName: string;
  ourBusinessName: string;
  ourAddress: string;
  clientName: string;
  clientBusinessName: string | null;
  clientAddress: string;
  items: InvoiceItem[];
  client: Client;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 