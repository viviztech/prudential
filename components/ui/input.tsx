import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("h-11 w-full rounded-md border border-[#cdd0e8] bg-white px-3.5 text-sm text-[#1b2352] shadow-sm outline-none transition placeholder:text-[#9297b5] focus:border-[#202eff] focus:ring-2 focus:ring-[#202eff]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Input };
