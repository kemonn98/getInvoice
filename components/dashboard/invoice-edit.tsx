"use client"

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

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface EditInvoiceFormProps {
  invoice: any
}

export function EditInvoiceForm({ invoice }: EditInvoiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(invoice.status)
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice.items?.map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })) || []
  )

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
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
      
      // Add calculated values
      const total = calculateTotal()
      formData.set("amount", total.toString())
      formData.set("status", status)

      // Format dates
      const issueDate = formData.get("issueDate") as string
      const dueDate = formData.get("dueDate") as string
      
      if (issueDate) {
        formData.set("issueDate", new Date(issueDate).toISOString())
      }
      if (dueDate) {
        formData.set("dueDate", new Date(dueDate).toISOString())
      }

      // Format items with proper types
      const formattedItems = items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      }))

      formData.set("items", JSON.stringify(formattedItems))

      const result = await updateInvoice(invoice.id, formData)

      if (result.success) {
        router.push(`/dashboard/invoices/${invoice.id}`)
        router.refresh()
      } else {
        console.error('Update failed:', result.error)
      }
    } catch (error) {
      console.error('Failed to update invoice:', error)
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
                <Input
                  id="ourName"
                  name="ourName"
                  defaultValue={invoice.ourName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ourBusinessName">Business Name</Label>
                <Input
                  id="ourBusinessName"
                  name="ourBusinessName"
                  defaultValue={invoice.ourBusinessName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ourAddress">Address</Label>
              <Textarea
                id="ourAddress"
                name="ourAddress"
                defaultValue={invoice.ourAddress}
              />
            </div>
          </div>

          {/* Client Information */}
          <div className="grid gap-4">
            <h3 className="font-semibold">Bill To</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name*</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  defaultValue={invoice.clientName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientBusinessName">Business Name</Label>
                <Input
                  id="clientBusinessName"
                  name="clientBusinessName"
                  defaultValue={invoice.clientBusinessName}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address*</Label>
              <Textarea
                id="clientAddress"
                name="clientAddress"
                defaultValue={invoice.clientAddress}
                required
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input 
                id="invoiceNumber" 
                name="invoiceNumber" 
                defaultValue={invoice.invoiceNumber} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={new Date(invoice.dueDate).toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                name="issueDate"
                type="date"
                defaultValue={new Date(invoice.issueDate).toISOString().split('T')[0]}
                required
              />
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
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
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
                      onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-unitPrice`} className="sr-only">
                      Unit Price
                    </Label>
                    <Input
                      id={`item-${index}-unitPrice`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={items.length === 1}
                      onClick={() => removeItem(item.id)}
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
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
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

