# ✨ Welcome to Your Spark Template!
You've just launched your brand-new Spark Template Codespace — everything’s fired up and ready for you to explore, build, and create with Spark!

This template is your blank canvas. It comes with a minimal setup to help you get started quickly with Spark development.

🚀 What's Inside?
- A clean, minimal Spark environment
- Pre-configured for local development
- Ready to scale with your ideas
  
🧠 What Can You Do?

Right now, this is just a starting point — the perfect place to begin building and testing your Spark applications.

🧹 Just Exploring?
No problem! If you were just checking things out and don’t need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.

---

## 🔗 Cross-device coupon sync (wallet codes)

Coupons are shared across devices by **wallet code**. A wallet code (for example
`ME62C6`) is not just a local label — it is the key under which the coupon set is
stored in a shared backend. Enter the same wallet code on any device and you'll
see the same coupons.

> **Why this matters:** the original app stored coupons in per-device browser
> storage (via Spark's `useKV`). When deployed outside the Spark hosted runtime
> (for example on **Azure Static Web Apps**), that storage never leaves the
> device, so a wallet opened on a second device looked empty. The backend below
> fixes that by persisting coupons server-side, keyed by wallet code.

### Architecture

- **Frontend** (`src/`): React + Vite. Coupons are loaded and saved through
  `src/lib/api.ts` using [`@tanstack/react-query`](https://tanstack.com/query)
  (with optimistic updates). The currently selected wallet code is kept
  per-device; the coupons themselves come from the backend.
- **Backend** (`api/`): an [Azure Functions](https://learn.microsoft.com/azure/azure-functions/)
  app (Node, v4 programming model) deployed automatically by Azure Static Web
  Apps. It exposes:
  - `GET /api/coupons/{walletCode}` — returns the stored coupon array (empty for
    an unknown wallet).
  - `PUT /api/coupons/{walletCode}` — replaces the stored coupon array
    (last-write-wins).
- **Storage**: [Azure Table Storage](https://learn.microsoft.com/azure/storage/tables/),
  one entity per wallet (`PartitionKey` = wallet code).

### Required configuration

The Functions app needs a storage connection string. Set it as an **Application
setting** on the Static Web App (Configuration → Application settings), never in
committed code:

| Setting | Description |
| --- | --- |
| `AZURE_STORAGE_CONNECTION_STRING` | Connection string for the Azure Storage account that holds the `coupons` table. **Required.** |
| `COUPONS_TABLE_NAME` | Optional. Overrides the table name (default `coupons`). |

For local development with the Azure Functions Core Tools, copy
`api/local.settings.json.example` to `api/local.settings.json` and point
`AZURE_STORAGE_CONNECTION_STRING` at [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite)
(`UseDevelopmentStorage=true`) or a real storage account. `local.settings.json`
is gitignored so secrets are never committed.

### Security note

Wallet codes are short (6 characters from a 31-character alphabet, see
`src/lib/wallet.ts`), so they are guessable. Anyone who knows a code can read and
write that wallet — matching the "share the code" UX, but it is **not** a secure
account. Before treating wallets as private, consider rate limiting the API,
using longer/higher-entropy codes, or pairing the code with a secret/PIN. The API
always normalizes and validates the wallet code server-side.

