import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Wallet } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import type { Coupon, CouponFormData } from '@/lib/types'
import { CouponCard } from '@/components/CouponCard'
import { CouponFormDialog } from '@/components/CouponFormDialog'
import { CouponDetailsDialog } from '@/components/CouponDetailsDialog'
import { EmptyState } from '@/components/EmptyState'

function App() {
  const [coupons, setCoupons] = useKV<Coupon[]>('coupons', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const handleAddCoupon = (data: CouponFormData) => {
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setCoupons((current) => [newCoupon, ...(current || [])])
    toast.success('Coupon added successfully!')
  }

  const handleUpdateCoupon = (data: CouponFormData) => {
    if (!editingCoupon) return
    
    setCoupons((current) =>
      (current || []).map((coupon) =>
        coupon.id === editingCoupon.id
          ? { ...coupon, ...data, updatedAt: Date.now() }
          : coupon
      )
    )
    toast.success('Coupon updated successfully!')
    setEditingCoupon(null)
  }

  const handleDeleteCoupon = (id: string) => {
    setCoupons((current) => (current || []).filter((coupon) => coupon.id !== id))
    toast.success('Coupon deleted')
  }

  const handleCardClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setIsDetailsOpen(true)
  }

  const handleEditClick = () => {
    if (selectedCoupon) {
      setEditingCoupon(selectedCoupon)
      setIsDetailsOpen(false)
      setIsFormOpen(true)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setTimeout(() => {
      setEditingCoupon(null)
    }, 200)
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="text-primary" size={24} weight="bold" />
            </div>
            <h1 className="font-space text-2xl font-bold">Coupon Wallet</h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg"
            aria-label="Add coupon"
          >
            <Plus size={24} weight="bold" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-6">
        {!coupons || coupons.length === 0 ? (
          <EmptyState onAddClick={() => setIsFormOpen(true)} />
        ) : (
          <div className="space-y-3 pt-4">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onClick={() => handleCardClick(coupon)}
                onDelete={() => handleDeleteCoupon(coupon.id)}
              />
            ))}
          </div>
        )}
      </main>

      <CouponFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={editingCoupon ? handleUpdateCoupon : handleAddCoupon}
        initialData={editingCoupon || undefined}
        isEdit={!!editingCoupon}
      />

      <CouponDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        coupon={selectedCoupon}
        onEdit={handleEditClick}
      />
    </div>
  )
}

export default App