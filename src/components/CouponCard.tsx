import { motion } from 'framer-motion'
import { Trash, Storefront, Tag, Clock, Warning, Ticket, Stack, CheckCircle } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import type { Coupon } from '@/lib/types'
import { getCouponExpirationStatus, getExpirationStatus, formatExpirationDate } from '@/lib/utils'
import { useState } from 'react'

interface CouponCardProps {
  coupon: Coupon
  onClick: () => void
  onDelete: () => void
}

export function CouponCard({ coupon, onClick, onDelete }: CouponCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const expirationStatus = getCouponExpirationStatus(coupon)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    setTimeout(() => onDelete(), 200)
  }

  const validVariants = coupon.variants.filter(v => getExpirationStatus(v.expiresAt) !== 'expired')
  const expiringSoonVariants = coupon.variants.filter(v => getExpirationStatus(v.expiresAt) === 'expiring-soon')
  const usedVariants = coupon.variants.filter(v => v.used)
  const totalVariants = coupon.variants.length

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
            
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-md">
                <Stack className="text-primary flex-shrink-0" size={14} weight="bold" />
                <span className="text-xs font-bold text-primary">
                  {totalVariants} {totalVariants === 1 ? 'code' : 'codes'}
                </span>
              </div>
              
              {validVariants.length > 0 && (
                <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-md">
                  <span className="text-xs font-medium text-green-600">
                    {validVariants.length} valid
                  </span>
                </div>
              )}
              
              {usedVariants.length > 0 && (
                <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md">
                  <CheckCircle className="text-muted-foreground flex-shrink-0" size={12} weight="fill" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {usedVariants.length} used
                  </span>
                </div>
              )}
              
              {expiringSoonVariants.length > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md">
                  <Warning className="text-amber-500 flex-shrink-0" size={12} weight="bold" />
                  <span className="text-xs font-medium text-amber-600">
                    {expiringSoonVariants.length} expiring soon
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive active:scale-95 transition-all flex-shrink-0"
          >
            <Trash size={20} weight="bold" />
          </button>
        </div>
        {expirationStatus !== 'valid' && expirationStatus === 'expired' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-l-transparent border-t-destructive/40" />
        )}
        {expirationStatus === 'expiring-soon' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-l-transparent border-t-amber-500/40" />
        )}
      </Card>
    </motion.div>
  )
}
