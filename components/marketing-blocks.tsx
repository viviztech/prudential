import type { ReactNode } from "react";
import Link from "@/components/native-link";
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
    <Badge variant="outline" className="mb-5 border-[#c4ddd6] bg-[#f3faf8] text-[#086b65]">{eyebrow}</Badge>
    <h2 className="text-balance font-serif text-4xl font-medium tracking-[-.035em] text-[#0d2a3d] sm:text-5xl lg:text-6xl">{title}</h2>
    {description ? <p className="mt-5 text-base leading-8 text-[#68709a] sm:text-lg">{description}</p> : null}
  </div>;
}

export function StandardCard({ item, compact = false }: { item: PublicCertification; compact?: boolean }) {
  return <Link href={`/certifications/${item.slug}`} className="group block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#08766f]"><Card className="flex h-full flex-col overflow-hidden rounded-2xl border-[#d6e4df] shadow-none transition-[transform,border-color,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:border-[#dfc07b] group-hover:shadow-[0_18px_48px_rgba(13,42,61,.08)]">
    <CardHeader className="border-0 pb-2">
      <div>
        <Badge>{item.code}</Badge>
        <CardTitle className={cn("mt-5 text-2xl", compact ? "sm:text-2xl" : "sm:text-3xl")}>{item.name}</CardTitle>
      </div>
      <CardAction><ArrowRight className="size-5 text-[#8ca0a6] transition-transform group-hover:translate-x-1 group-hover:text-[#08766f]" aria-hidden="true" /></CardAction>
    </CardHeader>
    <CardContent className="flex-1 pt-2"><CardDescription className="m-0 text-sm leading-7">{item.purpose}</CardDescription></CardContent>
    <CardFooter className="border-0 pt-0"><span className="inline-flex items-center gap-2 text-sm font-semibold text-[#086b65] underline-offset-4 group-hover:underline">Read the guide <ArrowRight className="size-4" aria-hidden="true" /></span></CardFooter>
  </Card></Link>;
}

export function MarketingCta({ eyebrow, title, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: { eyebrow: string; title: string; description: string; primaryHref: string; primaryLabel: string; secondaryHref?: string; secondaryLabel?: string }) {
  return <MarketingShell className="py-20 sm:py-24">
    <Card className="overflow-hidden rounded-3xl border-0 bg-[#0d2a3d] text-white shadow-[0_30px_80px_rgba(7,28,42,.2)]">
      <CardContent className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16">
        <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative max-w-3xl"><Badge className="bg-white/10 text-[#c4ddd6]">{eyebrow}</Badge><h2 className="mt-6 text-balance font-serif text-4xl font-medium tracking-[-.035em] sm:text-5xl">{title}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-[#b8c8ce]">{description}</p></div>
        <div className="relative flex flex-wrap gap-3"><Button asChild size="lg"><Link href={primaryHref}>{primaryLabel}<ArrowRight /></Link></Button>{secondaryHref && secondaryLabel ? <Button asChild size="lg" variant="outline"><Link href={secondaryHref}>{secondaryLabel}</Link></Button> : null}</div>
      </CardContent>
    </Card>
  </MarketingShell>;
}
