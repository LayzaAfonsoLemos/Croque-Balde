import { createClient } from "@/lib/supabase/server"
import { ProductCatalog } from "@/components/product-catalog"
import { Header } from "@/components/header"

export default async function HomePage() {
  const supabase = await createClient()

  let categories = []
  let products = []

  try {
    const { data: categoriesData } = await supabase.from("categories").select("*").eq("active", true).order("name")

    categories = categoriesData || []

    const { data: productsData } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq("active", true)
      .order("name")

    products = productsData || []
  } catch (error) {
    console.error("Error fetching data:", error)
  }

  // Transform products for header component
  const productsForHeader = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image_url: p.image_url,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Header products={productsForHeader} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 text-balance">Croque Balde</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
            O melhor frango crocante da cidade, entregue quentinho na sua casa
          </p>
        </div>
        <ProductCatalog categories={categories} products={products} />
      </main>
    </div>
  )
}
