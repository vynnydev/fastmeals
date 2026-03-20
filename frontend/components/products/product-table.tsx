"use client"

import { Product } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Checkbox } from "@/components/ui/checkbox"

interface ProductTableProps {
  products: Product[]
  selectedIds?: string[]
  onSelectChange?: (ids: string[]) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onView?: (product: Product) => void
}

export function ProductTable({ 
  products, 
  selectedIds = [],
  onSelectChange,
  onEdit, 
  onDelete, 
  onView 
}: ProductTableProps) {
  const { user } = useAuthStore()
  const canWrite = user?.role !== "viewer"

  const categoryColors: Record<string, string> = {
    "Lanches": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Bebidas": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Sobremesas": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "Acompanhamentos": "bg-green-500/20 text-green-400 border-green-500/30",
    "Combos": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange?.(products.map(p => p.id))
    } else {
      onSelectChange?.([])
    }
  }

  const handleSelectOne = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectChange?.([...selectedIds, productId])
    } else {
      onSelectChange?.(selectedIds.filter(id => id !== productId))
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedIds.length === products.length && products.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-muted/20">
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(product.id)}
                  onCheckedChange={(checked) => handleSelectOne(product.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted/30">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {product.description || "Sem descrição"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={categoryColors[product.category] || "bg-muted text-muted-foreground"}
                >
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium text-primary">
                {formatCurrency(product.price)}
              </TableCell>
              <TableCell className="text-center">
                <span className={product.stock && product.stock <= 10 ? "text-destructive font-medium" : ""}>
                  {product.stock ?? "-"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={product.active ? "default" : "secondary"}
                  className={product.active ? "bg-emerald-500/20 text-emerald-400" : ""}
                >
                  {product.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
