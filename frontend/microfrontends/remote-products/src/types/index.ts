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