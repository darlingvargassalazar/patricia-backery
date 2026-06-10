import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintButton from './PrintButton'
import Image from 'next/image'

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, invoice_items(*)')
    .eq('id', params.id)
    .single()

  if (!invoice) notFound()

  const invoiceCode = `FACT-${String(invoice.invoice_number).padStart(3, '0')}`
  const items = invoice.invoice_items as any[]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
        body { font-family: Arial, sans-serif; color: #1a1a1a; }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <PrintButton />
      </div>

      <div className="max-w-2xl mx-auto p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <Image src="/logo.svg" alt="PattyBakery" width={160} height={50} />
            <p className="text-sm text-gray-500 mt-1">Repostería artesanal</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">{invoiceCode}</p>
            <p className="text-sm text-gray-500 mt-1">
              Fecha: {new Date(invoice.issue_date + 'T12:00:00').toLocaleDateString('es-CO', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
          <p className="font-semibold text-gray-800 text-lg">{invoice.customer_name}</p>
          {invoice.customer_id_number && (
            <p className="text-sm text-gray-500">NIT / CC: {invoice.customer_id_number}</p>
          )}
        </div>

        {/* Items table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left text-xs text-gray-500 uppercase tracking-wide pb-2 font-medium">Descripción</th>
              <th className="text-center text-xs text-gray-500 uppercase tracking-wide pb-2 font-medium w-20">Cant.</th>
              <th className="text-right text-xs text-gray-500 uppercase tracking-wide pb-2 font-medium w-32">Precio unit.</th>
              <th className="text-right text-xs text-gray-500 uppercase tracking-wide pb-2 font-medium w-32">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="py-2.5 text-sm text-gray-800">{item.description}</td>
                <td className="py-2.5 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="py-2.5 text-sm text-gray-600 text-right">${item.unit_price.toLocaleString('es-CO')}</td>
                <td className="py-2.5 text-sm font-medium text-gray-800 text-right">
                  ${(item.unit_price * item.quantity).toLocaleString('es-CO')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td colSpan={3} className="pt-3 text-right font-bold text-gray-800 text-base">Total:</td>
              <td className="pt-3 text-right font-bold text-brand-700 text-lg">
                ${invoice.total.toLocaleString('es-CO')}
              </td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && (
          <div className="border-t border-gray-200 pt-4 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Notas</p>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-sm text-gray-400">¡Gracias por su preferencia! 🎂</p>
        </div>
      </div>
    </>
  )
}
