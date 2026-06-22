import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '../../ProductForm'

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return (
    <ProductForm
      initial={{
        id: product.id,
        name: product.name,
        type: product.type,
        price: product.price ?? 0,
        current_stock: product.current_stock ?? 0,
        unit: product.unit ?? 'kg',
        min_stock: product.min_stock ?? 0,
        image_url: product.image_url ?? null,
      }}
    />
  )
}
