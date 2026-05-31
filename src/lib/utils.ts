import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ExpirationStatus, Coupon } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpirationStatus(expiresAt?: number): ExpirationStatus {
  if (!expiresAt) return 'valid'
  
  const now = Date.now()
  const timeUntilExpiration = expiresAt - now
  const daysUntilExpiration = timeUntilExpiration / (1000 * 60 * 60 * 24)
  
  if (timeUntilExpiration <= 0) return 'expired'
  if (daysUntilExpiration <= 7) return 'expiring-soon'
  return 'valid'
}

export function formatExpirationDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  })
}

export function getCouponExpirationStatus(coupon: Coupon): ExpirationStatus {
  if (!coupon.variants || coupon.variants.length === 0) return 'valid'
  
  const statuses = coupon.variants.map(variant => getExpirationStatus(variant.expiresAt))
  
  if (statuses.includes('expired') && statuses.every(s => s === 'expired')) return 'expired'
  if (statuses.includes('expiring-soon')) return 'expiring-soon'
  if (statuses.includes('valid')) return 'valid'
  
  return 'expired'
}
