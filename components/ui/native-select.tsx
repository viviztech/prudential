import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("h-11 w-full rounded-md border border-[#bbd1cd] bg-white px-3.5 text-sm text-[#183742] shadow-sm outline-none transition focus:border-[#08766f] focus:ring-2 focus:ring-[#08766f]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select>;
}

export { NativeSelect };
