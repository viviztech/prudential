/* eslint-disable @next/next/no-img-element */
import Link from "@/components/native-link";
import { ActiveNavLink } from "@/components/active-nav-link";
import { ExternalLink, FileCheck2, LayoutDashboard, LogOut, Palette, Settings2, ShieldCheck, UsersRound, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "../admin-user";
import { can } from "@/db/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser("/admin");
  const links = [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Certificates", "/admin/certificates", FileCheck2],
    ["My account", "/admin/profile", UserRound],
    ...(can(user, "users") ? [["Users", "/admin/users", UsersRound]] as const : []),
    ...(can(user, "settings") ? [["Templates", "/admin/templates", Palette]] as const : []),
    ...(can(user, "settings") ? [["Certificate settings", "/admin/settings", Settings2]] as const : []),
  ] as const;
  const logoutHref = "/api/auth/logout";

  return (
    <main id="main-content" className="admin-shell min-h-screen bg-[#f4f7f6] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="admin-sidebar hidden min-h-screen flex-col border-r border-white/10 bg-[#071d2b] px-4 py-5 text-white lg:flex">
        <Link className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/5" href="/admin">
          <span className="relative size-11 overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg shadow-black/10"><img className="absolute left-1/2 top-0 h-[64px] w-[64px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
          <span><strong className="block font-serif text-xl font-medium">Prudential</strong><small className="mt-1 block text-[9px] font-bold uppercase tracking-[.16em] text-[#aec8c8]">Admin workspace</small></span>
        </Link>
        <div className="mt-8 px-3"><Badge className="bg-white/8 text-[#c4ddd6]">{user.role} workspace</Badge></div>
        <nav className="mt-4 !grid gap-1 text-sm">
          {links.map(([label, href, Icon]) => <ActiveNavLink className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[#bdd1d1] transition hover:bg-white/8 hover:text-white" href={href} match={href === "/admin" ? "exact" : "prefix"} key={href}><span className="grid size-8 place-items-center rounded-lg bg-white/5 transition group-hover:bg-[#08766f]"><Icon className="size-4" aria-hidden="true" /></span>{label}</ActiveNavLink>)}
          <Link className="mt-4 flex items-center gap-3 border-t border-white/10 px-3 pt-6 text-[#b9c8ce] transition hover:text-white" href="/verify"><span className="grid size-8 place-items-center rounded-lg bg-white/5"><ShieldCheck className="size-4" /></span>Public verification<ExternalLink className="ml-auto size-3.5" /></Link>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><span className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#9eb8bb]">Signed in as</span><strong className="mt-2 block truncate text-sm">{user.name}</strong><small className="mt-1 block truncate text-[#9eb8bb]">{user.email}</small><Button asChild variant="ghost" size="sm" className="mt-3 w-full justify-start px-0 text-[#c4ddd6] hover:bg-transparent hover:text-white"><a href={logoutHref}><LogOut />Log out</a></Button></div>
      </aside>
      <header className="admin-mobile-header border-b border-white/10 bg-[#071d2b] px-4 py-3 text-white lg:hidden"><div className="flex items-center justify-between gap-3"><Link className="flex items-center gap-2 font-serif text-lg" href="/admin"><span className="relative size-8 overflow-hidden rounded-lg bg-white"><img className="absolute left-1/2 top-0 h-[47px] w-[47px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>Prudential Admin</Link><a className="rounded-lg px-3 py-2 text-sm text-[#c4ddd6] hover:bg-white/10 hover:text-white" href={logoutHref}>Log out</a></div><nav className="!flex gap-1 overflow-x-auto pt-3">{links.map(([label, href, Icon]) => <ActiveNavLink className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#bdd1d1] hover:bg-white/10 hover:text-white" href={href} match={href === "/admin" ? "exact" : "prefix"} key={href}><Icon className="size-4" aria-hidden="true" />{label}</ActiveNavLink>)}</nav></header>
      <section className="admin-main min-w-0 p-4 sm:p-7 lg:p-10 xl:p-12">{children}</section>
    </main>
  );
}
