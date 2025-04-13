"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { updateInvoice } from "@/app/actions/invoice"
import type { Invoice, InvoiceItem, InvoiceStatus } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface EditInvoiceFormProps {
  invoice: Invoice
}

// Helper function to format date safely
const formatDate = (date: string | Date | null) => {
  if (!date) return ""
  try {
    return new Date(date).toISOString().split("T")[0]
  } catch {
    return ""
  }
}

export function EditInvoiceForm({ invoice }: EditInvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(invoice.status)
  const [items, setItems] = useState(invoice.items)

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random(),
        description: "",
        quantity: 1,
        price: 0,
        total: 0,
        invoiceId: 0,
      },
    ])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax rate
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      // Calculate total first
      const total = calculateTotal()

      // Format items with proper types
      const formattedItems = items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: Number(item.quantity) * Number(item.price),
      }))

      // Create the complete form data object
      const completeFormData = new FormData()
      completeFormData.set("invoiceNo", formData.get("invoiceNo") as string)
      completeFormData.set("status", status)
      completeFormData.set("total", total.toString())
      completeFormData.set("date", new Date(formData.get("date") as string).toISOString())
      completeFormData.set("dueDate", new Date(formData.get("dueDate") as string).toISOString())
      completeFormData.set("notes", (formData.get("notes") as string) || "")
      completeFormData.set("ourName", formData.get("ourName") as string)
      completeFormData.set("ourBusinessName", formData.get("ourBusinessName") as string)
      completeFormData.set("ourAddress", formData.get("ourAddress") as string)
      completeFormData.set("clientName", formData.get("clientName") as string)
      completeFormData.set("clientEmail", (formData.get("clientEmail") as string) || "")
      completeFormData.set("clientBusinessName", formData.get("clientBusinessName") as string)
      completeFormData.set("clientAddress", formData.get("clientAddress") as string)
      completeFormData.set("ourEmail", (formData.get("ourEmail") as string) || "")
      completeFormData.set("items", JSON.stringify(formattedItems))

      const result = await updateInvoice(invoice.id.toString(), completeFormData)

      if (result.success) {
        router.push(`/dashboard/invoices/${invoice.id}`)
        router.refresh()
      } else {
        console.error("Update failed:", result.error)
      }
    } catch (error) {
      console.error("Failed to update invoice:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Header Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Our Information */}
          <div className="grid gap-4">
            <h3 className="font-semibold">From</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ourName">Name</Label>
                <Input id="ourName" name="ourName" defaultValue={invoice.ourName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ourBusinessName">Business Name</Label>
                <Input id="ourBusinessName" name="ourBusinessName" defaultValue={invoice.ourBusinessName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ourAddress">Address</Label>
              <Textarea id="ourAddress" name="ourAddress" defaultValue={invoice.ourAddress} />
            </div>
          </div>

          {/* Client Information */}
          <div className="grid gap-4">
            <h3 className="font-semibold">Bill To</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name*</Label>
                <Input id="clientName" name="clientName" defaultValue={invoice.clientName} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  defaultValue={invoice.clientEmail || ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientBusinessName">Business Name</Label>
              <Input
                id="clientBusinessName"
                name="clientBusinessName"
                defaultValue={invoice.clientBusinessName || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address*</Label>
              <Textarea id="clientAddress" name="clientAddress" defaultValue={invoice.clientAddress} required />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceNo">Invoice Number</Label>
              <Input id="invoiceNo" name="invoiceNo" defaultValue={invoice.invoiceNo} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={formatDate(invoice.dueDate)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Issue Date</Label>
              <Input id="date" name="date" type="date" defaultValue={formatDate(invoice.date)} required />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Invoice Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid gap-4 md:grid-cols-[1fr_100px_120px_40px]">
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-description`} className="sr-only">
                      Description
                    </Label>
                    <Input
                      id={`item-${index}-description`}
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id || 0, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-quantity`} className="sr-only">
                      Quantity
                    </Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id || 0, "quantity", Number.parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-price`} className="sr-only">
                      Unit Price
                    </Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={item.price}
                      onChange={(e) => updateItem(item.id || 0, "price", Number.parseFloat(e.target.value.replace(',', '.')) || 0)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={items.length === 1}
                      onClick={() => removeItem(item.id || 0)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-end border-t px-6 py-4">
          <div className="w-full max-w-[200px] space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>{formatCurrency(calculateTax())}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Enter any additional notes..."
              className="min-h-[100px]"
              defaultValue={invoice.notes || ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

