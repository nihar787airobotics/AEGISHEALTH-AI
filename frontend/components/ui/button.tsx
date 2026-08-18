import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegis-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-aegis-bg disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-gray-100",
        secondary: "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700",
        ghost: "hover:bg-white/5 text-white",
        gradient:
          "bg-gradient-to-b from-aegis-cyan via-aegis-teal/90 to-aegis-blue/80 text-black font-semibold hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,212,255,0.25)]",
        outline:
          "border border-aegis-cyan/30 bg-aegis-cyan/5 text-aegis-cyan hover:bg-aegis-cyan/15",
        danger: "bg-risk-critical/20 text-risk-critical border border-risk-critical/30 hover:bg-risk-critical/30",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
