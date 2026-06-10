import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .single()

  if (!invoice) notFound()

  const invoiceCode = `FACT-${String(invoice.invoice_number).padStart(3, '0')}`

  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <Link href="/dashboard/invoices" className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-1">←</Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{invoice.customer_name}</h1>
            <span className="text-sm font-mono text-gray-500">{invoiceCode}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(invoice.issue_date + 'T12:00:00').toLocaleDateString('es-CO', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Ítems</h2>
        <div className="space-y-2">
          {(invoice.invoice_items as any[]).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.description}
                <span className="text-gray-400 ml-1">× {item.quantity}</span>
              </span>
              <span className="text-gray-600 font-medium">
                ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold text-sm">
          <span>Total</span>
          <span>${invoice.total.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="bg-white rounded-xl border border-brand-100 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-1">Notas</h2>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      <Link
        href={`/print/invoice/${invoice.id}`}
        target="_blank"
        className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-xl transition-colors"
      >
        🖨️ Ver e imprimir factura
      </Link>
    </div>
  )
}
