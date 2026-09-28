import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg border border-[#dfe1f0] bg-white text-[#1b2352] shadow-[0_1px_2px_rgba(7,28,42,.04)]", className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-5 border-b border-[#e0e8e8] px-6 py-5", className)} {...props} />;
}

function CardTitle({ className, children, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("m-0 font-serif text-2xl font-medium text-[#111a4d]", className)} {...props}>{children}</h2>;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm leading-6 text-[#626992]", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ml-auto shrink-0", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center border-t border-[#e0e8e8] px-6 py-4", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter };
