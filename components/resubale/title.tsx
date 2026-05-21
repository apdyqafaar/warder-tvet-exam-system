import { cn } from "@/lib/utils"

type GradientTitleProps = {
  children: React.ReactNode
  className?: string
}

export function GradientTitle({
  children,
  className,
}: GradientTitleProps) {
  return (
  <h1
  className={cn(
    "bg-gradient-to-r from-foreground via-foreground/30 to-primary bg-clip-text text-transparent",
    "font-bold tracking-tight",
    "text-2xl md:text-4xl",
    className
  )}
>
  {children}
</h1>
  )
}