"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createInvoice } from "@/app/actions/invoice"
import type { SessionContextValue } from "next-auth/react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

export function CreateInvoiceForm() {
  const router = useRouter()
  const { data: session, status }: SessionContextValue = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 }
  ])

  // Generate default invoice number
  const defaultInvoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

  // Generate default dates
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        price: 0,
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
    setError(null)
    
    if (!session?.user?.id) {
      setError("You must be signed in to create an invoice")
      return
    }

    try {
      setIsLoading(true)
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)

      // Add total amount
      const total = calculateTotal()
      formData.append("amount", total.toString())

      // Add items
      formData.append(
        "items",
        JSON.stringify(
          items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        ),
      )

      // Add user ID explicitly
      formData.append("userId", session.user.id)

      const result = await createInvoice(formData)
      
      if (result.success && result.data) {
        router.push(`/dashboard/invoices/${result.data.id}`)
        router.refresh()
      } else {
        setError(result.error || "Failed to create invoice")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show error if not authenticated
  if (status === "unauthenticated") {
    return null // useEffect will handle redirect
  }

  return (
    <>
      {/* Add overlay when form is submitting */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Creating invoice...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
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
                    defaultValue="Nadia Tateanna"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ourBusinessName">Business Name</Label>
                  <Input
                    id="ourBusinessName"
                    name="ourBusinessName"
                    defaultValue="PT. SlabPixel Creative Group"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ourAddress">Address</Label>
                <Textarea
                  id="ourAddress"
                  name="ourAddress"
                  defaultValue="Jl. Raya Tajem No.A09, RT.05/RW.27, Kenayan, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584"
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email</Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientBusinessName">Business Name (Optional)</Label>
                <Input
                  id="clientBusinessName"
                  name="clientBusinessName"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Client Address*</Label>
                <Textarea
                  id="clientAddress"
                  name="clientAddress"
                  required
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid gap-4">
              <h3 className="font-semibold">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    name="invoiceNumber"
                    defaultValue={defaultInvoiceNumber}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="PENDING">
                    <SelectTrigger>
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
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    defaultValue={today}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={thirtyDaysFromNow}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Line Items</CardTitle>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addItem}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr,100px,120px,40px] items-center gap-4">
                <div>
                  <Label htmlFor={`item-${index}-description`} className="sr-only">
                    Description
                  </Label>
                  <Input
                    id={`item-${index}-description`}
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
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
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor={`item-${index}-price`} className="sr-only">
                    Price
                  </Label>
                  <Input
                    id={`item-${index}-price`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={item.price || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      updateItem(item.id, "price", value);
                    }}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={items.length === 1 || isLoading}
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex flex-col items-end border-t pt-4">
            <div className="w-[240px] space-y-1.5">
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

        {/* Notes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any additional notes..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

