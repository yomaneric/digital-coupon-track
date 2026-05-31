export interface CouponVariant {
  id: string
  code?: string
  url?: string
  expiresAt?: number
  createdAt: number
}

export interface Coupon {
  id: string
  merchant: string
  value: string
  variants: CouponVariant[]
  createdAt: number
  updatedAt: number
}

export type CouponFormData = Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>

export type ExpirationStatus = 'valid' | 'expiring-soon' | 'expired'
