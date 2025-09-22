import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Croque Balde - O melhor frango crocante da cidade",
  description: "Delivery de frango crocante quentinho na sua casa",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
