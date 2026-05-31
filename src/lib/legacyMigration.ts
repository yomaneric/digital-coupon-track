import type { Coupon } from './types'

// One-time, best-effort import of coupons that were previously stored only in
// this device's browser (via the old Spark useKV persistence) into the shared
// backend. This lets an existing wallet's coupons survive the move to the
// server-backed model instead of appearing empty on the original device.

function extractCouponArray(value: unknown): Coupon[] | null {
  if (Array.isArray(value)) {
    return value as Coupon[]
  }
  // Some persistence layers wrap the stored value, e.g. { value: [...] }.
  if (value && typeof value === 'object') {
    const wrapped = (value as Record<string, unknown>).value
    if (Array.isArray(wrapped)) {
      return wrapped as Coupon[]
    }
  }
  return null
}

/**
 * Search localStorage for coupons previously saved under this wallet code and
 * return them if found. Returns null when nothing usable is present. Never
 * throws — migration is best-effort and must not break app startup.
 */
export function readLegacyLocalCoupons(walletCode: string): Coupon[] | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  const needle = `coupons-${walletCode}`

  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key || !key.includes(needle)) continue

      const raw = window.localStorage.getItem(key)
      if (!raw) continue

      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        continue
      }

      const coupons = extractCouponArray(parsed)
      if (coupons && coupons.length > 0) {
        return coupons
      }
    }
  } catch {
    return null
  }

  return null
}
