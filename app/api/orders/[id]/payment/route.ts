import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json()
    const { paymentData } = body

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update order with payment information
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      paymentData,
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
