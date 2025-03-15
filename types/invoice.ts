import { Invoice as PrismaInvoice, InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client'

export type InvoiceStatus = PrismaInvoiceStatus;

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  price: number;
  total: number;
  invoiceId?: number;
}

export interface Invoice extends Omit<PrismaInvoice, 'items' | 'client'> {
  items: InvoiceItem[];
  client: Client;
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

export interface Invoice extends Omit<PrismaInvoice, 'items' | 'client'> {
  items: InvoiceItem[];
  client: Client;
} 