"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"

interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
  categories: {
    id: string
    name: string
  }
}

interface ProductCatalogProps {
  categories: Category[]
  products: Product[]
}

export function ProductCatalog({ categories, products }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { addToCart, removeFromCart, getItemQuantity } = useCart()

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category_id === selectedCategory)

  return (
    <div className="space-y-8">
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-white shadow-sm">
          <TabsTrigger
            value="all"
            className="py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
          >
            Todos
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const quantity = getItemQuantity(product.id)

              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500">
                      {product.categories.name}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 text-balance">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 text-pretty">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>

                      {quantity === 0 ? (
                        <Button
                          onClick={() => addToCart(product.id)}
                          size="sm"
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => removeFromCart(product.id)}
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold text-lg min-w-[2rem] text-center">{quantity}</span>
                          <Button
                            onClick={() => addToCart(product.id)}
                            size="sm"
                            className="w-8 h-8 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
