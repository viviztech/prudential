import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return <select className={cn("h-11 w-full rounded-md border border-[#cdd0e8] bg-white px-3.5 text-sm text-[#1b2352] shadow-sm outline-none transition focus:border-[#202eff] focus:ring-2 focus:ring-[#202eff]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select>;
}

export { NativeSelect };
