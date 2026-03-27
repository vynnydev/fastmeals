// ============================================
// AUTH TYPES
// ============================================

export interface User {
  id: string
  name?: string
  email: string
  role: 'admin' | 'viewer'
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
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
  active?: boolean
  stock?: number
  preparationTime: number
  preparation_time?: number
  createdAt: string
  updatedAt: string
  created_at?: string
  updated_at?: string
}

export interface ProductCreateRequest {
  name: string
  description: string
  price: number
  category: ProductCategory | string
  imageUrl?: string
  isAvailable?: boolean
  preparationTime: number
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {}

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
// DELIVERY PERSON TYPES
// ============================================

export type VehicleType = 'bicycle' | 'motorcycle' | 'car'
export type DeliveryPersonStatus = 'available' | 'busy' | 'offline' | 'on_break'

export interface DeliveryPersonLocation {
  lat: number
  lng: number
}

export interface DeliveryPerson {
  id: string
  name: string
  phone: string
  email?: string
  photoUrl?: string
  vehicleType: VehicleType
  vehicle_type?: VehicleType
  vehiclePlate?: string
  vehicle_plate?: string
  status: DeliveryPersonStatus
  currentLatitude: number | null
  currentLongitude: number | null
  current_lat?: number
  current_lng?: number
  currentLocation?: DeliveryPersonLocation
  isActive: boolean
  is_active?: boolean
  currentOrderId: string | null
  totalDeliveries?: number
  total_deliveries?: number
  activeDeliveries?: number
  rating?: number
  average_rating?: number
  createdAt: string
  updatedAt?: string
  created_at?: string
  updated_at?: string
}

export interface DeliveryPersonCreateRequest {
  name: string
  phone: string
  vehicleType: VehicleType
  currentLatitude?: number
  currentLongitude?: number
}

export interface DeliveryPersonUpdateRequest extends Partial<DeliveryPersonCreateRequest> {}

// ============================================
// DELIVERY TYPES
// ============================================

export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled'

export interface DeliveryAddress {
  street: string
  number: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
}

export interface Delivery {
  id: string
  orderId: string
  deliveryPersonId?: string
  deliveryPersonName?: string
  status: DeliveryStatus
  deliveryAddress?: string | DeliveryAddress
  estimatedTime?: string
  estimatedDeliveryTime?: number
  actualTime?: string
  distance?: number
  priority?: 'low' | 'normal' | 'high'
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// OPTIMIZATION TYPES
// ============================================

export interface OptimizationRequest {
  order_ids?: string[]
  delivery_person_ids?: string[]
}

export interface Assignment {
  orderId: string
  order_id?: string
  deliveryPersonId: string
  delivery_person_id?: string
  deliveryPersonName: string
  delivery_person_name?: string
  estimatedDistanceKm: number
  distance_km?: number
  orderAddress: string
  order_number?: string
  estimated_time_minutes?: number
  priority_score?: number
}

export interface OptimizationResponse {
  assignments: Assignment[]
  unassigned: { orderId: string; orderAddress: string; reason: string }[]
  unassigned_orders?: string[]
  totalDistanceKm: number
  total_distance_km?: number
  algorithm: string
  executionTimeMs: number
  algorithm_execution_time_ms?: number
  timestamp?: string
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
  group_by?: 'day' | 'week' | 'month'
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
  orders_count?: number
}

export interface OrdersByStatusData {
  status: OrderStatus
  count: number
  percentage?: number
}

export interface TopProductData {
  productId: string
  product_id?: string
  productName: string
  product_name?: string
  totalQuantity: number
  quantity_sold?: number
  totalRevenue: number
  revenue?: number
}

export interface DeliveryTimeData {
  averageMinutes: number
  average_time_minutes?: number
  fastestMinutes?: number
  slowestMinutes?: number
  totalDelivered?: number
  byVehicleType?: {
    vehicleType: string
    averageMinutes: number
    count: number
  }[]
}

export interface DashboardMetrics {
  totalOrders: number
  total_orders?: number
  totalRevenue: number
  total_revenue?: number
  pendingOrders?: number
  pending_orders?: number
  averageDeliveryTime?: number
  average_delivery_time?: number
  ordersToday?: number
  orders_today?: number
  revenueToday?: number
  revenue_today?: number
}

export interface AIInsight {
  summary: string
  recommendations: string[]
  highlights: string[]
  generatedAt: string
  model: string
}

export interface ReportSummary {
  revenue: any
  ordersByStatus: any
  topProducts: any
  deliveryTime: any
}

// ============================================
// UI TYPES
// ============================================

export type ViewMode = 'table' | 'cards' | 'kanban' | 'grid'

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  total?: number
  page?: number
  limit?: number
  total_pages?: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
  message?: string
  details?: Record<string, string[]>
}