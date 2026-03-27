import { Package, ShoppingBag, Users, Truck, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EmptyStateType = 'orders' | 'products' | 'delivery' | 'reports' | 'search' | 'users' | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const icons: Record<EmptyStateType, React.ElementType> = {
  orders: ShoppingBag,
  products: Package,
  delivery: Truck,
  reports: FileText,
  search: Search,
  users: Users,
  generic: Package,
}

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  orders: {
    title: 'Nenhum pedido encontrado',
    description: 'Os pedidos aparecerão aqui assim que forem criados.',
  },
  products: {
    title: 'Nenhum produto cadastrado',
    description: 'Comece adicionando produtos ao seu cardápio.',
  },
  delivery: {
    title: 'Nenhum entregador cadastrado',
    description: 'Adicione entregadores para gerenciar suas entregas.',
  },
  reports: {
    title: 'Sem dados para exibir',
    description: 'Os relatórios aparecerão quando houver dados disponíveis.',
  },
  search: {
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os filtros ou termos de busca.',
  },
  users: {
    title: 'Nenhum entregador encontrado',
    description: 'Adicione entregadores para gerenciar suas entregas.',
  },
  generic: {
    title: 'Nada para exibir',
    description: 'Não há dados disponíveis no momento.',
  },
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = icons[type]
  const content = defaultContent[type]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-muted/50 p-6 mb-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || content.description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gold-gradient text-primary-foreground">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}