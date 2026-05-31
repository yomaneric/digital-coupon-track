import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Plus, SignIn, Wallet } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { generateWalletCode, isValidWalletCode, normalizeWalletCode } from '@/lib/wallet'

interface WalletOnboardingProps {
  onWalletSelected: (walletCode: string, options?: { created?: boolean }) => void
}

export function WalletOnboarding({ onWalletSelected }: WalletOnboardingProps) {
  const [joinCode, setJoinCode] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const triggerError = (message: string) => {
    setError(message)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleCreateWallet = () => {
    setError('')
    setCreatedCode(generateWalletCode())
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Wallet code copied!')
  }

  const handleEnterCreatedWallet = () => {
    if (!createdCode) return
    onWalletSelected(createdCode, { created: true })
    toast.success('Wallet created successfully!')
  }

  const handleJoinWallet = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalizedCode = normalizeWalletCode(joinCode)

    if (!normalizedCode) {
      triggerError('Please enter a wallet code')
      return
    }

    if (!isValidWalletCode(normalizedCode)) {
      triggerError('Invalid wallet code format. Try WALLET-XXXX-XXXX')
      return
    }

    onWalletSelected(normalizedCode)
    toast.success('Joined wallet successfully!')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Wallet className="text-primary" size={40} weight="bold" />
            </div>
            <h1 className="font-space text-3xl font-bold mb-2">Coupon Wallet</h1>
            <p className="text-muted-foreground text-sm">
              Create a new wallet or join one with a shared wallet code.
            </p>
          </div>

          <div className="space-y-3">
            <Button type="button" className="w-full h-12 text-base" onClick={handleCreateWallet}>
              <Plus size={18} weight="bold" className="mr-2" />
              Create New Wallet
            </Button>

            {createdCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl border border-primary/40 bg-primary/10 space-y-3"
              >
                <p className="text-xs text-muted-foreground">Your wallet code</p>
                <div className="flex items-center gap-2 rounded-lg bg-background border border-border p-2">
                  <p className="flex-1 text-sm font-mono font-semibold break-all">{createdCode}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCopyCode(createdCode)}
                    aria-label="Copy wallet code"
                  >
                    <Copy size={16} weight="bold" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code to access these coupons on another device.
                </p>
                <Button type="button" className="w-full" onClick={handleEnterCreatedWallet}>
                  Enter Wallet
                </Button>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleJoinWallet} className="space-y-3 pt-2 border-t border-border">
            <label htmlFor="join-wallet" className="block text-sm font-medium">
              Join Existing Wallet
            </label>
            <Input
              id="join-wallet"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="WALLET-XXXX-XXXX"
              className="h-11 font-mono"
              autoComplete="off"
            />
            <Button type="submit" variant="secondary" className="w-full h-11">
              <SignIn size={18} weight="bold" className="mr-2" />
              Join Wallet
            </Button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/20 text-destructive text-sm p-3 rounded-lg text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
