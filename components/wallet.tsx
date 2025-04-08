import { cn } from "@/lib/utils"
import { Card, type CardProps } from "@/components/card"
import { forwardRef } from "react"

const WalletCard = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        "border-purple-200 bg-white shadow-lg",
        "transition-all duration-300 hover:shadow-xl",
        "overflow-hidden",
        className,
      )}
      {...props}
    />
  )
})
WalletCard.displayName = "WalletCard"

export { WalletCard }
