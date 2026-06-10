import { createCompany } from '../../actions'

export default function NewCompanyPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Nueva empresa</h1>
      <p className="text-sm text-gray-500 mb-6">
        Crea la empresa. El propietario se registra en <strong>/login</strong> y luego lo asignas desde aquí.
      </p>

      <form action={createCompany} className="space-y-4">
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input
              name="name"
              required
              placeholder="Ej: SweetCakes"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Slug (identificador único)</label>
            <input
              name="slug"
              required
              placeholder="ej: sweetcakes"
              pattern="[a-z0-9\-]+"
              title="Solo minúsculas, números y guiones"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Color principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue="#A06040"
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-400">Define el color de la marca</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Crear empresa
        </button>
      </form>
    </div>
  )
}
