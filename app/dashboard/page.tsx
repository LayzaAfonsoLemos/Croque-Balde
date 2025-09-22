import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, ShoppingBag, Clock, Star, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch order statistics
  const { data: orders } = await supabase.from("orders").select("*").eq("user_id", user.id)

  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
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
    .limit(5)

  // Calculate statistics
  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  const deliveredOrders = orders?.filter((order) => order.order_status === "delivered").length || 0
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

  // Get favorite products (most ordered)
  const { data: favoriteProducts } = await supabase
    .from("order_items")
    .select(`
      product_id,
      quantity,
      products (
        name,
        image_url,
        price
      )
    `)
    .eq("orders.user_id", user.id)
    .limit(3)

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
        return "Aguardando"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "out_for_delivery":
        return "Entregando"
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
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {profile?.full_name || user.email?.split("@")[0]}!
              </h1>
              <p className="text-gray-600">Bem-vindo ao seu dashboard da Croque Balde</p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Link href="/">Fazer Pedido</Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <ShoppingBag className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {totalSpent.toFixed(2).replace(".", ",")}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Entregues</p>
                  <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {averageOrderValue.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pedidos Recentes</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/orders">Ver Todos</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">
                              {order.order_items.length} {order.order_items.length === 1 ? "item" : "itens"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            R$ {order.total_amount.toFixed(2).replace(".", ",")}
                          </p>
                          <Badge className={getStatusColor(order.order_status)}>
                            {getStatusText(order.order_status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pedido encontrado</p>
                    <Button asChild className="mt-4">
                      <Link href="/">Fazer Primeiro Pedido</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Profile */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Link href="/">Novo Pedido</Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/profile/orders">Meus Pedidos</Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/profile">Meu Perfil</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Atendimento</p>
                    <p className="font-medium">(11) 9999-9999</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Horário de Funcionamento</p>
                    <p className="font-medium">18h às 23h</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
