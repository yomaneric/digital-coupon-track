import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Storefront, Tag, Link, Calendar, Ticket } from '@phosphor-icons/react'
import type { Coupon, CouponFormData } from '@/lib/types'

interface CouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CouponFormData) => void
  initialData?: Coupon
  isEdit?: boolean
}

export function CouponFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}: CouponFormDialogProps) {
  const [merchant, setMerchant] = useState(initialData?.merchant || '')
  const [value, setValue] = useState(initialData?.value || '')
  const [url, setUrl] = useState(initialData?.url || '')
  const [code, setCode] = useState(initialData?.code || '')
  const [expirationDate, setExpirationDate] = useState(
    initialData?.expiresAt 
      ? new Date(initialData.expiresAt).toISOString().split('T')[0]
      : ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim() || !value.trim()) return

    setIsSubmitting(true)
    const formData: CouponFormData = {
      merchant: merchant.trim(),
      value: value.trim(),
    }

    if (url.trim()) {
      formData.url = url.trim()
    }

    if (code.trim()) {
      formData.code = code.trim()
    }

    if (expirationDate) {
      const date = new Date(expirationDate)
      date.setHours(23, 59, 59, 999)
      formData.expiresAt = date.getTime()
    }

    onSubmit(formData)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setMerchant('')
      setValue('')
      setUrl('')
      setCode('')
      setExpirationDate('')
      onOpenChange(false)
    }, 100)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      setMerchant(initialData?.merchant || '')
      setValue(initialData?.value || '')
      setUrl(initialData?.url || '')
      setCode(initialData?.code || '')
      setExpirationDate(
        initialData?.expiresAt 
          ? new Date(initialData.expiresAt).toISOString().split('T')[0]
          : ''
      )
    }
    onOpenChange(newOpen)
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-3">
          <DialogTitle className="font-space text-xl">
            {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="merchant" className="text-xs font-medium flex items-center gap-1.5">
              <Storefront size={14} weight="bold" className="text-primary" />
              Merchant Name
            </Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Amazon, Starbucks"
              required
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="value" className="text-xs font-medium flex items-center gap-1.5">
                <Tag size={14} weight="bold" className="text-accent" />
                Value
              </Label>
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="20% OFF"
                required
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expiration" className="text-xs font-medium flex items-center gap-1.5">
                <Calendar size={14} weight="bold" className="text-muted-foreground" />
                Expires
              </Label>
              <Input
                id="expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={getTodayDate()}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-medium flex items-center gap-1.5">
              <Ticket size={14} weight="bold" className="text-muted-foreground" />
              Coupon Code <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAVE20"
              className="h-9 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url" className="text-xs font-medium flex items-center gap-1.5">
              <Link size={14} weight="bold" className="text-muted-foreground" />
              URL <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/coupon"
              className="min-h-[60px] font-mono text-xs resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 h-9"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-9"
              disabled={isSubmitting || !merchant.trim() || !value.trim()}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
