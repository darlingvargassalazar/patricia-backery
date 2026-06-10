import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InvoicesPage() {
  const supabase = createClient()
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .order('invoice_number', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Facturas</h1>
        <Link
          href="/dashboard/invoices/new"
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva factura
        </Link>
      </div>

      {!invoices?.length ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-gray-500 text-sm">No hay facturas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/invoices/${invoice.id}`}
              className="bg-white rounded-xl border border-brand-100 p-4 flex items-center justify-between hover:border-brand-300 transition-colors block"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    FACT-{String(invoice.invoice_number).padStart(3, '0')}
                  </span>
                </div>
                <p className="font-medium text-gray-800 mt-0.5">{invoice.customer_name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(invoice.issue_date + 'T12:00:00').toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-base font-semibold text-brand-700">
                ${invoice.total.toLocaleString('es-CO')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
