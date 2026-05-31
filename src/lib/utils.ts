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
  
  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  })
}
