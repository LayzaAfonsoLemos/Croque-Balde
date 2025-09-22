"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Clock, MapPin, Phone, User, CheckCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Order {
  id: string
  created_at: string
  total_amount: number
  order_status: string
  payment_status: string
  payment_method: string
  notes: string
  estimated_delivery_time: number
  profiles: {
    full_name: string
    phone: string
  }
  addresses: {
    street: string
    number: string
    neighborhood: string
    city: string
    complement: string
  }
  order_items: {
    id: string
    quantity: number
    unit_price: number
    notes: string
    products: {
      name: string
      image_url: string
    }
  }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter, searchTerm])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            phone
          ),
          addresses (
            street,
            number,
            neighborhood,
            city,
            complement
          ),
          order_items (
            id,
            quantity,
            unit_price,
            notes,
            products (
              name,
              image_url
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.order_status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, order_status: newStatus } : order)))

      toast({
        title: "Status atualizado",
        description: `Pedido ${orderId.slice(0, 8)} atualizado para ${getStatusText(newStatus)}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800"
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
        return "Pendente"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Pronto"
      case "out_for_delivery":
        return "Saiu para entrega"
      case "delivered":
        return "Entregue"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "confirmed"
      case "confirmed":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "out_for_delivery"
      case "out_for_delivery":
        return "delivered"
      default:
        return currentStatus
    }
  }

  const canAdvanceStatus = (status: string) => {
    return !["delivered", "cancelled"].includes(status)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
          <p className="text-gray-600">Visualize e gerencie todos os pedidos do restaurante</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Buscar por cliente ou ID do pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="out_for_delivery">Saiu para entrega</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Pedidos Ativos</TabsTrigger>
            <TabsTrigger value="completed">Finalizados</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {filteredOrders
              .filter((order) => !["delivered", "cancelled"].includes(order.order_status))
              .map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">#{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{order.profiles?.full_name || "Cliente"}</span>
                            <Clock className="w-4 h-4 ml-4" />
                            <span>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.order_status)}>
                          {getStatusText(order.order_status)}
                        </Badge>
                        <span className="font-bold text-lg">R$ {Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {order.addresses?.street}, {order.addresses?.number} - {order.addresses?.neighborhood}
                          </span>
                        </div>
                        {order.profiles?.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{order.profiles.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Pedido #{order.id.slice(0, 8)}</DialogTitle>
                              <DialogDescription>Detalhes completos do pedido</DialogDescription>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold">Cliente</h4>
                                    <p>{selectedOrder.profiles?.full_name}</p>
                                    <p>{selectedOrder.profiles?.phone}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Endereço</h4>
                                    <p>
                                      {selectedOrder.addresses?.street}, {selectedOrder.addresses?.number}
                                    </p>
                                    <p>
                                      {selectedOrder.addresses?.neighborhood} - {selectedOrder.addresses?.city}
                                    </p>
                                    {selectedOrder.addresses?.complement && <p>{selectedOrder.addresses.complement}</p>}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                                  <div className="space-y-2">
                                    {selectedOrder.order_items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between p-2 border rounded"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <img
                                            src={item.products.image_url || "/placeholder.svg?height=40&width=40"}
                                            alt={item.products.name}
                                            className="w-10 h-10 rounded object-cover"
                                          />
                                          <div>
                                            <p className="font-medium">{item.products.name}</p>
                                            <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                                            {item.notes && <p className="text-sm text-gray-500">Obs: {item.notes}</p>}
                                          </div>
                                        </div>
                                        <p className="font-semibold">
                                          R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {selectedOrder.notes && (
                                  <div>
                                    <h4 className="font-semibold">Observações</h4>
                                    <p className="text-gray-600">{selectedOrder.notes}</p>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div>
                                    <p className="text-sm text-gray-600">Pagamento: {selectedOrder.payment_method}</p>
                                    <p className="text-sm text-gray-600">Status: {selectedOrder.payment_status}</p>
                                  </div>
                                  <p className="text-xl font-bold">
                                    Total: R$ {Number(selectedOrder.total_amount).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {canAdvanceStatus(order.order_status) && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.order_status))}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Avançar
                          </Button>
                        )}

                        {order.order_status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filteredOrders
              .filter((order) => ["delivered", "cancelled"].includes(order.order_status))
              .map((order) => (
                <Card key={order.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle className="text-lg">#{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{order.profiles?.full_name || "Cliente"}</span>
                            <Clock className="w-4 h-4 ml-4" />
                            <span>{new Date(order.created_at).toLocaleString("pt-BR")}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.order_status)}>
                          {getStatusText(order.order_status)}
                        </Badge>
                        <span className="font-bold text-lg">R$ {Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
