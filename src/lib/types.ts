export interface Coupon {
  id: string
  merchant: string
  value: string
  url?: string
  code?: string
  expiresAt?: number
  createdAt: number
  updatedAt: number
}

export type CouponFormData = Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>

export type ExpirationStatus = 'valid' | 'expiring-soon' | 'expired'
