"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
}

interface CartSidebarProps {
  products: Product[]
}

export function CartSidebar({ products }: CartSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, addToCart, removeFromCart, removeItemCompletely, clearCart, getTotalItems } = useCart()

  const getCartItems = () => {
    return cart
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId)
        return product ? { ...cartItem, product } : null
      })
      .filter(Boolean) as Array<{ productId: string; quantity: number; notes?: string; product: Product }>
  }

  const getTotalPrice = () => {
    return getCartItems().reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  const cartItems = getCartItems()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Seu Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Continuar Comprando
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={item.product.image_url || "/placeholder.svg?height=64&width=64"}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{item.product.name}</h4>
                        <p className="text-sm text-green-600 font-semibold">
                          R$ {item.product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => removeFromCart(item.productId)}
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                        <Button
                          onClick={() => addToCart(item.productId)}
                          size="sm"
                          className="w-8 h-8 p-0 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => removeItemCompletely(item.productId)}
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {totalPrice.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">Finalizar Pedido</Link>
                  </Button>
                  <Button variant="outline" onClick={clearCart} className="w-full bg-transparent">
                    Limpar Carrinho
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
