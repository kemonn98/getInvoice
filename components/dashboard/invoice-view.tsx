import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Invoice, InvoiceItem } from '@/types/invoice'  // Import both types

interface InvoiceViewProps {
  invoice: Invoice
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  // When using the dueDate, handle the null case
  const formattedDueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date';

  // Calculate totals from items
  const calculateSubtotal = () => {
    if (!invoice.items || !Array.isArray(invoice.items)) return 0
    return invoice.items.reduce((sum: number, item: InvoiceItem) => 
      sum + (Number(item.quantity) * Number(item.price)), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  return (
    <div className="space-y-8">
      {/* Invoice Header */}
      <div className="flex flex-col gap-8 md:flex-row md:justify-between">
        {/* From Section */}
        <div>
          <h2 className="font-bold text-xl mb-2">{invoice.ourBusinessName}</h2>
          <div className="text-sm text-muted-foreground">
            <p>{invoice.ourName}</p>
            <p className="whitespace-pre-line">{invoice.ourAddress}</p>
          </div>
          {invoice.ourEmail && (
            <div>
              <span className="font-semibold">Our Email:</span> {invoice.ourEmail}
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-tight text-primary">INVOICE</h2>
          <p className="text-xl font-medium mt-2">#{invoice.invoiceNo}</p>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Issue Date: {new Date(invoice.date).toLocaleDateString()}</p>
            <p>Due Date: {formattedDueDate}</p>
            <p className="mt-2 font-medium uppercase">Status: {invoice.status}</p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="border-t pt-8">
        <h3 className="font-semibold mb-2">Bill To:</h3>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">{invoice.clientName}</p>
          {invoice.clientBusinessName && (
            <p>{invoice.clientBusinessName}</p>
          )}
          <p className="whitespace-pre-line">{invoice.clientAddress}</p>
          {invoice.clientEmail && (
            <div>
              <span className="font-semibold">Client Email:</span> {invoice.clientEmail}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: InvoiceItem) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                <td className="py-2 text-right">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Totals */}
      <div className="mt-8 flex justify-end">
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
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-8 border-t pt-4">
          <h3 className="font-medium mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4 text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
        <p className="mt-1">Invoice was created using Invoice Generator</p>
      </div>
    </div>
  )
}

