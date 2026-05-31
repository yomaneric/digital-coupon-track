import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PencilSimple, LinkSimple, Storefront, Tag, Clock, Warning, Ticket, Copy, Stack, CheckCircle, Circle } from '@phosphor-icons/react'
import type { Coupon } from '@/lib/types'
import { getExpirationStatus, formatExpirationDate } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface CouponDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: Coupon | null
  onEdit: () => void
  onToggleUsed: (variantId: string) => void
}

export function CouponDetailsDialog({
  open,
  onOpenChange,
  coupon,
  onEdit,
  onToggleUsed,
}: CouponDetailsDialogProps) {
  if (!coupon) return null

  const handleLinkClick = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied!')
  }

  const handleToggleUsed = (variantId: string, currentlyUsed: boolean) => {
    onToggleUsed(variantId)
    toast.success(
      currentlyUsed ? '✓ Code marked as unused' : '✓ Code marked as used',
      {
        duration: 2000,
        style: {
          fontSize: '15px',
          fontWeight: '600',
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-space text-2xl">Coupon Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mt-2">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Storefront size={16} weight="bold" />
              <span className="font-medium">Merchant</span>
            </div>
            <p className="font-space text-xl font-semibold">{coupon.merchant}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Tag size={16} weight="bold" />
              <span className="font-medium">Value</span>
            </div>
            <p className="font-mono text-2xl font-bold text-accent">{coupon.value}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Stack size={16} weight="bold" />
              <span className="font-medium">Available Codes ({coupon.variants.length})</span>
            </div>

            <div className="space-y-3">
              {coupon.variants.map((variant, index) => {
                const expirationStatus = getExpirationStatus(variant.expiresAt)
                const isValidUrl = variant.url && (variant.url.startsWith('http://') || variant.url.startsWith('https://'))
                const isUsed = variant.used || false

                return (
                  <motion.div
                    key={variant.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { duration: 0.2 }
                    }}
                    className={`p-3 border rounded-lg space-y-3 relative transition-all duration-300 ${
                      isUsed
                        ? 'border-border bg-muted/50 opacity-50'
                        : expirationStatus === 'expired'
                        ? 'border-destructive/30 bg-destructive/5 opacity-60'
                        : expirationStatus === 'expiring-soon'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">
                          Code #{index + 1}
                        </span>
                        <AnimatePresence mode="wait">
                          {isUsed && (
                            <motion.div
                              key="used-badge"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/20 text-green-700 border border-green-500/30"
                            >
                              <CheckCircle size={12} weight="fill" />
                              <span>Used</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {variant.expiresAt && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          expirationStatus === 'expired'
                            ? 'bg-destructive/20 text-destructive'
                            : expirationStatus === 'expiring-soon'
                            ? 'bg-amber-500/20 text-amber-600'
                            : 'bg-green-500/20 text-green-600'
                        }`}>
                          {expirationStatus === 'expired' ? (
                            <Warning size={12} weight="bold" />
                          ) : (
                            <Clock size={12} weight="bold" />
                          )}
                          <span>{formatExpirationDate(variant.expiresAt)}</span>
                        </div>
                      )}
                    </div>

                    {variant.code && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                          <Ticket size={12} weight="bold" />
                          <span className="font-medium">Coupon Code</span>
                        </div>
                        <div className="flex items-center justify-between bg-background p-2.5 rounded-md border border-border">
                          <p className="text-sm font-mono font-bold text-foreground">
                            {variant.code}
                          </p>
                          <Button
                            onClick={() => handleCopyCode(variant.code!)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            <Copy size={14} weight="bold" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {variant.url && (
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                          <LinkSimple size={12} weight="bold" />
                          <span className="font-medium">URL</span>
                        </div>
                        <div className="bg-background p-2 rounded-md border border-border">
                          <p className="text-xs font-mono break-all text-muted-foreground">
                            {variant.url}
                          </p>
                        </div>
                        {isValidUrl && (
                          <Button
                            onClick={() => handleLinkClick(variant.url!)}
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 h-7 text-xs"
                          >
                            <LinkSimple size={14} weight="bold" className="mr-1" />
                            Open Link
                          </Button>
                        )}
                      </div>
                    )}

                    {expirationStatus === 'expired' && (
                      <p className="text-xs text-destructive font-medium">
                        This code has expired and may no longer be valid.
                      </p>
                    )}
                    {expirationStatus === 'expiring-soon' && (
                      <p className="text-xs text-amber-600 font-medium">
                        Use this code soon before it expires!
                      </p>
                    )}

                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={() => handleToggleUsed(variant.id, isUsed)}
                        variant={isUsed ? "outline" : "default"}
                        size="sm"
                        className="w-full h-8 transition-all overflow-hidden"
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isUsed ? (
                            <motion.div
                              key="unused"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center"
                            >
                              <Circle size={14} weight="bold" className="mr-1.5" />
                              Mark as Unused
                            </motion.div>
                          ) : (
                            <motion.div
                              key="used"
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center"
                            >
                              <CheckCircle size={14} weight="bold" className="mr-1.5" />
                              Mark as Used
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border mt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          <Button onClick={onEdit} className="flex-1">
            <PencilSimple size={18} weight="bold" className="mr-2" />
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
