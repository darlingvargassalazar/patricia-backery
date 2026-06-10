'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/login/actions'

const LINKS = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/orders', label: 'Pedidos' },
  { href: '/dashboard/products', label: 'Productos' },
  { href: '/dashboard/inventory', label: 'Inventario' },
  { href: '/dashboard/purchases', label: 'Compras' },
  { href: '/dashboard/invoices', label: 'Facturas' },
  { href: '/dashboard/recipes', label: 'Costos' },
]

export default function NavMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="bg-white border-b border-brand-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          <Image src="/logo.svg" alt="PattyBakery" width={130} height={40} priority />
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          aria-label="Menú"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-20 bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
              <Image src="/logo.svg" alt="PattyBakery" width={120} height={36} />
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1">
              {LINKS.map(({ href, label }) => {
                const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-3 py-4 border-t border-brand-100">
              <form>
                <button
                  formAction={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
