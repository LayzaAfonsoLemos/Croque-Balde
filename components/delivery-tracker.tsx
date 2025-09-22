"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, User, Truck, Navigation } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DeliveryTrackerProps {
  orderId: string
  currentStatus: string
  estimatedDeliveryTime?: number
  createdAt: string
}

interface DeliveryPerson {
  id: string
  name: string
  phone: string
  vehicle_type: string
  vehicle_plate: string
  rating: number
}

export function DeliveryTracker({ orderId, currentStatus, estimatedDeliveryTime, createdAt }: DeliveryTrackerProps) {
  const [deliveryPerson, setDeliveryPerson] = useState<DeliveryPerson | null>(null)
  const [estimatedArrival, setEstimatedArrival] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (currentStatus === "out_for_delivery") {
      loadDeliveryInfo()
    }
  }, [currentStatus, orderId])

  const loadDeliveryInfo = async () => {
    setIsLoading(true)
    try {
      // Simulate fetching delivery person info
      // In a real app, this would come from your database
      const mockDeliveryPerson: DeliveryPerson = {
        id: "delivery-001",
        name: "João Silva",
        phone: "(11) 99999-9999",
        vehicle_type: "Moto",
        vehicle_plate: "ABC-1234",
        rating: 4.8,
      }

      setDeliveryPerson(mockDeliveryPerson)

      // Calculate estimated arrival
      if (estimatedDeliveryTime) {
        const orderTime = new Date(createdAt)
        const estimatedTime = new Date(orderTime.getTime() + estimatedDeliveryTime * 60000)
        setEstimatedArrival(
          estimatedTime.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        )
      }
    } catch (error) {
      console.error("Error loading delivery info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateLocationUpdate = () => {
    // Simulate real-time location updates
    const locations = [
      "Saiu do restaurante",
      "Na Rua das Flores, 123",
      "Próximo ao seu endereço",
      "Chegando em 2 minutos",
    ]

    const randomLocation = locations[Math.floor(Math.random() * locations.length)]
    // In a real app, you would update this via WebSocket or polling
    console.log("Delivery update:", randomLocation)
  }

  if (currentStatus !== "out_for_delivery" && currentStatus !== "delivered") {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          {currentStatus === "delivered" ? "Entrega Concluída" : "Rastreamento da Entrega"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentStatus === "out_for_delivery" && (
          <>
            {/* Estimated Arrival */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Previsão de Chegada</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{estimatedArrival || "Calculando..."}</p>
              <p className="text-sm text-orange-600">Seu pedido está a caminho!</p>
            </div>

            {/* Delivery Person Info */}
            {deliveryPerson && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{deliveryPerson.name}</p>
                      <p className="text-sm text-gray-600">
                        {deliveryPerson.vehicle_type} • {deliveryPerson.vehicle_plate}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{deliveryPerson.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Phone className="w-4 h-4" />
                    Ligar
                  </Button>
                </div>
              </div>
            )}

            {/* Live Tracking */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Localização em Tempo Real</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulateLocationUpdate}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Navigation className="w-4 h-4" />
                  Atualizar
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Última localização</span>
                </div>
                <p className="text-gray-700">A caminho do seu endereço</p>
                <p className="text-sm text-gray-500">Atualizado há 1 minuto</p>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Mapa de rastreamento</p>
                  <p className="text-sm text-gray-500">Em um app real, aqui seria exibido um mapa interativo</p>
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Instruções para Entrega</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Mantenha o telefone por perto</li>
                <li>• O entregador pode ligar quando chegar</li>
                <li>• Tenha o dinheiro separado se for pagamento na entrega</li>
              </ul>
            </div>
          </>
        )}

        {currentStatus === "delivered" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Pedido Entregue!</h3>
            <p className="text-green-600 mb-4">Seu pedido foi entregue com sucesso. Esperamos que tenha gostado!</p>
            <Button variant="outline" className="bg-transparent border-green-500 text-green-700 hover:bg-green-50">
              Avaliar Entrega
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
