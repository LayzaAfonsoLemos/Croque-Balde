import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch order tracking info
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Simulate real-time tracking data
    const trackingData = {
      orderId: order.id,
      status: order.order_status,
      estimatedDelivery: order.estimated_delivery_time,
      deliveryPerson:
        order.order_status === "out_for_delivery"
          ? {
              name: "João Silva",
              phone: "(11) 99999-9999",
              vehicle: "Moto Honda CG 160",
              plate: "ABC-1234",
              rating: 4.8,
            }
          : null,
      location:
        order.order_status === "out_for_delivery"
          ? {
              lat: -23.5505,
              lng: -46.6333,
              address: "A caminho do seu endereço",
              lastUpdate: new Date().toISOString(),
            }
          : null,
    }

    return NextResponse.json({ tracking: trackingData })
  } catch (error) {
    console.error("Tracking fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
