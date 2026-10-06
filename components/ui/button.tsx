import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08766f] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#08766f] text-white shadow-sm hover:bg-[#065c56]",
        navy: "bg-[#0d2a3d] text-white shadow-sm hover:bg-[#173f56]",
        outline: "border border-[#c7d4d6] bg-white text-[#0d2a3d] hover:border-[#08766f] hover:bg-[#f4f5ff]",
        ghost: "text-[#4d6870] hover:bg-[#e8efef] hover:text-[#0d2a3d]",
        link: "min-h-0 px-0 text-[#08766f] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11",
        sm: "h-9 min-h-9 px-3 text-xs",
        lg: "h-12 px-6",
        icon: "size-10 min-h-10 px-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
