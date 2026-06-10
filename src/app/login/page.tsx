import { login } from './actions'
import Image from 'next/image'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen bg-brand-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-brand-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Image src="/logo.svg" alt="PattyBakery" width={180} height={55} priority />
          </div>
          <p className="text-sm text-gray-500">Gestión de pedidos e inventario</p>
        </div>

        {searchParams.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            Correo o contraseña incorrectos.
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            formAction={login}
            className="w-full bg-brand-700 hover:bg-brand-800 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          >
            Iniciar sesión
          </button>

        </form>
      </div>
    </div>
  )
}
