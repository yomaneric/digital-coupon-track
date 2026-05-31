// Wallet-code helpers shared by the API.
// These rules MUST stay in sync with the client implementation in
// src/lib/wallet.ts so that the same code always maps to the same storage key.

const WALLET_CODE_PATTERN = /^[A-HJKMNPQRSTUVWXYZ2-9]{6}$/

/**
 * Normalize raw user/URL input into the canonical wallet-code form:
 * trimmed, uppercased, with any non-alphanumeric characters removed.
 * @param {string} input
 * @returns {string}
 */
function normalizeWalletCode(input) {
  if (typeof input !== 'string') return ''
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Validate that a (already normalized) wallet code is well formed.
 * @param {string} code
 * @returns {boolean}
 */
function isValidWalletCode(code) {
  return WALLET_CODE_PATTERN.test(code)
}

module.exports = { normalizeWalletCode, isValidWalletCode }
