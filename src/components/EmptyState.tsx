import { Ticket } from '@phosphor-icons/react'

interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Ticket className="text-primary" size={48} />
      </div>
      <h2 className="font-space text-2xl font-semibold mb-3">No Coupons Yet</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Start building your digital coupon wallet. Add your first coupon to keep track of all your savings.
      </p>
      <button
        onClick={onAddClick}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 active:scale-95 transition-all"
      >
        Add Your First Coupon
      </button>
    </div>
  )
}
