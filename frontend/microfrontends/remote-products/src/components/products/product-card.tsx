import type { Product } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye, Package, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRole } from '@/hooks/use-auth'

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
}

const categoryLabels: Record<string, string> = {
  meal: 'Refeições',
  drink: 'Bebidas',
  dessert: 'Sobremesas',
  side: 'Acompanhamentos',
}

const categoryColors: Record<string, string> = {
  meal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  drink: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dessert: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  side: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export function ProductCard({ product, onEdit, onDelete, onView }: ProductCardProps) {
  const { canWrite } = useRole()
  const isAvailable = product.isAvailable ?? product.is_available ?? true
  const imageUrl = product.imageUrl || product.image_url
  const category = product.category || 'meal'
  const prepTime = product.preparationTime || product.preparation_time || 0

  return (
    <Card className="group bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video bg-muted/30 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <Badge
            className={isAvailable
              ? 'bg-emerald-500/90 text-white text-xs'
              : 'bg-destructive/90 text-white text-xs'
            }
          >
            {isAvailable ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={() => onView?.(product)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              {canWrite && (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(product)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(product)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <Badge
            variant="outline"
            className={categoryColors[category] || 'bg-muted text-muted-foreground'}
          >
            {categoryLabels[category] || category}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description || 'Sem descrição'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {prepTime > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {prepTime} min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}