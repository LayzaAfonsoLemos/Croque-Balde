import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, MapPin, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"
import { OrderStatusTracker } from "@/components/order-status-tracker"
import { DeliveryTracker } from "@/components/delivery-tracker"

interface OrderPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      addresses (
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zip_code
      ),
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!order) {
    redirect("/profile/orders")
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "pix":
        return "PIX"
      case "credit_card":
        return "Cartão de Crédito"
      case "debit_card":
        return "Cartão de Débito"
      default:
        return method
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Pedidos
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pedido #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-600">Realizado em {new Date(order.created_at).toLocaleString("pt-BR")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Tracker */}
            <Card>
              <CardContent className="p-6">
                <OrderStatusTracker
                  currentStatus={order.order_status}
                  createdAt={order.created_at}
                  estimatedDeliveryTime={order.estimated_delivery_time}
                />
              </CardContent>
            </Card>

            {/* Delivery Tracking Component */}
            <DeliveryTracker
              orderId={order.id}
              currentStatus={order.order_status}
              estimatedDeliveryTime={order.estimated_delivery_time}
              createdAt={order.created_at}
            />

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium">
                    {order.addresses.street}, {order.addresses.number}
                    {order.addresses.complement && ` - ${order.addresses.complement}`}
                  </p>
                  <p className="text-gray-600">
                    {order.addresses.neighborhood}, {order.addresses.city} - {order.addresses.state}
                  </p>
                  <p className="text-gray-600">CEP: {order.addresses.zip_code}</p>
                </div>
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
                <div className="flex items-center justify-between">
                  <p>{getPaymentMethodText(order.payment_method)}</p>
                  <Badge
                    className={
                      order.payment_status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.payment_status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Items */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative flex-shrink-0">
                        <Image
                          src={item.products.image_url || "/placeholder.svg?height=48&width=48"}
                          alt={item.products.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.products.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x R$ {item.unit_price.toFixed(2).replace(".", ",")}
                        </p>
                        {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                      </div>
                      <p className="font-semibold text-sm">
                        R$ {(item.unit_price * item.quantity).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {order.total_amount.toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="space-y-2 pt-4">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <Link href="/">Fazer Novo Pedido</Link>
                  </Button>
                  {order.order_status === "delivered" && (
                    <Button variant="outline" className="w-full bg-transparent">
                      Pedir Novamente
                    </Button>
                  )}
                  <Button variant="outline" className="w-full bg-transparent">
                    Suporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
