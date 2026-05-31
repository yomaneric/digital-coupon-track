const WALLET_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const WALLET_PREFIX = 'WALLET'

function randomWalletSegment(length: number): string {
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(randomValues)
    .map((value) => WALLET_CHARSET[value % WALLET_CHARSET.length])
    .join('')
}

export function generateWalletCode(): string {
  return `${WALLET_PREFIX}-${randomWalletSegment(4)}-${randomWalletSegment(4)}`
}

export function normalizeWalletCode(input: string): string {
  const trimmed = input.trim().toUpperCase()

  if (!trimmed) return ''

  const compact = trimmed.replace(/[^A-Z0-9]/g, '')

  if (compact.startsWith(WALLET_PREFIX) && compact.length === WALLET_PREFIX.length + 8) {
    return `${WALLET_PREFIX}-${compact.slice(WALLET_PREFIX.length, WALLET_PREFIX.length + 4)}-${compact.slice(WALLET_PREFIX.length + 4)}`
  }

  if (compact.length === 8) {
    return `${WALLET_PREFIX}-${compact.slice(0, 4)}-${compact.slice(4)}`
  }

  return trimmed.replace(/\s+/g, '')
}

export function isValidWalletCode(code: string): boolean {
  return /^WALLET-[A-HJKMNPQRSTUVWXYZ2-9]{4}-[A-HJKMNPQRSTUVWXYZ2-9]{4}$/.test(code)
}
