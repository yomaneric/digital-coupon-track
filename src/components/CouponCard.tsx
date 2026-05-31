import { motion } from 'framer-motion'
import { Trash, Storefront, Tag } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import type { Coupon } from '@/lib/types'
import { useState } from 'react'

interface CouponCardProps {
  coupon: Coupon
  onClick: () => void
  onDelete: () => void
}

export function CouponCard({ coupon, onClick, onDelete }: CouponCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    setTimeout(() => onDelete(), 200)
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
        className="relative overflow-hidden cursor-pointer bg-card border-border hover:border-primary/50 transition-all active:scale-[0.98] p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Storefront className="text-primary flex-shrink-0" size={18} weight="bold" />
              <h3 className="font-space font-semibold text-lg truncate">{coupon.merchant}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="text-accent flex-shrink-0" size={16} weight="bold" />
              <p className="font-mono font-bold text-accent text-xl">{coupon.value}</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive active:scale-95 transition-all flex-shrink-0"
          >
            <Trash size={20} weight="bold" />
          </button>
        </div>
        {coupon.url && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground truncate">{coupon.url}</p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
