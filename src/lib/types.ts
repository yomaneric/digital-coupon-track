export interface Coupon {
  id: string
  merchant: string
  value: string
  url: string
  createdAt: number
  updatedAt: number
}

export type CouponFormData = Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>
