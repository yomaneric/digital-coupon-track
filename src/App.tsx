import { useState, useMemo, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Plus, Wallet, Robot } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import type { Coupon, CouponFormData, ExpirationStatus } from '@/lib/types'
import { CouponCard } from '@/components/CouponCard'
import { CouponFormDialog } from '@/components/CouponFormDialog'
import { CouponDetailsDialog } from '@/components/CouponDetailsDialog'
import { EmptyState } from '@/components/EmptyState'
import { PasscodeScreen } from '@/components/PasscodeScreen'
import { ChatBot } from '@/components/ChatBot'
import { getCouponExpirationStatus } from '@/lib/utils'

type FilterType = 'all' | ExpirationStatus

function App() {
  const [passcode, setPasscode] = useKV<string | null>('app-passcode', null)
  const [coupons, setCoupons] = useKV<Coupon[]>('coupons', [])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [isChatBotOpen, setIsChatBotOpen] = useState(false)

  useEffect(() => {
    if (coupons && coupons.length > 0) {
      const needsMigration = coupons.some((c: any) => !c.variants)
      if (needsMigration) {
        const migratedCoupons = coupons.map((c: any) => {
          if (c.variants) return c
          
          return {
            id: c.id,
            merchant: c.merchant,
            value: c.value,
            variants: [{
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              code: c.code,
              url: c.url,
              expiresAt: c.expiresAt,
              createdAt: c.createdAt || Date.now(),
            }],
            createdAt: c.createdAt || Date.now(),
            updatedAt: c.updatedAt || Date.now(),
          }
        })
        setCoupons(migratedCoupons)
      }
    }
  }, [])

  const filteredCoupons = useMemo(() => {
    if (!coupons || coupons.length === 0) return []
    if (filter === 'all') return coupons

    return coupons.filter((coupon) => {
      const status = getCouponExpirationStatus(coupon)
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
      const status = getCouponExpirationStatus(coupon)
      counts[status]++
    })

    return counts
  }, [coupons])

  const handleSetPasscode = (newPasscode: string) => {
    setPasscode(newPasscode)
  }

  const handleUnlock = () => {
    setIsUnlocked(true)
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

  const handleToggleUsed = (couponId: string, variantId: string) => {
    setCoupons((current) => {
      const updated = (current || []).map((coupon) =>
        coupon.id === couponId
          ? {
              ...coupon,
              variants: coupon.variants.map((variant) =>
                variant.id === variantId
                  ? {
                      ...variant,
                      used: !variant.used,
                      usedAt: !variant.used ? Date.now() : undefined,
                    }
                  : variant
              ),
              updatedAt: Date.now(),
            }
          : coupon
      )
      
      if (selectedCoupon?.id === couponId) {
        const updatedCoupon = updated.find((c) => c.id === couponId)
        if (updatedCoupon) {
          setSelectedCoupon(updatedCoupon)
        }
      }
      
      return updated
    })
  }

  const handleChatBotAddCoupon = (data: CouponFormData) => {
    handleAddCoupon(data)
  }

  const handleChatBotUpdateCoupon = (id: string, data: CouponFormData) => {
    setCoupons((current) =>
      (current || []).map((coupon) =>
        coupon.id === id
          ? { ...coupon, ...data, updatedAt: Date.now() }
          : coupon
      )
    )
    toast.success('Coupon updated via chatbot!')
  }

  const simplifiedCoupons = useMemo(() => {
    if (!coupons) return []
    return coupons.map(coupon => {
      const firstVariant = coupon.variants?.[0]
      return {
        id: coupon.id,
        merchant: coupon.merchant,
        value: coupon.value,
        code: firstVariant?.code,
        url: firstVariant?.url,
        expiresAt: firstVariant?.expiresAt,
      }
    })
  }, [coupons])

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

  if (!isUnlocked) {
    return (
      <PasscodeScreen
        onUnlock={handleUnlock}
        storedPasscode={passcode ?? null}
        onSetPasscode={handleSetPasscode}
      />
    )
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormOpen(true)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg"
              aria-label="Add coupon"
            >
              <Plus size={24} weight="bold" />
            </button>
          </div>
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
        onToggleUsed={(variantId) => {
          if (selectedCoupon) {
            handleToggleUsed(selectedCoupon.id, variantId)
          }
        }}
      />

      <ChatBot
        isOpen={isChatBotOpen}
        onClose={() => setIsChatBotOpen(false)}
        onAddCoupon={handleChatBotAddCoupon}
        onUpdateCoupon={handleChatBotUpdateCoupon}
        onDeleteCoupon={handleDeleteCoupon}
        coupons={simplifiedCoupons}
      />

      <button
        onClick={() => setIsChatBotOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40"
        aria-label="Open AI Assistant"
      >
        <Robot size={28} weight="bold" />
      </button>
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