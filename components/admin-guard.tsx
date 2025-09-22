"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/lib/admin-auth"
import { Loader2 } from "lucide-react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, adminRole, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !adminRole)) {
      router.push("/admin/login")
    }
  }, [user, adminRole, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user || !adminRole) {
    return null
  }

  return <>{children}</>
}
