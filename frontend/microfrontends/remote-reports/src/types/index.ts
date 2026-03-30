// ============================================
// ORDER TYPES (needed for fallback calculations)
// ============================================

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: string
  productId: string
  product_id?: string
  product_name?: string
  productName?: string
  quantity: number
  unitPrice: number
  unit_price?: number
  subtotal: number
  total_price?: number
}

export interface Order {
  id: string
  customerName: string
  customer_name?: string
  items: OrderItem[]
  totalAmount: number
  total?: number
  status: OrderStatus
  createdAt: string
  created_at?: string
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportFilters {
  startDate?: string
  endDate?: string
  start_date?: string
  end_date?: string
  groupBy?: 'day' | 'week' | 'month'
  limit?: number
}

export interface AIInsight {
  summary: string
  recommendations: string[]
  highlights: string[]
  generatedAt: string
  model: string
}

// ============================================
// UI TYPES
// ============================================

export interface ApiError {
  error: {
    code: string
    message: string
  }
  message?: string
}