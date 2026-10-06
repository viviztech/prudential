"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import Link from "@/components/native-link";

type Props = ComponentProps<typeof Link> & { match?: "exact" | "prefix" };

export function ActiveNavLink({ href, match = "exact", ...props }: Props) {
  const pathname = usePathname() ?? "";
  const active = typeof href === "string" && (match === "prefix"
    ? pathname === href || pathname.startsWith(`${href}/`)
    : pathname === href);

  return <Link href={href} aria-current={active ? "page" : undefined} {...props} />;
}

export function ActiveNavSummary({ section, ...props }: ComponentProps<"summary"> & { section: string }) {
  const pathname = usePathname() ?? "";
  const active = pathname === section || pathname.startsWith(`${section}/`);
  return <summary data-section-current={active ? "true" : undefined} {...props} />;
}
