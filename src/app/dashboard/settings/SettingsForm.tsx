'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Company } from '@/lib/company'

type Props = { company: Company }

async function saveSettings(companyId: string, payload: {
  name: string
  primary_color: string
  logo_url: string | null
  email_api_key: string | null
  email_from: string | null
  email_from_name: string | null
}) {
  const res = await fetch('/api/settings/company', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_id: companyId, ...payload }),
  })
  if (!res.ok) throw new Error('Error al guardar')
}

export default function SettingsForm({ company }: Props) {
  const [name, setName] = useState(company.name)
  const [color, setColor] = useState(company.primary_color)
  const [logoUrl, setLogoUrl] = useState<string | null>(company.logo_url)
  const [emailApiKey, setEmailApiKey] = useState(company.email_api_key ?? '')
  const [emailFrom, setEmailFrom] = useState(company.email_from ?? '')
  const [emailFromName, setEmailFromName] = useState(company.email_from_name ?? '')
  const [showKey, setShowKey] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${company.id}.${ext}`
    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      setLogoUrl(data.publicUrl + `?t=${Date.now()}`)
    }
    setUploading(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await saveSettings(company.id, {
        name,
        primary_color: color,
        logo_url: logoUrl,
        email_api_key: emailApiKey || null,
        email_from: emailFrom || null,
        email_from_name: emailFromName || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      window.location.reload()
    })
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Configuración</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Empresa */}
        <div className="bg-white rounded-xl border border-brand-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Mi empresa</h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Color de marca</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">{color}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Los colores se aplicarán al recargar la página.</p>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-xl border border-brand-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Logo</h2>

          {logoUrl && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Logo" className="h-14 object-contain rounded border border-gray-100 p-1" />
              <button type="button" onClick={() => setLogoUrl(null)} className="text-xs text-red-400 hover:text-red-600">Quitar</button>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {logoUrl ? 'Reemplazar logo' : 'Subir logo'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={uploading}
              className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
            />
            {uploading && <p className="text-xs text-gray-400 mt-1">Subiendo...</p>}
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-xl border border-brand-100 p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-700">Correo de confirmación</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Al crear un pedido se envía automáticamente un correo al cliente desde tu Gmail.
            </p>
          </div>

          <div className="bg-brand-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">¿Cómo obtener la contraseña de aplicación?</p>
            <ol className="list-decimal list-inside space-y-0.5 text-gray-500">
              <li>Ve a <strong>myaccount.google.com</strong> → Seguridad</li>
              <li>Activa la verificación en 2 pasos (si no está activa)</li>
              <li>Busca <strong>&quot;Contraseñas de aplicación&quot;</strong></li>
              <li>Crea una nueva → copia las 16 letras que aparecen</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tu correo Gmail</label>
            <input
              type="email"
              value={emailFrom}
              onChange={(e) => setEmailFrom(e.target.value)}
              placeholder="tucorreo@gmail.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Contraseña de aplicación (16 caracteres)</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={emailApiKey}
                onChange={(e) => setEmailApiKey(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
              >
                {showKey ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre del remitente</label>
            <input
              type="text"
              value={emailFromName}
              onChange={(e) => setEmailFromName(e.target.value)}
              placeholder="PattyBakery"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || uploading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
        >
          {saved ? '✓ Guardado' : isPending ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  )
}
