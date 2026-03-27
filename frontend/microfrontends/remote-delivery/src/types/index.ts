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
// ORDER TYPES (needed for optimization and kanban)
// ============================================

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'

export interface Order {
  id: string
  order_number?: string
  customerName: string
  customer_name?: string
  customerPhone: string
  customer_phone?: string
  deliveryAddress: string
  delivery_address?: string
  latitude: number
  longitude: number
  items: any[]
  totalAmount: number
  total?: number
  status: OrderStatus
  deliveryPersonId: string | null
  delivery_person_id?: string | null
  delivery_person_name?: string
  createdAt: string
  updatedAt: string
  created_at?: string
  updated_at?: string
}

// ============================================
// OPTIMIZATION TYPES
// ============================================

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
  order_address?: string
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
// UI TYPES
// ============================================

export type ViewMode = 'cards' | 'kanban'

export interface ApiError {
  error: {
    code: string
    message: string
  }
  message?: string
}