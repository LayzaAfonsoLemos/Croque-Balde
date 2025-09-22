import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { status } = body

    // Validate status
    const validStatuses = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update order status
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Order status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
