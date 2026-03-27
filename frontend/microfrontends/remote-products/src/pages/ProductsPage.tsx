import { useState, useMemo, useCallback } from 'react'
import { useProducts } from '@/hooks/use-products'
import { useRole } from '@/hooks/use-auth'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard } from '@/components/products/product-card'
import { ProductTable } from '@/components/products/product-table'
import { ProductFormModal } from '@/components/products/product-form-modal'
import { ProductDetailModal } from '@/components/products/product-detail-modal'
import { CardsSkeleton, TableSkeleton } from '@/components/shared/skeleton-loader'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'table'

const categories = [
  { value: 'all', label: 'Todas Categorias' },
  { value: 'meal', label: 'Refeições' },
  { value: 'drink', label: 'Bebidas' },
  { value: 'dessert', label: 'Sobremesas' },
  { value: 'side', label: 'Acompanhamentos' },
]

const statusOptions = [
  { value: 'all', label: 'Todos Status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
]

export default function ProductsPage() {
  const { canWrite } = useRole()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const { products, error, isLoading, fetchProducts, deleteProduct, updateProduct, createProduct } = useProducts()

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(product => {
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(searchLower)
        const matchesDescription = (product.description || '').toLowerCase().includes(searchLower)
        if (!matchesName && !matchesDescription) return false
      }

      if (categoryFilter !== 'all') {
        const productCategory = (product.category || '').toLowerCase()
        if (productCategory !== categoryFilter.toLowerCase()) return false
      }

      const available = product.isAvailable ?? product.is_available
      if (statusFilter === 'active' && !available) return false
      if (statusFilter === 'inactive' && available) return false

      return true
    })
  }, [products, search, categoryFilter, statusFilter])

  const stats = useMemo(() => {
    if (!products) return { total: 0, active: 0 }
    return {
      total: products.length,
      active: products.filter(p => p.isAvailable ?? p.is_available).length,
    }
  }, [products])

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
    setDeleteConfirmOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setDetailModalOpen(true)
  }

  const handleFormSubmit = useCallback(async (data: Partial<Product>) => {
    setIsSubmitting(true)
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data as any)
        toast.success('Produto atualizado com sucesso!')
      } else {
        await createProduct(data as any)
        toast.success('Produto criado com sucesso!')
      }
      setFormModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, updateProduct, createProduct])

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProduct) return
    setIsSubmitting(true)
    try {
      await deleteProduct(selectedProduct.id)
      toast.success('Produto excluído com sucesso!')
      setDeleteConfirmOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedProduct, deleteProduct])

  const clearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
  }

  const hasActiveFilters = search || categoryFilter !== 'all' || statusFilter !== 'all'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu cardápio</p>
        </div>
        {viewMode === 'grid' ? <CardsSkeleton count={8} /> : <TableSkeleton rows={8} />}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu cardápio</p>
        </div>
        <ErrorState
          title="Erro ao carregar produtos"
          message="Não foi possível carregar a lista de produtos."
          onRetry={() => fetchProducts()}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">
            {stats.total} produtos cadastrados • {stats.active} ativos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && canWrite && (
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selectedIds.length})
            </Button>
          )}
          {canWrite && (
            <Button onClick={handleCreate} className="gold-gradient text-primary-foreground">
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
              className={cn('h-9 w-9 rounded-r-none', viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-9 w-9 rounded-l-none', viewMode === 'table' && 'bg-muted')}
              onClick={() => setViewMode('table')}
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
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {categoryFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {statusFilter === 'active' ? 'Ativos' : 'Inativos'}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
            </Badge>
          )}
        </div>
      )}

      {/* Content */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          type={hasActiveFilters ? 'search' : 'products'}
          title={hasActiveFilters ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          description={
            hasActiveFilters
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seu primeiro produto ao cardápio'
          }
          actionLabel={
            canWrite && !hasActiveFilters
              ? 'Adicionar Produto'
              : hasActiveFilters
                ? 'Limpar Filtros'
                : undefined
          }
          onAction={
            canWrite && !hasActiveFilters
              ? handleCreate
              : hasActiveFilters
                ? clearFilters
                : undefined
          }
        />
      ) : viewMode === 'grid' ? (
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

      {/* Form Modal */}
      <ProductFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        isLoading={isSubmitting}
      />

      {/* Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canWrite={canWrite}
      />

      {/* Delete Confirmation */}
      {deleteConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Excluir Produto</h3>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o produto "{selectedProduct.name}"?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}