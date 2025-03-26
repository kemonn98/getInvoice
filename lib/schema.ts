import { z } from "zod"

export const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string(),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]),
  amount: z.number().min(0, "Amount must be positive"),
  issueDate: z.string(),
  dueDate: z.string(),
  notes: z.string().optional(),

  // Our information
  ourName: z.string(),
  ourBusinessName: z.string(),
  ourAddress: z.string(),

  // Client information
  clientName: z.string().min(1, "Client name is required"),
  clientBusinessName: z.string().optional(),
  clientAddress: z.string().min(1, "Client address is required"),

  // Relations
  userId: z.string(),
  clientId: z.string(),

  // Invoice items
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Price must be positive"),
      }),
    )
    .min(1, "At least one item is required"),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>

