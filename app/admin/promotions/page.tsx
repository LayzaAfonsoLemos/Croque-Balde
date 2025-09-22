"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign } from "lucide-react"

interface Promotion {
  id: string
  title: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_value: number
  start_date: string
  end_date: string
  active: boolean
  usage_limit: number | null
  usage_count: number
  code: string | null
  created_at: string
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    active: true,
    usage_limit: "",
    code: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error("Error fetching promotions:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as promoções",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const promotionData = {
        title: formData.title,
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_value: Number(formData.min_order_value) || 0,
        start_date: formData.start_date,
        end_date: formData.end_date,
        active: formData.active,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        code: formData.code || null,
      }

      if (editingPromotion) {
        const { error } = await supabase.from("promotions").update(promotionData).eq("id", editingPromotion.id)

        if (error) throw error

        toast({
          title: "Promoção atualizada",
          description: "A promoção foi atualizada com sucesso",
        })
      } else {
        const { error } = await supabase.from("promotions").insert([promotionData])

        if (error) throw error

        toast({
          title: "Promoção criada",
          description: "A promoção foi criada com sucesso",
        })
      }

      setIsDialogOpen(false)
      setEditingPromotion(null)
      resetForm()
      fetchPromotions()
    } catch (error: any) {
      console.error("Error saving promotion:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a promoção",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      title: promotion.title,
      description: promotion.description || "",
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value.toString(),
      min_order_value: promotion.min_order_value.toString(),
      start_date: promotion.start_date.split("T")[0],
      end_date: promotion.end_date.split("T")[0],
      active: promotion.active,
      usage_limit: promotion.usage_limit?.toString() || "",
      code: promotion.code || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta promoção?")) return

    try {
      const { error } = await supabase.from("promotions").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Promoção excluída",
        description: "A promoção foi excluída com sucesso",
      })

      fetchPromotions()
    } catch (error) {
      console.error("Error deleting promotion:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a promoção",
        variant: "destructive",
      })
    }
  }

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase.from("promotions").update({ active }).eq("id", id)

      if (error) throw error

      setPromotions(promotions.map((p) => (p.id === id ? { ...p, active } : p)))

      toast({
        title: active ? "Promoção ativada" : "Promoção desativada",
        description: `A promoção foi ${active ? "ativada" : "desativada"} com sucesso`,
      })
    } catch (error) {
      console.error("Error toggling promotion:", error)
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da promoção",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "",
      start_date: "",
      end_date: "",
      active: true,
      usage_limit: "",
      code: "",
    })
  }

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData({ ...formData, code })
  }

  const isPromotionExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date()
    const start = new Date(promotion.start_date)
    const end = new Date(promotion.end_date)
    return promotion.active && now >= start && now <= end
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promoções</h1>
            <p className="text-gray-600">Gerencie cupons de desconto e ofertas especiais</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPromotion ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
                <DialogDescription>
                  {editingPromotion ? "Edite os dados da promoção" : "Crie uma nova promoção para seus clientes"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Ex: Desconto de Verão"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código do Cupom</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="Ex: VERAO20"
                      />
                      <Button type="button" variant="outline" onClick={generateCode}>
                        Gerar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os detalhes da promoção"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_type">Tipo de Desconto</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value: "percentage" | "fixed") =>
                        setFormData({ ...formData, discount_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">Valor do Desconto</Label>
                    <Input
                      id="discount_value"
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      required
                      placeholder={formData.discount_type === "percentage" ? "20" : "10.00"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
                    <Input
                      id="min_order_value"
                      type="number"
                      step="0.01"
                      value={formData.min_order_value}
                      onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usage_limit">Limite de Uso</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      placeholder="Deixe vazio para ilimitado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data de Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Promoção ativa</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingPromotion ? "Atualizar" : "Criar"} Promoção</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Promotions List */}
        <div className="space-y-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{promotion.title}</CardTitle>
                      <CardDescription>{promotion.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPromotionActive(promotion) ? (
                      <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                    ) : isPromotionExpired(promotion.end_date) ? (
                      <Badge className="bg-red-100 text-red-800">Expirada</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">Inativa</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {promotion.discount_type === "percentage" ? (
                      <Percent className="w-4 h-4 text-gray-500" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-semibold">
                      {promotion.discount_type === "percentage"
                        ? `${promotion.discount_value}%`
                        : `R$ ${promotion.discount_value.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(promotion.start_date).toLocaleDateString("pt-BR")} -{" "}
                      {new Date(promotion.end_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {promotion.code && (
                    <div>
                      <span className="text-sm text-gray-600">Código: </span>
                      <Badge variant="outline">{promotion.code}</Badge>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-600">
                      Usado: {promotion.usage_count}
                      {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={promotion.active}
                      onCheckedChange={(checked) => toggleActive(promotion.id, checked)}
                    />
                    <span className="text-sm text-gray-600">{promotion.active ? "Ativa" : "Inativa"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(promotion.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {promotions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma promoção encontrada</h3>
                <p className="text-gray-600 mb-4">Crie sua primeira promoção para atrair mais clientes</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Promoção
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
