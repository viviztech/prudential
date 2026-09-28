import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PublicCertification } from "@/lib/public-certifications";

export function MarketingShell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10", className)}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: { eyebrow: string; title: string; description?: string; align?: "left" | "center" }) {
  return <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
    <Badge variant="outline" className="mb-5 border-[#b8d9d4] bg-[#f3faf8] text-[#08766b]">{eyebrow}</Badge>
    <h2 className="text-balance font-serif text-4xl font-medium tracking-[-.035em] text-[#0d2a3d] sm:text-5xl lg:text-6xl">{title}</h2>
    {description ? <p className="mt-5 text-base leading-8 text-[#61757e] sm:text-lg">{description}</p> : null}
  </div>;
}

export function StandardCard({ item, compact = false }: { item: PublicCertification; compact?: boolean }) {
  return <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border-[#d7e3e2] shadow-none transition duration-200 hover:-translate-y-1 hover:border-[#8dc8c0] hover:shadow-[0_18px_48px_rgba(13,42,61,.08)]">
    <CardHeader className="border-0 pb-2">
      <div>
        <Badge>{item.code}</Badge>
        <CardTitle className={cn("mt-5 text-2xl", compact ? "sm:text-2xl" : "sm:text-3xl")}>{item.name}</CardTitle>
      </div>
      <CardAction><ArrowRight className="size-5 text-[#8ca0a6] transition group-hover:translate-x-1 group-hover:text-[#0f9a8b]" /></CardAction>
    </CardHeader>
    <CardContent className="flex-1 pt-2"><CardDescription className="m-0 text-sm leading-7">{item.purpose}</CardDescription></CardContent>
    <CardFooter className="border-0 pt-0"><Button asChild variant="link"><Link href={`/certifications/${item.slug}`}>Read the guide <ArrowRight /></Link></Button></CardFooter>
  </Card>;
}

export function MarketingCta({ eyebrow, title, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: { eyebrow: string; title: string; description: string; primaryHref: string; primaryLabel: string; secondaryHref?: string; secondaryLabel?: string }) {
  return <MarketingShell className="py-20 sm:py-24">
    <Card className="overflow-hidden rounded-3xl border-0 bg-[#0d2a3d] text-white shadow-[0_30px_80px_rgba(7,28,42,.2)]">
      <CardContent className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16">
        <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative max-w-3xl"><Badge className="bg-white/10 text-[#8fe0d5]">{eyebrow}</Badge><h2 className="mt-6 text-balance font-serif text-4xl font-medium tracking-[-.035em] sm:text-5xl">{title}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#b8c8ce]">{description}</p></div>
        <div className="relative flex flex-wrap gap-3"><Button asChild size="lg"><Link href={primaryHref}>{primaryLabel}<ArrowRight /></Link></Button>{secondaryHref && secondaryLabel ? <Button asChild size="lg" variant="outline"><Link href={secondaryHref}>{secondaryLabel}</Link></Button> : null}</div>
      </CardContent>
    </Card>
  </MarketingShell>;
}
