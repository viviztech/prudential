import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn("min-h-28 w-full resize-y rounded-md border border-[#bbd1cd] bg-white px-3.5 py-3 text-sm text-[#183742] shadow-sm outline-none transition placeholder:text-[#607880] focus:border-[#08766f] focus:ring-2 focus:ring-[#08766f]/15 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

export { Textarea };
