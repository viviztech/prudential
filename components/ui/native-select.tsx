import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("h-11 w-full rounded-md border border-[#cbd8da] bg-white px-3.5 text-sm text-[#18303d] shadow-sm outline-none transition focus:border-[#0f9a8b] focus:ring-2 focus:ring-[#0f9a8b]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select>;
}

export { NativeSelect };
