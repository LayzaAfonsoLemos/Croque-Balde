"use client"

import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { CartSidebar } from "./cart-sidebar"

interface Product {
  id: string
  name: string
  price: number
  image_url: string | null
}

interface HeaderProps {
  products?: Product[]
}

export function Header({ products = [] }: HeaderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">CB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Croque Balde</span>
          </Link>

          <div className="flex items-center space-x-4">
            <CartSidebar products={products} />

            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="w-5 h-5 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">Perfil</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  asChild
                >
                  <Link href="/auth/signup">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
