/* eslint-disable @next/next/no-img-element */
import Link from "@/components/native-link";
import { ExternalLink, FileCheck2, Inbox, LayoutDashboard, LogOut, Settings2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "../admin-user";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { isSelfHostedAuthEnabled } from "../admin-user";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser("/admin");
  const links = [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Enquiries", "/admin/enquiries", Inbox],
    ["Certificates", "/admin/certificates", FileCheck2],
    ["Certificate settings", "/admin/settings", Settings2],
  ] as const;
  const logoutHref = isSelfHostedAuthEnabled()
    ? "/api/auth/logout"
    : process.env.NODE_ENV === "development" ? "/login?signed_out=1" : chatGPTSignOutPath("/login?signed_out=1");

  return (
    <main className="admin-shell min-h-screen bg-[#f4f5fb] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="admin-sidebar hidden min-h-screen flex-col border-r border-white/10 bg-[#0a1033] px-4 py-5 text-white lg:flex">
        <Link className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/5" href="/">
          <span className="relative size-11 overflow-hidden rounded-xl border border-white/20 bg-white shadow-lg shadow-black/10"><img className="absolute left-1/2 top-0 h-[64px] w-[64px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>
          <span><strong className="block font-serif text-xl font-medium">Prudential</strong><small className="mt-1 block text-[9px] font-bold uppercase tracking-[.16em] text-[#b5b9e8]">Admin workspace</small></span>
        </Link>
        <div className="mt-8 px-3"><Badge className="bg-white/8 text-[#c8ccff]">Operations</Badge></div>
        <nav className="mt-4 !grid gap-1 text-sm">
          {links.map(([label, href, Icon]) => <Link className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[#c3c7e5] transition hover:bg-white/8 hover:text-white" href={href} key={href}><span className="grid size-8 place-items-center rounded-lg bg-white/5 transition group-hover:bg-[#202eff]"><Icon className="size-4" /></span>{label}</Link>)}
          <Link className="mt-4 flex items-center gap-3 border-t border-white/10 px-3 pt-6 text-[#b9c8ce] transition hover:text-white" href="/verify"><span className="grid size-8 place-items-center rounded-lg bg-white/5"><ShieldCheck className="size-4" /></span>Public verification<ExternalLink className="ml-auto size-3.5" /></Link>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4"><span className="block text-[9px] font-bold uppercase tracking-[.14em] text-[#9298c8]">Signed in as</span><strong className="mt-2 block truncate text-sm">{user.displayName}</strong><Button asChild variant="ghost" size="sm" className="mt-3 w-full justify-start px-0 text-[#c8ccff] hover:bg-transparent hover:text-white"><a href={logoutHref}><LogOut />Log out</a></Button></div>
      </aside>
      <header className="admin-mobile-header flex items-center justify-between border-b border-white/10 bg-[#0a1033] px-4 py-3 text-white lg:hidden"><Link className="flex items-center gap-2 font-serif text-lg" href="/admin"><span className="relative size-8 overflow-hidden rounded-lg bg-white"><img className="absolute left-1/2 top-0 h-[47px] w-[47px] max-w-none -translate-x-1/2 object-cover object-top" src="/ps-logo.jpg" alt="" /></span>Prudential Admin</Link><nav className="!flex gap-1">{links.slice(0, 3).map(([label, href, Icon]) => <Link className="grid size-10 place-items-center rounded-lg text-[#c3c7e5] hover:bg-white/10 hover:text-white" href={href} aria-label={label} key={href}><Icon className="size-4" /></Link>)}</nav></header>
      <section className="admin-main min-w-0 p-4 sm:p-7 lg:p-10 xl:p-12">{children}</section>
    </main>
  );
}
