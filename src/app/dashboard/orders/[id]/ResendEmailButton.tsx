'use client'

import { useState } from 'react'
import { resendOrderEmail } from '../actions'

export default function ResendEmailButton({ orderId, customerEmail }: { orderId: string; customerEmail: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    setState('sending')
    const result = await resendOrderEmail(orderId)
    setState(result.ok ? 'ok' : 'error')
    setMessage(result.message)
    if (result.ok) setTimeout(() => setState('idle'), 4000)
  }

  if (state === 'ok') {
    return (
      <div className="w-full text-center text-sm text-green-700 bg-green-50 border border-green-200 py-2.5 rounded-xl">
        ✓ {message}
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="space-y-1">
        <div className="w-full text-center text-sm text-red-600 bg-red-50 border border-red-200 py-2.5 rounded-xl">
          {message}
        </div>
        <button onClick={() => setState('idle')} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'sending'}
      className="w-full bg-white hover:bg-brand-50 disabled:opacity-50 text-brand-600 text-sm font-medium py-2.5 rounded-xl border border-brand-200 transition-colors"
    >
      {state === 'sending' ? 'Enviando...' : `✉ Reenviar correo a ${customerEmail}`}
    </button>
  )
}
