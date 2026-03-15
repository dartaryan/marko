import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9999px] font-semibold whitespace-nowrap transition-all duration-200 ease-in-out outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white border-2 border-[var(--color-emerald-300)] hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] active:bg-primary-active active:translate-y-0",
        destructive:
          "bg-destructive text-white hover:bg-destructive-hover focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:bg-primary-active active:text-white",
        secondary:
          "bg-surface-raised text-foreground border border-border hover:bg-primary-ghost hover:border-primary active:bg-primary-ghost-strong",
        ghost:
          "text-foreground-muted hover:bg-primary-ghost hover:text-primary active:bg-primary-ghost-strong",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5 text-sm has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 px-3 py-1.5 text-[13px] has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-7 py-3 text-base has-[>svg]:px-5 [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-10 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
