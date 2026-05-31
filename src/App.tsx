import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Wallet } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import type { Coupon, CouponFormData, ExpirationStatus } from '@/lib/types'
import { CouponCard } from '@/components/CouponCard'
import { CouponFormDialog } from '@/components/CouponFormDialog'
import { CouponDetailsDialog } from '@/components/CouponDetailsDialog'
import { EmptyState } from '@/components/EmptyState'
import { PasscodeScreen } from '@/components/PasscodeScreen'
import { getExpirationStatus } from '@/lib/utils'

type FilterType = 'all' | ExpirationStatus

function App() {
  const [coupons, setCoupons] = useKV<Coupon[]>('coupons', [])
  const [passcode, setPasscode] = useKV<string | null>('app-passcode', null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const handleSetPasscode = (newPasscode: string) => {
    setPasscode(newPasscode)
  }

  const handleUnlock = () => {
    setIsUnlocked(true)
  }

  if (!isUnlocked) {
    return (
      <PasscodeScreen
        onUnlock={handleUnlock}
        storedPasscode={passcode ?? null}
        onSetPasscode={handleSetPasscode}
      />
    )
  }

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

  const filteredCoupons = useMemo(() => {
    if (!coupons || coupons.length === 0) return []
    if (filter === 'all') return coupons

    return coupons.filter((coupon) => {
      const status = getExpirationStatus(coupon.expiresAt)
      return status === filter
    })
  }, [coupons, filter])

  const getCounts = useMemo(() => {
    if (!coupons || coupons.length === 0) {
      return { all: 0, valid: 0, 'expiring-soon': 0, expired: 0 }
    }

    const counts = {
      all: coupons.length,
      valid: 0,
      'expiring-soon': 0,
      expired: 0,
    }

    coupons.forEach((coupon) => {
      const status = getExpirationStatus(coupon.expiresAt)
      counts[status]++
    })

    return counts
  }, [coupons])

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
          <>
            <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
              <div className="flex gap-1 p-2 overflow-x-auto">
                <FilterButton
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                  count={getCounts.all}
                >
                  All
                </FilterButton>
                <FilterButton
                  active={filter === 'valid'}
                  onClick={() => setFilter('valid')}
                  count={getCounts.valid}
                  color="primary"
                >
                  Valid
                </FilterButton>
                <FilterButton
                  active={filter === 'expiring-soon'}
                  onClick={() => setFilter('expiring-soon')}
                  count={getCounts['expiring-soon']}
                  color="warning"
                >
                  Expiring Soon
                </FilterButton>
                <FilterButton
                  active={filter === 'expired'}
                  onClick={() => setFilter('expired')}
                  count={getCounts.expired}
                  color="destructive"
                >
                  Expired
                </FilterButton>
              </div>
            </div>
            
            {filteredCoupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className="text-muted-foreground text-center">
                  No {filter !== 'all' ? filter.replace('-', ' ') : ''} coupons found
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {filteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onClick={() => handleCardClick(coupon)}
                    onDelete={() => handleDeleteCoupon(coupon.id)}
                  />
                ))}
              </div>
            )}
          </>
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

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  count: number
  color?: 'primary' | 'warning' | 'destructive'
  children: React.ReactNode
}

function FilterButton({ active, onClick, count, color = 'primary', children }: FilterButtonProps) {
  const getColorClasses = () => {
    if (!active) return 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
    
    switch (color) {
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
      case 'destructive':
        return 'bg-destructive/20 text-destructive border border-destructive/30'
      default:
        return 'bg-primary text-primary-foreground'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95 whitespace-nowrap ${getColorClasses()}`}
    >
      <span>{children}</span>
      <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
        active 
          ? color === 'warning' 
            ? 'bg-amber-500/30' 
            : color === 'destructive'
            ? 'bg-destructive/30'
            : 'bg-primary-foreground/20'
          : 'bg-background/50'
      }`}>
        {count}
      </span>
    </button>
  )
}

export default App