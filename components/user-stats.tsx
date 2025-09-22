"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, ShoppingBag, Clock, Star } from "lucide-react"

interface UserStatsProps {
  totalOrders: number
  totalSpent: number
  deliveredOrders: number
  averageOrderValue: number
}

export function UserStats({ totalOrders, totalSpent, deliveredOrders, averageOrderValue }: UserStatsProps) {
  const stats = [
    {
      label: "Total de Pedidos",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-orange-500",
    },
    {
      label: "Total Gasto",
      value: `R$ ${totalSpent.toFixed(2).replace(".", ",")}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Pedidos Entregues",
      value: deliveredOrders.toString(),
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Ticket Médio",
      value: `R$ ${averageOrderValue.toFixed(2).replace(".", ",")}`,
      icon: Star,
      color: "text-yellow-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
