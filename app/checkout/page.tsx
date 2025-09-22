"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, CreditCard, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { User } from "@supabase/supabase-js"
import { PaymentForms } from "@/components/payment-forms"
import { useCart } from "@/lib/cart-context"

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
}

interface Address {
  id: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  is_default: boolean
}

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("pix")
  const [orderNotes, setOrderNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"details" | "payment">("details")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  })
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { cart, clearCart } = useCart()

  useEffect(() => {
    // Check authentication
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
    })

    // Load products and addresses
    loadData()
  }, [router, supabase])

  const loadData = async () => {
    // Load products
    const { data: productsData } = await supabase.from("products").select("id, name, price, image_url")
    if (productsData) setProducts(productsData)

    // Load user addresses
    const { data: addressesData } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
    if (addressesData) {
      setAddresses(addressesData)
      const defaultAddress = addressesData.find((addr) => addr.is_default)
      if (defaultAddress) setSelectedAddress(defaultAddress.id)
    }
  }

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

  const handleAddAddress = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...newAddress,
        is_default: addresses.length === 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding address:", error)
      return
    }

    if (data) {
      setAddresses([...addresses, data])
      setSelectedAddress(data.id)
      setShowNewAddressForm(false)
      setNewAddress({
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      })
    }
  }

  const handleCreateOrder = async () => {
    if (!user || !selectedAddress || cart.length === 0) return

    setIsLoading(true)

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          address_id: selectedAddress,
          total_amount: getTotalPrice(),
          payment_method: paymentMethod,
          notes: orderNotes,
          estimated_delivery_time: 45, // 45 minutes
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = getCartItems().map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.product.price,
        notes: item.notes,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      setOrderId(order.id)
      setCurrentStep("payment")
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentComplete = async (paymentData: any) => {
    if (!orderId) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentData }),
      })

      if (response.ok) {
        // Clear cart and redirect to success page
        clearCart()
        router.push(`/orders/${orderId}`)
      } else {
        console.error("Payment failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const cartItems = getCartItems()
  const totalPrice = getTotalPrice()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Carrinho Vazio</h2>
            <p className="text-gray-600 mb-6">Adicione alguns produtos ao seu carrinho antes de finalizar o pedido.</p>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Link href="/">Continuar Comprando</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Cardápio
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentStep === "details" ? "Finalizar Pedido" : "Pagamento"}
          </h1>
        </div>

        {currentStep === "details" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length > 0 && (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={address.id} id={address.id} />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">
                                {address.street}, {address.number}
                                {address.complement && ` - ${address.complement}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.neighborhood}, {address.city} - {address.state}
                              </p>
                              <p className="text-sm text-gray-600">CEP: {address.zip_code}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {!showNewAddressForm ? (
                    <Button variant="outline" onClick={() => setShowNewAddressForm(true)} className="w-full">
                      Adicionar Novo Endereço
                    </Button>
                  ) : (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">Novo Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="street">Rua</Label>
                          <Input
                            id="street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="number">Número</Label>
                          <Input
                            id="number"
                            value={newAddress.number}
                            onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            value={newAddress.complement}
                            onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="neighborhood">Bairro</Label>
                          <Input
                            id="neighborhood"
                            value={newAddress.neighborhood}
                            onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="zip_code">CEP</Label>
                          <Input
                            id="zip_code"
                            value={newAddress.zip_code}
                            onChange={(e) => setNewAddress({ ...newAddress, zip_code: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddAddress} size="sm">
                          Salvar Endereço
                        </Button>
                        <Button variant="outline" onClick={() => setShowNewAddressForm(false)} size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="w-4 h-4" />
                        PIX (Instantâneo)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="debit_card" id="debit_card" />
                      <Label htmlFor="debit_card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Débito
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Order Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Alguma observação especial para seu pedido?"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-3">
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <Image
                            src={item.product.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity}x R$ {item.product.price.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                    <p className="font-medium text-orange-800">Tempo estimado de entrega:</p>
                    <p>45 minutos</p>
                  </div>

                  <Button
                    onClick={handleCreateOrder}
                    disabled={!selectedAddress || isLoading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isLoading ? "Processando..." : "Continuar para Pagamento"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <PaymentForms
              paymentMethod={paymentMethod}
              totalAmount={totalPrice}
              onPaymentComplete={handlePaymentComplete}
              isProcessing={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
