"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
      Sair da Conta
    </Button>
  )
}
