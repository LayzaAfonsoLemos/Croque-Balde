"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Package, DollarSign, Award, Crown } from "lucide-react"

interface SalesData {
  month: string
  revenue: number
  orders: number
}

interface ProductSales {
  id: string
  name: string
  total_sold: number
  total_revenue: number
  image_url: string
}

interface CustomerData {
  id: string
  full_name: string
  phone: string
  total_orders: number
  total_spent: number
  last_order: string
}

interface MonthlyStats {
  currentMonth: {
    revenue: number
    orders: number
    customers: number
  }
  previousMonth: {
    revenue: number
    orders: number
    customers: number
  }
}

export default function AdminReportsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productSales, setProductSales] = useState<ProductSales[]>([])
  const [topCustomers, setTopCustomers] = useState<CustomerData[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    currentMonth: { revenue: 0, orders: 0, customers: 0 },
    previousMonth: { revenue: 0, orders: 0, customers: 0 },
  })
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  const fetchReportsData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchSalesData(), fetchProductSales(), fetchTopCustomers(), fetchMonthlyStats()])
    } catch (error) {
      console.error("Error fetching reports data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select("created_at, total_amount")
      .eq("order_status", "delivered")
      .gte("created_at", getDateRange())

    if (orders) {
      const monthlyData: { [key: string]: { revenue: number; orders: number } } = {}

      orders.forEach((order) => {
        const month = new Date(order.created_at).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "short",
        })
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, orders: 0 }
        }
        monthlyData[month].revenue += Number(order.total_amount)
        monthlyData[month].orders += 1
      })

      const chartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
      }))

      setSalesData(chartData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()))
    }
  }

  const fetchProductSales = async () => {
    const { data } = await supabase
      .from("order_items")
      .select(`
        quantity,
        unit_price,
        products (
          id,
          name,
          image_url
        ),
        orders!inner (
          order_status
        )
      `)
      .eq("orders.order_status", "delivered")

    if (data) {
      const productStats: { [key: string]: ProductSales } = {}

      data.forEach((item: any) => {
        const productId = item.products.id
        if (!productStats[productId]) {
          productStats[productId] = {
            id: productId,
            name: item.products.name,
            image_url: item.products.image_url,
            total_sold: 0,
            total_revenue: 0,
          }
        }
        productStats[productId].total_sold += item.quantity
        productStats[productId].total_revenue += Number(item.unit_price) * item.quantity
      })

      const sortedProducts = Object.values(productStats).sort((a, b) => b.total_sold - a.total_sold)
      setProductSales(sortedProducts.slice(0, 10))
    }
  }

  const fetchTopCustomers = async () => {
    const { data } = await supabase
      .from("orders")
      .select(`
        user_id,
        total_amount,
        created_at,
        profiles (
          full_name,
          phone
        )
      `)
      .eq("order_status", "delivered")

    if (data) {
      const customerStats: { [key: string]: CustomerData } = {}

      data.forEach((order: any) => {
        const userId = order.user_id
        if (!customerStats[userId]) {
          customerStats[userId] = {
            id: userId,
            full_name: order.profiles?.full_name || "Cliente",
            phone: order.profiles?.phone || "",
            total_orders: 0,
            total_spent: 0,
            last_order: order.created_at,
          }
        }
        customerStats[userId].total_orders += 1
        customerStats[userId].total_spent += Number(order.total_amount)
        if (new Date(order.created_at) > new Date(customerStats[userId].last_order)) {
          customerStats[userId].last_order = order.created_at
        }
      })

      const sortedCustomers = Object.values(customerStats).sort((a, b) => b.total_spent - a.total_spent)
      setTopCustomers(sortedCustomers.slice(0, 10))
    }
  }

  const fetchMonthlyStats = async () => {
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    // Current month stats
    const { data: currentOrders } = await supabase
      .from("orders")
      .select("total_amount, user_id")
      .eq("order_status", "delivered")
      .gte("created_at", currentMonth.toISOString())
      .lt("created_at", nextMonth.toISOString())

    // Previous month stats
    const { data: previousOrders } = await supabase
      .from("orders")
      .select("total_amount, user_id")
      .eq("order_status", "delivered")
      .gte("created_at", previousMonth.toISOString())
      .lt("created_at", currentMonth.toISOString())

    setMonthlyStats({
      currentMonth: {
        revenue: currentOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        orders: currentOrders?.length || 0,
        customers: new Set(currentOrders?.map((order) => order.user_id)).size || 0,
      },
      previousMonth: {
        revenue: previousOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        orders: previousOrders?.length || 0,
        customers: new Set(previousOrders?.map((order) => order.user_id)).size || 0,
      },
    })
  }

  const getDateRange = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case "3months":
        return new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString()
      case "6months":
        return new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()
      case "1year":
        return new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString()
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString()
    }
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const COLORS = ["#f97316", "#ea580c", "#dc2626", "#b91c1c", "#991b1b"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios e Analytics</h1>
            <p className="text-gray-600">Análise detalhada das vendas e performance do restaurante</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Growth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {monthlyStats.currentMonth.revenue.toFixed(2)}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span
                  className={
                    calculateGrowth(monthlyStats.currentMonth.revenue, monthlyStats.previousMonth.revenue) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {calculateGrowth(monthlyStats.currentMonth.revenue, monthlyStats.previousMonth.revenue).toFixed(1)}%
                  vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos do Mês</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.currentMonth.orders}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span
                  className={
                    calculateGrowth(monthlyStats.currentMonth.orders, monthlyStats.previousMonth.orders) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {calculateGrowth(monthlyStats.currentMonth.orders, monthlyStats.previousMonth.orders).toFixed(1)}% vs
                  mês anterior
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyStats.currentMonth.customers}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span
                  className={
                    calculateGrowth(monthlyStats.currentMonth.customers, monthlyStats.previousMonth.customers) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {calculateGrowth(monthlyStats.currentMonth.customers, monthlyStats.previousMonth.customers).toFixed(
                    1,
                  )}
                  % vs mês anterior
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
            <CardDescription>Receita e número de pedidos ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? `R$ ${Number(value).toFixed(2)}` : value,
                      name === "revenue" ? "Receita" : "Pedidos",
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="revenue" fill="#f97316" name="revenue" />
                  <Bar yAxisId="right" dataKey="orders" fill="#ea580c" name="orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>Ranking dos produtos por quantidade vendida</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productSales.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <img
                      src={product.image_url || "/placeholder.svg?height=40&width=40"}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.total_sold} unidades vendidas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {product.total_revenue.toFixed(2)}</p>
                      <Progress
                        value={(product.total_sold / productSales[0]?.total_sold) * 100}
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-orange-600" />
                Melhores Clientes
              </CardTitle>
              <CardDescription>Clientes que mais compraram no restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{customer.full_name}</p>
                      <p className="text-sm text-gray-600">
                        {customer.total_orders} pedidos • Último:{" "}
                        {new Date(customer.last_order).toLocaleDateString("pt-BR")}
                      </p>
                      {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {customer.total_spent.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {customer.total_orders} pedidos
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
