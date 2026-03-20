// ============================================
// AUTH TYPES
// ============================================

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'viewer'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ============================================
// PRODUCT TYPES
// ============================================

export type ProductCategory = 
  | 'burgers'
  | 'pizzas'
  | 'drinks'
  | 'desserts'
  | 'sides'
  | 'combos'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: ProductCategory
  image_url?: string
  is_available: boolean
  preparation_time: number // em minutos
  created_at: string
  updated_at: string
}

export interface ProductCreateRequest {
  name: string
  description: string
  price: number
  category: ProductCategory
  image_url?: string
  is_available?: boolean
  preparation_time: number
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

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

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  notes?: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  delivery_person_id?: string
  delivery_person_name?: string
  created_at: string
  updated_at: string
}

export interface OrderCreateRequest {
  customer_name: string
  customer_phone: string
  customer_email?: string
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  items: {
    product_id: string
    quantity: number
    notes?: string
  }[]
  payment_method: PaymentMethod
  notes?: string
}

export interface OrderStatusUpdateRequest {
  order_id: string
  status: OrderStatus
  notes?: string
}

// ============================================
// DELIVERY PERSON TYPES
// ============================================

export type VehicleType = 'bicycle' | 'motorcycle' | 'car'
export type DeliveryPersonStatus = 'available' | 'busy' | 'offline'

export interface DeliveryPerson {
  id: string
  name: string
  phone: string
  email?: string
  vehicle_type: VehicleType
  vehicle_plate?: string
  status: DeliveryPersonStatus
  current_lat?: number
  current_lng?: number
  is_active: boolean
  total_deliveries: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface DeliveryPersonCreateRequest {
  name: string
  phone: string
  email?: string
  vehicle_type: VehicleType
  vehicle_plate?: string
}

export interface DeliveryPersonUpdateRequest extends Partial<DeliveryPersonCreateRequest> {
  id: string
  status?: DeliveryPersonStatus
  is_active?: boolean
}

// ============================================
// OPTIMIZATION TYPES
// ============================================

export interface OptimizationRequest {
  order_ids?: string[]
  delivery_person_ids?: string[]
}

export interface Assignment {
  order_id: string
  order_number: string
  delivery_person_id: string
  delivery_person_name: string
  distance_km: number
  estimated_time_minutes: number
  priority_score: number
}

export interface OptimizationResponse {
  assignments: Assignment[]
  unassigned_orders: string[]
  total_distance_km: number
  algorithm_execution_time_ms: number
  timestamp: string
}

// ============================================
// REPORT TYPES
// ============================================

export interface ReportFilters {
  start_date: string
  end_date: string
  group_by?: 'day' | 'week' | 'month'
}

export interface RevenueData {
  date: string
  revenue: number
  orders_count: number
}

export interface OrdersByStatusData {
  status: OrderStatus
  count: number
  percentage: number
}

export interface TopProductData {
  product_id: string
  product_name: string
  quantity_sold: number
  revenue: number
}

export interface DeliveryTimeData {
  date: string
  average_time_minutes: number
  min_time: number
  max_time: number
}

export interface DashboardMetrics {
  total_orders: number
  total_revenue: number
  pending_orders: number
  average_delivery_time: number
  orders_today: number
  revenue_today: number
  orders_growth_percent: number
  revenue_growth_percent: number
}

export interface AIInsight {
  type: 'recommendation' | 'highlight' | 'warning'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface ReportSummary {
  period: {
    start_date: string
    end_date: string
  }
  metrics: DashboardMetrics
  revenue_by_day: RevenueData[]
  orders_by_status: OrdersByStatusData[]
  top_products: TopProductData[]
  delivery_times: DeliveryTimeData[]
  ai_insights: AIInsight[]
}

// ============================================
// UI TYPES
// ============================================

export type ViewMode = 'table' | 'cards' | 'kanban'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string[]>
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export type WebSocketEventType = 
  | 'order_created'
  | 'order_updated'
  | 'order_status_changed'
  | 'delivery_assigned'
  | 'delivery_location_updated'

export interface WebSocketMessage {
  event: WebSocketEventType
  data: Order | DeliveryPerson
  timestamp: string
}
