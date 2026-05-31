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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-space text-2xl">
            {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="merchant" className="text-sm font-medium flex items-center gap-2">
              <Storefront size={16} weight="bold" className="text-primary" />
              Merchant Name
            </Label>
            <Input
              id="merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Amazon, Starbucks, Best Buy"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value" className="text-sm font-medium flex items-center gap-2">
              <Tag size={16} weight="bold" className="text-accent" />
              Coupon Value
            </Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 20% OFF, $10 OFF, SAVE25"
              required
              className="h-11 font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration" className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} weight="bold" className="text-muted-foreground" />
              Expiration Date (Optional)
            </Label>
            <Input
              id="expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={getTodayDate()}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Set when this coupon expires to get reminders.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium flex items-center gap-2">
              <Ticket size={16} weight="bold" className="text-muted-foreground" />
              Coupon Code (Optional)
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., SAVE20, PROMO2024"
              className="h-11 font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter a coupon code if applicable.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
              <Link size={16} weight="bold" className="text-muted-foreground" />
              URL (Optional)
            </Label>
            <Textarea
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://example.com/coupon"
              className="min-h-[80px] font-mono text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to generate a QR code.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
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
