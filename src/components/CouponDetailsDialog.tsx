import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PencilSimple, LinkSimple, Storefront, Tag } from '@phosphor-icons/react'
import type { Coupon } from '@/lib/types'
import { QRCodeGenerator } from './QRCodeGenerator'

interface CouponDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coupon: Coupon | null
  onEdit: () => void
}

export function CouponDetailsDialog({
  open,
  onOpenChange,
  coupon,
  onEdit,
}: CouponDetailsDialogProps) {
  if (!coupon) return null

  const handleLinkClick = () => {
    if (!coupon.url) return
    
    if (coupon.url.startsWith('http://') || coupon.url.startsWith('https://')) {
      window.open(coupon.url, '_blank', 'noopener,noreferrer')
    }
  }

  const isValidUrl = coupon.url && (coupon.url.startsWith('http://') || coupon.url.startsWith('https://'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-space text-2xl">Coupon Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Storefront size={16} weight="bold" />
                <span className="font-medium">Merchant</span>
              </div>
              <p className="font-space text-xl font-semibold">{coupon.merchant}</p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Tag size={16} weight="bold" />
                <span className="font-medium">Value</span>
              </div>
              <p className="font-mono text-2xl font-bold text-accent">{coupon.value}</p>
            </div>

            {coupon.url && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <LinkSimple size={16} weight="bold" />
                    <span className="font-medium">Coupon Code</span>
                  </div>
                  <div className="flex items-center justify-center bg-white p-4 rounded-lg">
                    <QRCodeGenerator value={coupon.url} size={200} />
                  </div>
                  <p className="mt-3 text-sm font-mono break-all bg-muted p-3 rounded-lg">
                    {coupon.url}
                  </p>
                  {isValidUrl && (
                    <Button
                      onClick={handleLinkClick}
                      variant="outline"
                      className="w-full mt-3"
                    >
                      <LinkSimple size={18} weight="bold" className="mr-2" />
                      Open Link
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button onClick={onEdit} className="flex-1">
              <PencilSimple size={18} weight="bold" className="mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
