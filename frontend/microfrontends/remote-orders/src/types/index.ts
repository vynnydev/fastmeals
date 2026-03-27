// ============================================
// ORDER TYPES
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
  orderId: string
  productId: string
  product_id?: string
  product_name?: string
  quantity: number
  unitPrice: number
  unit_price?: number
  subtotal: number
  total_price?: number
  createdAt?: string
}

export interface Order {
  id: string
  order_number?: string
  customerName: string
  customer_name?: string
  customerPhone: string
  customer_phone?: string
  customer_email?: string
  deliveryAddress: string
  delivery_address?: string
  latitude: number
  longitude: number
  delivery_lat?: number
  delivery_lng?: number
  items: OrderItem[]
  totalAmount: number
  total?: number
  subtotal?: number
  delivery_fee?: number
  status: OrderStatus
  deliveryPersonId: string | null
  delivery_person_id?: string | null
  delivery_person_name?: string
  notes?: string
  createdAt: string
  updatedAt: string
  created_at?: string
  updated_at?: string
  payment_method?: PaymentMethod
  payment_status?: PaymentStatus
  estimated_delivery_time?: string
  actual_delivery_time?: string
}

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'pix'
  | 'cash'
  | 'voucher'

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'

export interface OrderCreateRequest {
  customerName: string
  customerPhone: string
  deliveryAddress: string
  latitude: number
  longitude: number
  items: {
    productId: string
    quantity: number
  }[]
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus
}

// ============================================
// PRODUCT TYPES (needed for order creation)
// ============================================

export type ProductCategory = 'meal' | 'drink' | 'dessert' | 'side'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory | string
  imageUrl: string | null
  image_url?: string | null
  isAvailable: boolean
  is_available?: boolean
  preparationTime: number
  preparation_time?: number
  createdAt: string
  updatedAt: string
  created_at?: string
  updated_at?: string
}

// ============================================
// DELIVERY PERSON TYPES (needed for order assignment)
// ============================================

export type VehicleType = 'bicycle' | 'motorcycle' | 'car'
export type DeliveryPersonStatus = 'available' | 'busy' | 'offline' | 'on_break'

export interface DeliveryPerson {
  id: string
  name: string
  phone: string
  email?: string
  vehicleType: VehicleType
  vehicle_type?: VehicleType
  status: DeliveryPersonStatus
  isActive: boolean
  is_active?: boolean
  currentOrderId: string | null
  totalDeliveries?: number
  total_deliveries?: number
  rating?: number
  average_rating?: number
  createdAt: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

// ============================================
// UI TYPES
// ============================================

export type ViewMode = 'table' | 'cards' | 'kanban' | 'grid'

export interface ApiError {
  error: {
    code: string
    message: string
  }
  message?: string
  details?: Record<string, string[]>
}