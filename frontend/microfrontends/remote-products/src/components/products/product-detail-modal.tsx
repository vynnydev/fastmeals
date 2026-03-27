import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  Tag,
  DollarSign,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  canWrite?: boolean
}

const categoryLabels: Record<string, string> = {
  meal: 'Refeição',
  drink: 'Bebida',
  dessert: 'Sobremesa',
  side: 'Acompanhamento',
}

const categoryColors: Record<string, string> = {
  meal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  drink: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dessert: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  side: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  canWrite = false,
}: ProductDetailModalProps) {
  if (!product) return null

  const imageUrl = product.imageUrl || product.image_url
  const isAvailable = product.isAvailable ?? product.is_available
  const prepTime = product.preparationTime || product.preparation_time || 0
  const category = product.category || 'meal'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 border-border max-w-2xl p-0 overflow-hidden">
        <div className="relative w-full h-64 bg-muted/30">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              'text-xs',
              isAvailable
                ? 'bg-emerald-500/90 text-white'
                : 'bg-destructive/90 text-white'
            )}>
              {isAvailable ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Disponível</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Indisponível</>
              )}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <DialogHeader className="p-0">
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
          </DialogHeader>

          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                <Badge variant="outline" className={cn('mt-1 text-xs', categoryColors[category])}>
                  <Tag className="h-3 w-3 mr-1" />
                  {categoryLabels[category] || category}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-amber-400">
                {formatCurrency(product.price)}
              </p>
            </div>
          </div>

          <Separator className="bg-border" />

          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description || 'Sem descrição disponível.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Preparo</p>
                <p className="text-sm font-semibold">{prepTime} min</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Preço</p>
                <p className="text-sm font-semibold">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                className="flex-1 gap-2"
                onClick={() => { onOpenChange(false); onEdit?.(product) }}
              >
                <Edit className="h-4 w-4" />
                Editar Produto
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive gap-2"
                onClick={() => { onOpenChange(false); onDelete?.(product) }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}