import ProductForm from '../ProductForm'

export default function NewProductPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const type = searchParams.type === 'raw_material' ? 'raw_material' : 'sale'

  return (
    <ProductForm
      initial={{
        name: '',
        type,
        price: 0,
        current_stock: 0,
        unit: 'kg',
        min_stock: 0,
        image_url: null,
      }}
    />
  )
}
