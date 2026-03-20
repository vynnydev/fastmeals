"use client"

import { Product } from "@/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import Image from "next/image"

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete, onView }: ProductCardProps) {
  const { user } = useAuthStore()
  const canWrite = user?.role !== "viewer"

  const categoryColors: Record<string, string> = {
    "Lanches": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Bebidas": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Sobremesas": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Acompanhamentos": "bg-green-500/20 text-green-400 border-green-500/30",
    "Combos": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  }

  return (
    <Card className="group bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-video bg-muted/30 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Actions overlay */}
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

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 10 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="destructive" className="text-xs">
              {product.stock === 0 ? "Sem estoque" : `${product.stock} unid.`}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          <Badge 
            variant="outline" 
            className={categoryColors[product.category] || "bg-muted text-muted-foreground"}
          >
            {product.category}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {product.description || "Sem descrição"}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {product.preparationTime && (
            <span className="text-xs text-muted-foreground">
              {product.preparationTime} min preparo
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex items-center gap-2 w-full">
          <Badge 
            variant={product.active ? "default" : "secondary"}
            className={product.active ? "bg-emerald-500/20 text-emerald-400" : ""}
          >
            {product.active ? "Ativo" : "Inativo"}
          </Badge>
          {product.stock !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto">
              Estoque: {product.stock}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
