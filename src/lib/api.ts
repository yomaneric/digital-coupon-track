import type { Coupon } from './types'

// The coupon wallet is persisted by the Azure Functions backend (see /api),
// keyed by wallet code, so the same code resolves to the same coupons on any
// device. These helpers are the single client-side gateway to that backend.

function couponsUrl(walletCode: string): string {
  return `/api/coupons/${encodeURIComponent(walletCode)}`
}

/**
 * Load the coupons stored for a wallet code. Returns an empty array for an
 * unknown/empty wallet. Throws on network or server errors.
 */
export async function fetchCoupons(walletCode: string): Promise<Coupon[]> {
  const response = await fetch(couponsUrl(walletCode), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to load coupons (${response.status})`)
  }

  const data = await response.json()
  return Array.isArray(data?.coupons) ? (data.coupons as Coupon[]) : []
}

/**
 * Persist the full coupon set for a wallet code (last-write-wins replace).
 * Throws on network or server errors so callers can roll back optimistic UI.
 */
export async function saveCoupons(walletCode: string, coupons: Coupon[]): Promise<void> {
  const response = await fetch(couponsUrl(walletCode), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupons }),
  })

  if (!response.ok) {
    throw new Error(`Failed to save coupons (${response.status})`)
  }
}
