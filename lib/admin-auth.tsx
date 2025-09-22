"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AdminRole {
  id: string
  user_id: string
  role: string
  permissions: Record<string, boolean>
}

interface AdminAuthContextType {
  user: User | null
  adminRole: AdminRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)

        // Check admin role
        const { data: adminData } = await supabase
          .from("admin_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setAdminRole(adminData)
      }

      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)

        const { data: adminData } = await supabase
          .from("admin_roles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setAdminRole(adminData)
      } else {
        setUser(null)
        setAdminRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAdminRole(null)
  }

  return <AdminAuthContext.Provider value={{ user, adminRole, loading, signOut }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
