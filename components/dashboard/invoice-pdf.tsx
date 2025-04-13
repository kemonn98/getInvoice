import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface Client {
  name: string
  email?: string
  address?: string
  phone?: string
}

interface Invoice {
  invoiceNumber: string
  issueDate: string | Date
  dueDate: string | Date
  status: string
  client: Client
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
}

interface InvoicePDFProps {
  invoice: Invoice
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  return (
    <Card className="border-none shadow-none print:shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-2xl mb-2">
            <span className="text-primary">Invoice</span>Generator
          </div>
          <div className="text-sm text-muted-foreground">
            <p>123 Business Street</p>
            <p>San Francisco, CA 94103</p>
            <p>United States</p>
            <p>contact@invoicegenerator.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight">INVOICE</h2>
          <p className="text-xl font-medium mt-2">#{invoice.invoiceNumber}</p>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p className="mt-2 font-medium uppercase">Status: {invoice.status}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
            <div className="text-sm">
              <p className="font-medium">{invoice.client.name}</p>
              <p>{invoice.client.email}</p>
              {invoice.client.address && <p>{invoice.client.address}</p>}
              {invoice.client.phone && <p>{invoice.client.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Pay To:</h3>
            <div className="text-sm">
              <p className="font-medium">Invoice Generator Inc.</p>
              <p>Bank: National Bank</p>
              <p>Account: 1234567890</p>
              <p>Routing: 987654321</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item: InvoiceItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-end border-t px-6 py-4">
        <div className="w-full max-w-[300px] space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%):</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 w-full border-t pt-4">
            <h3 className="font-medium mb-2">Notes:</h3>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-8 w-full border-t pt-4 text-center text-sm text-muted-foreground">
          <p>Thank you for your business!</p>
        </div>
      </CardFooter>
    </Card>
  )
}

