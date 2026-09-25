import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn("h-11 w-full rounded-md border border-[#cbd8da] bg-white px-3.5 text-sm text-[#18303d] shadow-sm outline-none transition placeholder:text-[#8a9ba2] focus:border-[#0f9a8b] focus:ring-2 focus:ring-[#0f9a8b]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Input };
