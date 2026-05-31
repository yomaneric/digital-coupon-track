import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, LockKey } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface PasscodeScreenProps {
  onUnlock: () => void
  storedPasscode: string | null
  onSetPasscode: (passcode: string) => void
}

export function PasscodeScreen({ onUnlock, storedPasscode, onSetPasscode }: PasscodeScreenProps) {
  const [passcode, setPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSettingUp = !storedPasscode

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isSettingUp) {
      if (passcode.length < 4) {
        setError('Passcode must be at least 4 characters')
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        return
      }

      if (passcode !== confirmPasscode) {
        setError('Passcodes do not match')
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        return
      }

      onSetPasscode(passcode)
      onUnlock()
    } else {
      if (passcode === storedPasscode) {
        onUnlock()
      } else {
        setError('Incorrect passcode')
        setIsShaking(true)
        setPasscode('')
        setTimeout(() => setIsShaking(false), 500)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          x: isShaking ? [0, -10, 10, -10, 10, 0] : 0 
        }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              {isSettingUp ? (
                <LockKey className="text-primary" size={40} weight="bold" />
              ) : (
                <Lock className="text-primary" size={40} weight="bold" />
              )}
            </div>
            <h1 className="font-space text-3xl font-bold text-center mb-2">
              {isSettingUp ? 'Set Your Passcode' : 'Enter Passcode'}
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              {isSettingUp 
                ? 'Create a passcode to protect your coupons' 
                : 'Enter your passcode to access your coupons'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium mb-2">
                {isSettingUp ? 'Create Passcode' : 'Passcode'}
              </label>
              <Input
                ref={inputRef}
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder={isSettingUp ? 'Enter passcode (min 4 characters)' : 'Enter your passcode'}
                className="h-12 text-center text-lg font-mono tracking-widest"
                autoComplete="off"
              />
            </div>

            {isSettingUp && (
              <div>
                <label htmlFor="confirm-passcode" className="block text-sm font-medium mb-2">
                  Confirm Passcode
                </label>
                <Input
                  id="confirm-passcode"
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Re-enter passcode"
                  className="h-12 text-center text-lg font-mono tracking-widest"
                  autoComplete="off"
                />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/20 text-destructive text-sm p-3 rounded-lg text-center font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={!passcode || (isSettingUp && !confirmPasscode)}
            >
              {isSettingUp ? 'Set Passcode' : 'Unlock'}
            </Button>
          </form>

          {isSettingUp && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Make sure to remember your passcode. There is no recovery option.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
