import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, MapPin, Clock, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"

export default async function ProfilePage() {
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

  // Fetch user addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (
          name
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
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
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações e pedidos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  {profile?.full_name && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Nome</p>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Telefone</p>
                        <p className="font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  Editar Informações
                </Button>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereços Salvos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address: any) => (
                      <div key={address.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
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
                          {address.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Padrão
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum endereço cadastrado</p>
                )}
                <Button variant="outline" size="sm">
                  Gerenciar Endereços
                </Button>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pedidos Recentes
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile/orders">Ver Todos</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {order.order_items.length} {order.order_items.length === 1 ? "item" : "itens"} • R${" "}
                            {order.total_amount.toFixed(2).replace(".", ",")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.order_status)}>
                          {getStatusText(order.order_status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Nenhum pedido encontrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Link href="/">Fazer Novo Pedido</Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/profile/orders">Ver Meus Pedidos</Link>
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Suporte
                </Button>
                <LogoutButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
