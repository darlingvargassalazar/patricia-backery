# Patricia Bakes — App de Gestión

App web para la administración del negocio de repostería artesanal **Patricia Bakes** (Cali, Colombia).

## Módulos

- **Pedidos** — registro de pedidos con cliente, fecha de entrega, estado y anticipo
- **Productos** — catálogo de productos para la venta
- **Inventario** — materia prima con control de stock mínimo
- **Compras** — registro de compras a proveedores con actualización automática del inventario
- **Facturas** — generación e impresión de facturas en PDF
- **Costeo** — costeo de recetas con costo directo (ingredientes), mano de obra e indirecto

## Stack

- [Next.js 14](https://nextjs.org/) — App Router + Server Actions
- [Supabase](https://supabase.com/) — base de datos PostgreSQL + autenticación
- [Tailwind CSS](https://tailwindcss.com/) — estilos

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/darlingvargassalazar/patricia-backery.git
cd patricia-backery

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase

# Correr en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```
