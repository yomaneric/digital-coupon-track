const WALLET_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateWalletCode(): string {
  const randomValues = crypto.getRandomValues(new Uint8Array(6))
  return Array.from(randomValues)
    .map((value) => WALLET_CHARSET[value % WALLET_CHARSET.length])
    .join('')
}

export function normalizeWalletCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function isValidWalletCode(code: string): boolean {
  return /^[A-HJKMNPQRSTUVWXYZ2-9]{6}$/.test(code)
}
