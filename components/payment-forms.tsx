"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QrCode, CreditCard, Smartphone, Copy, Check } from "lucide-react"
import Image from "next/image"

interface PaymentFormsProps {
  paymentMethod: string
  totalAmount: number
  onPaymentComplete: (paymentData: any) => void
  isProcessing: boolean
}

export function PaymentForms({ paymentMethod, totalAmount, onPaymentComplete, isProcessing }: PaymentFormsProps) {
  const [pixCopied, setPixCopied] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  })

  // Simulated PIX code
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}520400005303986540${totalAmount.toFixed(2)}5802BR5925CROQUE BALDE LTDA6009SAO PAULO62070503***6304`

  const handlePixCopy = () => {
    navigator.clipboard.writeText(pixCode)
    setPixCopied(true)
    setTimeout(() => setPixCopied(false), 2000)
  }

  const handlePixPayment = () => {
    // Simulate PIX payment processing
    onPaymentComplete({
      method: "pix",
      pix_code: pixCode,
      status: "paid",
    })
  }

  const handleCardPayment = () => {
    // Simulate card payment processing
    onPaymentComplete({
      method: paymentMethod,
      card_last_digits: cardData.number.slice(-4),
      card_holder: cardData.name,
      status: "paid",
    })
  }

  if (paymentMethod === "pix") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Pagamento via PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
              <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">QR Code do PIX</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="pix-code">Código PIX Copia e Cola</Label>
                <div className="flex gap-2 mt-1">
                  <Input id="pix-code" value={pixCode} readOnly className="font-mono text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePixCopy}
                    className="flex-shrink-0 bg-transparent"
                  >
                    {pixCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-2">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Abra o app do seu banco</li>
                  <li>Escaneie o QR Code ou cole o código PIX</li>
                  <li>Confirme o pagamento</li>
                  <li>Aguarde a confirmação automática</li>
                </ol>
              </div>

              <Button
                onClick={handlePixPayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isProcessing ? "Processando..." : "Simular Pagamento PIX"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {paymentMethod === "credit_card" ? "Cartão de Crédito" : "Cartão de Débito"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="card-number">Número do Cartão</Label>
              <Input
                id="card-number"
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
                  if (value.length <= 19) {
                    setCardData({ ...cardData, number: value })
                  }
                }}
                maxLength={19}
              />
            </div>

            <div>
              <Label htmlFor="card-name">Nome no Cartão</Label>
              <Input
                id="card-name"
                placeholder="JOÃO DA SILVA"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="card-expiry">Validade</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 4) {
                      const formatted = value.replace(/(\d{2})(\d{0,2})/, "$1/$2").replace(/\/$/, "")
                      setCardData({ ...cardData, expiry: formatted })
                    }
                  }}
                  maxLength={5}
                />
              </div>

              <div>
                <Label htmlFor="card-cvv">CVV</Label>
                <Input
                  id="card-cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 4) {
                      setCardData({ ...cardData, cvv: value })
                    }
                  }}
                  maxLength={4}
                />
              </div>
            </div>

            {paymentMethod === "credit_card" && (
              <div>
                <Label htmlFor="installments">Parcelas</Label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x de R$ {totalAmount.toFixed(2).replace(".", ",")} sem juros</SelectItem>
                    <SelectItem value="2">
                      2x de R$ {(totalAmount / 2).toFixed(2).replace(".", ",")} sem juros
                    </SelectItem>
                    <SelectItem value="3">
                      3x de R$ {(totalAmount / 3).toFixed(2).replace(".", ",")} sem juros
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex gap-1">
                <Image
                  src="/placeholder.svg?height=24&width=38"
                  alt="Visa"
                  width={38}
                  height={24}
                  className="rounded"
                />
                <Image
                  src="/placeholder.svg?height=24&width=38"
                  alt="Mastercard"
                  width={38}
                  height={24}
                  className="rounded"
                />
                <Image src="/placeholder.svg?height=24&width=38" alt="Elo" width={38} height={24} className="rounded" />
              </div>
              <span>Cartões aceitos</span>
            </div>

            <Button
              onClick={handleCardPayment}
              disabled={isProcessing || !cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isProcessing ? "Processando..." : `Pagar R$ ${totalAmount.toFixed(2).replace(".", ",")}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
