"use client"

import { useState, useMemo, useCallback } from "react"
import { useProducts } from "@/hooks/use-products"
import { useAuthStore } from "@/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProductCard } from "@/components/products/product-card"
import { ProductTable } from "@/components/products/product-table"
import { ProductFormModal } from "@/components/products/product-form-modal"
import { CardsSkeleton, TableSkeleton } from "@/components/shared/skeleton-loader"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Package,
  Filter,
  X,
  Trash2,
  Download
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "table"

const categories = [
  { value: "all", label: "Todas Categorias" },
  { value: "Lanches", label: "Lanches" },
  { value: "Bebidas", label: "Bebidas" },
  { value: "Sobremesas", label: "Sobremesas" },
  { value: "Acompanhamentos", label: "Acompanhamentos" },
  { value: "Combos", label: "Combos" },
]

const statusOptions = [
  { value: "all", label: "Todos Status" },
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
]

export default function ProductsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const canWrite = user?.role !== "viewer"

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  
  // Filters
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data fetching
  const { data: products, error, isLoading, mutate } = useProducts({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    search: search || undefined,
  })

  // Filter products locally for status
  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(product => {
      if (statusFilter === "active" && !product.active) return false
      if (statusFilter === "inactive" && product.active) return false
      return true
    })
  }, [products, statusFilter])

  // Stats
  const stats = useMemo(() => {
    if (!products) return { total: 0, active: 0, lowStock: 0 }
    return {
      total: products.length,
      active: products.filter(p => p.active).length,
      lowStock: products.filter(p => p.stock !== undefined && p.stock <= 10).length,
    }
  }, [products])

  // Handlers
  const handleCreate = () => {
    setSelectedProduct(null)
    setFormModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormModalOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setDeleteModalOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    // Could open a view modal here
    toast({
      title: product.name,
      description: `${product.description || 'Sem descrição'} - ${product.category}`,
    })
  }

  const handleFormSubmit = useCallback(async (data: Partial<Product>) => {
    setIsSubmitting(true)
    try {
      if (selectedProduct) {
        // Update product
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Falha ao atualizar produto")
        toast({ title: "Produto atualizado com sucesso!" })
      } else {
        // Create product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Falha ao criar produto")
        toast({ title: "Produto criado com sucesso!" })
      }
      setFormModalOpen(false)
      mutate()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, mutate, toast])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProduct) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Falha ao excluir produto")
      toast({ title: "Produto excluído com sucesso!" })
      setDeleteModalOpen(false)
      mutate()
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, mutate, toast])

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    // Implementation for bulk delete
    toast({
      title: "Exclusão em massa",
      description: `${selectedIds.length} produtos selecionados para exclusão`,
    })
  }

  const handleExport = () => {
    toast({
      title: "Exportar Produtos",
      description: "Funcionalidade de exportação em desenvolvimento",
    })
  }

  const clearFilters = () => {
    setSearch("")
    setCategoryFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = search || categoryFilter !== "all" || statusFilter !== "all"

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu cardápio</p>
          </div>
        </div>
        {viewMode === "grid" ? <CardsSkeleton count={8} /> : <TableSkeleton rows={8} />}
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground">Gerencie seu cardápio</p>
          </div>
        </div>
        <ErrorState 
          title="Erro ao carregar produtos"
          description="Não foi possível carregar a lista de produtos."
          onRetry={() => mutate()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">
            {stats.total} produtos cadastrados • {stats.active} ativos
            {stats.lowStock > 0 && (
              <span className="text-amber-400"> • {stats.lowStock} com estoque baixo</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && canWrite && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selectedIds.length})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {canWrite && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] bg-background">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Limpar
            </Button>
          )}

          <div className="flex items-center border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-r-none",
                viewMode === "grid" && "bg-muted"
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-l-none",
                viewMode === "table" && "bg-muted"
              )}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearch("")}
              />
            </Badge>
          )}
          {categoryFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {categoryFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setCategoryFilter("all")}
              />
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {statusFilter === "active" ? "Ativos" : "Inativos"}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setStatusFilter("all")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={hasActiveFilters ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
          description={
            hasActiveFilters 
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando seu primeiro produto ao cardápio"
          }
          action={
            canWrite && !hasActiveFilters ? (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            ) : hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      {/* Modals */}
      <ProductFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduct?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
