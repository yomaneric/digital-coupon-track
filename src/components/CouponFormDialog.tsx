import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Storefront, Tag, Link, Calendar, Ticket, Plus, Trash } from '@phosphor-icons/react'
import type { Coupon, CouponFormData, CouponVariant } from '@/lib/types'

interface CouponFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CouponFormData) => void
  initialData?: Coupon
  isEdit?: boolean
}

interface VariantFormData {
  code: string
  url: string
  expirationDate: string
}

export function CouponFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEdit = false,
}: CouponFormDialogProps) {
  const [merchant, setMerchant] = useState('')
  const [value, setValue] = useState('')
  const [variants, setVariants] = useState<VariantFormData[]>([
    { code: '', url: '', expirationDate: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && initialData) {
      setMerchant(initialData.merchant || '')
      setValue(initialData.value || '')
      
      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(
          initialData.variants.map(v => ({
            code: v.code || '',
            url: v.url || '',
            expirationDate: v.expiresAt 
              ? new Date(v.expiresAt).toISOString().split('T')[0]
              : ''
          }))
        )
      } else {
        setVariants([{ code: '', url: '', expirationDate: '' }])
      }
    } else if (open && !initialData) {
      setMerchant('')
      setValue('')
      setVariants([{ code: '', url: '', expirationDate: '' }])
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!merchant.trim() || !value.trim()) return

    const hasAtLeastOneVariant = variants.some(v => v.code.trim() || v.url.trim())
    if (!hasAtLeastOneVariant) return

    setIsSubmitting(true)

    const couponVariants: CouponVariant[] = variants
      .filter(v => v.code.trim() || v.url.trim())
      .map(v => {
        const variant: CouponVariant = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        }
        
        if (v.code.trim()) variant.code = v.code.trim()
        if (v.url.trim()) variant.url = v.url.trim()
        
        if (v.expirationDate) {
          const date = new Date(v.expirationDate)
          date.setHours(23, 59, 59, 999)
          variant.expiresAt = date.getTime()
        }
        
        return variant
      })

    const formData: CouponFormData = {
      merchant: merchant.trim(),
      value: value.trim(),
      variants: couponVariants,
    }

    onSubmit(formData)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setMerchant('')
      setValue('')
      setVariants([{ code: '', url: '', expirationDate: '' }])
      onOpenChange(false)
    }, 100)
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const addVariant = () => {
    setVariants([...variants, { code: '', url: '', expirationDate: '' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length === 1) return
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index: number, field: keyof VariantFormData, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const hasAtLeastOneVariant = variants.some(v => v.code.trim() || v.url.trim())

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-space text-xl">
            {isEdit ? 'Edit Coupon' : 'Add New Coupon'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
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

            <div className="space-y-1.5">
              <Label htmlFor="value" className="text-xs font-medium flex items-center gap-1.5">
                <Tag size={14} weight="bold" className="text-accent" />
                Value
              </Label>
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="20% OFF or $10 OFF"
                required
                className="h-9 font-mono"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Coupon Codes / URLs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="h-7 text-xs"
                >
                  <Plus size={14} weight="bold" className="mr-1" />
                  Add Another
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-3 border border-border rounded-lg bg-muted/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        Code #{index + 1}
                      </span>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash size={14} weight="bold" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`code-${index}`}
                        className="text-xs font-medium flex items-center gap-1.5"
                      >
                        <Ticket size={12} weight="bold" className="text-muted-foreground" />
                        Coupon Code
                      </Label>
                      <Input
                        id={`code-${index}`}
                        value={variant.code}
                        onChange={(e) => updateVariant(index, 'code', e.target.value)}
                        placeholder="SAVE20"
                        className="h-8 font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`url-${index}`}
                        className="text-xs font-medium flex items-center gap-1.5"
                      >
                        <Link size={12} weight="bold" className="text-muted-foreground" />
                        URL
                      </Label>
                      <Textarea
                        id={`url-${index}`}
                        value={variant.url}
                        onChange={(e) => updateVariant(index, 'url', e.target.value)}
                        placeholder="https://example.com/coupon"
                        className="min-h-[50px] font-mono text-xs resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`expiration-${index}`}
                        className="text-xs font-medium flex items-center gap-1.5"
                      >
                        <Calendar size={12} weight="bold" className="text-muted-foreground" />
                        Expires
                      </Label>
                      <Input
                        id={`expiration-${index}`}
                        type="date"
                        value={variant.expirationDate}
                        onChange={(e) => updateVariant(index, 'expirationDate', e.target.value)}
                        min={getTodayDate()}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border mt-4">
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
              disabled={isSubmitting || !merchant.trim() || !value.trim() || !hasAtLeastOneVariant}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
