import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ExpirationStatus } from "./types"

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
  const diffTime = timestamp - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'Expired'
  } else if (diffDays === 0) {
    return 'Expires today'
  } else if (diffDays === 1) {
    return 'Expires tomorrow'
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`
  } else {
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    })
  }
}
