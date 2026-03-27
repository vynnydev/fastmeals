import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Phone,
  MapPin,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Loader2,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { productsApi, ordersApi } from '@/lib/api'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface OrderCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export function OrderCreateModal({ open, onOpenChange, onSuccess }: OrderCreateModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [searchProduct, setSearchProduct] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      loadProducts()
      setCustomerName('')
      setCustomerPhone('')
      setDeliveryAddress('')
      setCart([])
      setSearchProduct('')
    }
  }, [open])

  const loadProducts = async () => {
    setIsLoadingProducts(true)
    try {
      const data = await productsApi.getAll()
      setProducts(data.filter((p: Product) => p.isAvailable ?? p.is_available))
    } catch {
      toast.error('Erro ao carregar produtos')
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const canSubmit = customerName.trim() && customerPhone.trim() && deliveryAddress.trim() && cart.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await ordersApi.create({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        latitude: -23.5505,
        longitude: -46.6333,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
      toast.success('Pedido criado com sucesso!')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits.length ? `(${digits}` : ''
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Novo Pedido
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e selecione os produtos.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5" />
                  Nome do Cliente
                </Label>
                <Input
                  placeholder="Ex: João Silva"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5" />
                  Telefone
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                Endereço de Entrega
              </Label>
              <Input
                placeholder="Ex: Rua das Flores, 123 - Centro, São Paulo"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>

          <Separator />

          {/* Product Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Produtos
              </h3>
              {cart.length > 0 && (
                <Badge variant="outline" className="text-primary border-primary/30">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </Badge>
              )}
            </div>

            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const inCart = cart.find(item => item.productId === product.id)
                  return (
                    <Card
                      key={product.id}
                      className={cn(
                        'p-3 cursor-pointer transition-all hover:border-primary/50',
                        inCart && 'border-primary/30 bg-primary/5'
                      )}
                      onClick={() => addToCart(product)}
                    >
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-primary font-semibold">{formatCurrency(product.price)}</span>
                        {inCart && (
                          <Badge className="bg-primary/20 text-primary text-xs h-5 px-1.5">
                            {inCart.quantity}x
                          </Badge>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredProducts.length === 0 && !isLoadingProducts && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum produto encontrado
              </p>
            )}
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Carrinho
                </h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} x {item.quantity} = {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="font-semibold">Total do Pedido</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="gap-2 gold-gradient text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Criar Pedido ({formatCurrency(totalAmount)})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}