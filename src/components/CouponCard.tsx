import { motion } from 'framer-motion'
import { Trash, Storefront, Tag, Clock, Warning, Ticket } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Coupon } from '@/lib/types'
import { getExpirationStatus, formatExpirationDate } from '@/lib/utils'
import { useState } from 'react'

interface CouponCardProps {
  coupon: Coupon
  onClick: () => void
  onDelete: () => void
}

export function CouponCard({ coupon, onClick, onDelete }: CouponCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const expirationStatus = getExpirationStatus(coupon.expiresAt)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    setTimeout(() => onDelete(), 200)
  }

  const getStatusColor = () => {
    switch (expirationStatus) {
      case 'expired':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      case 'expiring-soon':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      default:
        return ''
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: 0, x: isDeleting ? -100 : 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="relative mx-4"
    >
      <Card
        onClick={onClick}
        className={`relative overflow-hidden cursor-pointer bg-card border-border hover:border-primary/50 transition-all active:scale-[0.98] p-4 ${
          expirationStatus === 'expired' ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Storefront className="text-primary flex-shrink-0" size={18} weight="bold" />
              <h3 className="font-space font-semibold text-lg truncate">{coupon.merchant}</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="text-accent flex-shrink-0" size={16} weight="bold" />
              <p className="font-mono font-bold text-accent text-xl">{coupon.value}</p>
            </div>
            {coupon.expiresAt && (
              <div className="flex items-center gap-1.5 mt-2">
                {expirationStatus === 'expired' ? (
                  <Warning className="text-destructive flex-shrink-0" size={14} weight="bold" />
                ) : (
                  <Clock className={`flex-shrink-0 ${expirationStatus === 'expiring-soon' ? 'text-amber-400' : 'text-muted-foreground'}`} size={14} weight="bold" />
                )}
                <span className={`text-xs font-medium ${
                  expirationStatus === 'expired' 
                    ? 'text-destructive' 
                    : expirationStatus === 'expiring-soon' 
                    ? 'text-amber-400' 
                    : 'text-muted-foreground'
                }`}>
                  {formatExpirationDate(coupon.expiresAt)}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive active:scale-95 transition-all flex-shrink-0"
          >
            <Trash size={20} weight="bold" />
          </button>
        </div>
        {(coupon.code || coupon.url) && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            {coupon.code && (
              <div className="flex items-center gap-1.5">
                <Ticket className="text-muted-foreground flex-shrink-0" size={12} weight="bold" />
                <p className="text-xs font-mono text-muted-foreground truncate">{coupon.code}</p>
              </div>
            )}
            {coupon.url && (
              <p className="text-xs text-muted-foreground truncate">{coupon.url}</p>
            )}
          </div>
        )}
        {expirationStatus !== 'valid' && (
          <div className={`absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-l-transparent ${
            expirationStatus === 'expired' 
              ? 'border-t-destructive/40' 
              : 'border-t-amber-500/40'
          }`} />
        )}
      </Card>
    </motion.div>
  )
}
