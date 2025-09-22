"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ChefHat, Truck, Package } from "lucide-react"

interface OrderStatusTrackerProps {
  currentStatus: string
  createdAt: string
  estimatedDeliveryTime?: number
}

export function OrderStatusTracker({ currentStatus, createdAt, estimatedDeliveryTime }: OrderStatusTrackerProps) {
  const statuses = [
    { key: "pending", label: "Pedido Recebido", icon: Package, time: "0 min" },
    { key: "confirmed", label: "Confirmado", icon: CheckCircle, time: "2 min" },
    { key: "preparing", label: "Preparando", icon: ChefHat, time: "15 min" },
    { key: "out_for_delivery", label: "Saiu para Entrega", icon: Truck, time: "30 min" },
    { key: "delivered", label: "Entregue", icon: CheckCircle, time: "45 min" },
  ]

  const getCurrentStatusIndex = () => {
    return statuses.findIndex((status) => status.key === currentStatus)
  }

  const currentIndex = getCurrentStatusIndex()

  const getEstimatedTime = () => {
    if (!estimatedDeliveryTime) return null

    const orderTime = new Date(createdAt)
    const estimatedDelivery = new Date(orderTime.getTime() + estimatedDeliveryTime * 60000)

    return estimatedDelivery.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusTime = (index: number) => {
    if (index > currentIndex) return null

    const orderTime = new Date(createdAt)
    const statusTime = new Date(orderTime.getTime() + index * 10 * 60000) // 10 minutes between each status

    return statusTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Status do Pedido</h3>
        {estimatedDeliveryTime && currentStatus !== "delivered" && (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            Entrega prevista: {getEstimatedTime()}
          </Badge>
        )}
      </div>

      <div className="relative">
        {statuses.map((status, index) => {
          const Icon = status.icon
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === statuses.length - 1
          const statusTime = getStatusTime(index)

          return (
            <div key={status.key} className="relative flex items-center">
              {!isLast && (
                <div className={`absolute left-4 top-8 w-0.5 h-12 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
              )}

              <div className="flex items-center space-x-4 pb-8">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                        ? "bg-orange-500 text-white animate-pulse"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-medium ${
                        isCompleted ? "text-green-700" : isCurrent ? "text-orange-700" : "text-gray-500"
                      }`}
                    >
                      {status.label}
                    </p>
                    {statusTime && <span className="text-sm text-gray-500">{statusTime}</span>}
                  </div>
                  {isCurrent && (
                    <p className="text-sm text-orange-600">
                      {currentStatus === "preparing" && "Seu pedido está sendo preparado com carinho"}
                      {currentStatus === "out_for_delivery" && "O entregador está a caminho"}
                      {currentStatus === "confirmed" && "Pedido confirmado e sendo preparado"}
                      {currentStatus === "pending" && "Aguardando confirmação do restaurante"}
                    </p>
                  )}
                  {isCompleted && index < currentIndex && <p className="text-sm text-green-600">Concluído</p>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
