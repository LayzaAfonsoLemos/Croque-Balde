import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import Image from "next/image"

export default async function OrdersPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      addresses (
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      ),
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Aguardando Confirmação"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "out_for_delivery":
        return "Saiu para Entrega"
      case "delivered":
        return "Entregue"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-600">Acompanhe o status dos seus pedidos</p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-600 mb-6">
                Você ainda não fez nenhum pedido. Que tal experimentar nosso delicioso frango?
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Link href="/">Fazer Primeiro Pedido</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.order_status)}>{getStatusText(order.order_status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>
                        {order.addresses.street}, {order.addresses.number}
                        {order.addresses.complement && ` - ${order.addresses.complement}`}
                      </p>
                      <p>
                        {order.addresses.neighborhood}, {order.addresses.city} - {order.addresses.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {order.order_items.slice(0, 3).map((item: any, index: number) => (
                        <div
                          key={item.id}
                          className="w-10 h-10 relative border-2 border-white rounded-full overflow-hidden"
                        >
                          <Image
                            src={item.products.image_url || "/placeholder.svg?height=40&width=40"}
                            alt={item.products.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="w-10 h-10 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                          +{order.order_items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {order.order_items.length} {order.order_items.length === 1 ? "item" : "itens"}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {order.total_amount.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>Ver Detalhes</Link>
                    </Button>
                    {order.order_status === "delivered" && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Pedir Novamente
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
