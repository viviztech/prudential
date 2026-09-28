import type { ReactNode } from "react";
import { AlertCircle, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ eyebrow = "Admin workspace", title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"><div className="max-w-3xl"><Badge variant="outline" className="mb-4 border-[#c8ccff] bg-white text-[#1b27d9]">{eyebrow}</Badge><h1 className="m-0 font-serif text-4xl font-medium tracking-[-.035em] text-[#111a4d] sm:text-5xl">{title}</h1><p className="mt-3 text-sm leading-7 text-[#626992] sm:text-base">{description}</p></div>{actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}</header>;
}

export function AdminNotice({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "error" }) {
  const Icon = tone === "success" ? Check : AlertCircle;
  return <div className={cn("mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", tone === "success" ? "border-[#c8ccff] bg-[#f0f2ff] text-[#1b27d9]" : "border-[#efc7c0] bg-[#fff3f1] text-[#9b3e32]")}><Icon className="mt-0.5 size-4 shrink-0" />{children}</div>;
}

export function Field({ label, help, children, className }: { label: string; help?: string; children: ReactNode; className?: string }) {
  return <label className={cn("grid gap-2", className)}><span className="text-xs font-bold text-[#303861]">{label}</span>{children}{help ? <small className="text-xs leading-5 text-[#71848b]">{help}</small> : null}</label>;
}

export function DetailList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return <dl className="grid gap-px overflow-hidden rounded-xl border border-[#e1e3f2] bg-[#e1e3f2]">{items.map((item) => <div className="grid gap-2 bg-white px-5 py-4 sm:grid-cols-[170px_1fr]" key={item.label}><dt className="text-xs font-bold uppercase tracking-wide text-[#7c82a8]">{item.label}</dt><dd className="m-0 text-sm leading-6 text-[#303861]">{item.value}</dd></div>)}</dl>;
}

export function StatusSteps({ steps, activeIndex }: { steps: readonly string[]; activeIndex: number }) {
  return <Card className="mt-7 overflow-hidden rounded-2xl border-[#dfe1f0] shadow-none"><CardContent className="grid grid-cols-5 p-0">{steps.map((step, index) => { const complete = index <= activeIndex; return <div className="relative border-r border-[#e1e3f2] px-2 py-4 text-center last:border-r-0 sm:px-4" key={step}><span className={cn("mx-auto grid size-8 place-items-center rounded-full text-xs font-bold", complete ? "bg-[#202eff] text-white" : "bg-[#e9efee] text-[#85979d]")}>{complete ? <Check className="size-4" /> : index + 1}</span><small className={cn("mt-2 hidden text-[9px] font-bold uppercase tracking-wide sm:block", complete ? "text-[#111a4d]" : "text-[#9297b5]")}>{step.replaceAll("_", " ")}</small></div>; })}</CardContent></Card>;
}
