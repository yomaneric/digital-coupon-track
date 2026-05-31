const { app } = require('@azure/functions')
const { TableClient, RestError } = require('@azure/data-tables')
const { normalizeWalletCode, isValidWalletCode } = require('../walletCode')

// One Azure Table holds every wallet. Each wallet is a single entity:
//   PartitionKey = normalized wallet code (e.g. "ME62C6")
//   RowKey       = ROW_KEY (constant; one coupon set per wallet)
//   coupons      = JSON-serialized Coupon[] array
//   updatedAt    = last write time (ms) for simple last-write-wins semantics
const TABLE_NAME = process.env.COUPONS_TABLE_NAME || 'coupons'
const ROW_KEY = 'wallet'

let tableClientPromise

/**
 * Lazily create (and ensure existence of) the Table client. Reused across
 * invocations within the same worker.
 */
function getTableClient() {
  if (!tableClientPromise) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
    if (!connectionString) {
      return Promise.reject(new Error('AZURE_STORAGE_CONNECTION_STRING is not configured'))
    }
    const client = TableClient.fromConnectionString(connectionString, TABLE_NAME)
    tableClientPromise = client
      .createTable()
      .catch(() => {
        // Table already exists (or a benign race) — ignore and keep going.
      })
      .then(() => client)
      .catch((err) => {
        // Reset so a later request can retry provisioning.
        tableClientPromise = undefined
        throw err
      })
  }
  return tableClientPromise
}

function jsonResponse(status, body) {
  return {
    status,
    jsonBody: body,
    headers: { 'Cache-Control': 'no-store' },
  }
}

async function handleGet(client, walletCode) {
  try {
    const entity = await client.getEntity(walletCode, ROW_KEY)
    let coupons = []
    try {
      const parsed = JSON.parse(entity.coupons || '[]')
      if (Array.isArray(parsed)) coupons = parsed
    } catch {
      coupons = []
    }
    return jsonResponse(200, { walletCode, coupons, updatedAt: entity.updatedAt })
  } catch (err) {
    if (err instanceof RestError && err.statusCode === 404) {
      // Unknown wallet => empty wallet, not an error.
      return jsonResponse(200, { walletCode, coupons: [] })
    }
    throw err
  }
}

async function handlePut(request, client, walletCode, context) {
  let body
  try {
    body = await request.json()
  } catch {
    return jsonResponse(400, { error: 'Request body must be valid JSON' })
  }

  const coupons = body && Array.isArray(body.coupons) ? body.coupons : null
  if (!coupons) {
    return jsonResponse(400, { error: 'Request body must include a "coupons" array' })
  }

  const serialized = JSON.stringify(coupons)
  // Azure Table string properties are limited to 64 KiB; guard against oversized payloads.
  if (Buffer.byteLength(serialized, 'utf8') > 64 * 1024) {
    return jsonResponse(413, { error: 'Coupon wallet is too large to store' })
  }

  const updatedAt = Date.now()
  await client.upsertEntity(
    {
      partitionKey: walletCode,
      rowKey: ROW_KEY,
      coupons: serialized,
      updatedAt,
    },
    'Replace',
  )

  context.log(`Saved ${coupons.length} coupons for wallet ${walletCode}`)
  return jsonResponse(200, { walletCode, coupons, updatedAt })
}

async function couponsHandler(request, context) {
  // Always normalize + validate the wallet code server-side; never trust the client.
  const walletCode = normalizeWalletCode(request.params.walletCode || '')
  if (!isValidWalletCode(walletCode)) {
    return jsonResponse(400, { error: 'Invalid wallet code' })
  }

  let client
  try {
    client = await getTableClient()
  } catch (err) {
    context.error('Coupon storage is not configured', err)
    return jsonResponse(500, { error: 'Coupon storage is not configured' })
  }

  try {
    if (request.method === 'GET') {
      return await handleGet(client, walletCode)
    }
    return await handlePut(request, client, walletCode, context)
  } catch (err) {
    context.error('Coupon request failed', err)
    return jsonResponse(500, { error: 'Failed to process coupon request' })
  }
}

app.http('coupons', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'coupons/{walletCode}',
  handler: couponsHandler,
})

module.exports = { couponsHandler }
