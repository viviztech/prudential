import Link from "next/link";
import { FileCheck2, Inbox, LayoutDashboard, LogOut, Settings2, ShieldCheck } from "lucide-react";
import { getAdminUser } from "../admin-user";
import { chatGPTSignOutPath } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser("/admin");
  const links = [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Enquiries", "/admin/enquiries", Inbox],
    ["Certificates", "/admin/certificates", FileCheck2],
    ["Certificate settings", "/admin/settings", Settings2],
  ] as const;
  const logoutHref = import.meta.env.DEV ? "/login?signed_out=1" : chatGPTSignOutPath("/login?signed_out=1");

  return (
    <main className="admin-shell min-h-screen bg-[#edf2f2] lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="admin-sidebar hidden min-h-screen flex-col bg-[#071c2a] px-5 py-7 text-white lg:flex">
        <Link className="flex items-center gap-3 px-2" href="/">
          <span className="grid size-11 place-items-center rounded-br-2xl bg-[#e0a63a] font-serif text-2xl text-[#0d2a3d]">P</span>
          <span><strong className="block font-serif text-xl font-medium">Prudential</strong><small className="mt-0.5 block text-[9px] uppercase tracking-[.16em] text-[#8fa8b3]">Admin workspace</small></span>
        </Link>
        <nav className="mt-12 !grid gap-1 text-sm">
          {links.map(([label, href, Icon]) => <Link className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[#b9c8ce] transition hover:bg-white/8 hover:text-white" href={href} key={href}><Icon className="size-4" />{label}</Link>)}
          <Link className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-5 text-[#b9c8ce] transition hover:text-white" href="/verify"><ShieldCheck className="size-4" />Public verification</Link>
        </nav>
        <div className="mt-auto border-t border-white/10 px-3 pt-5"><span className="block text-[9px] uppercase tracking-[.14em] text-[#76909b]">Signed in as</span><strong className="mt-1.5 block truncate text-xs">{user.displayName}</strong><a className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#77cfc4] hover:text-white" href={logoutHref}><LogOut className="size-3.5" />Log out</a></div>
      </aside>
      <header className="admin-mobile-header flex items-center justify-between bg-[#071c2a] px-4 py-3 text-white lg:hidden"><Link className="font-serif text-lg" href="/admin">Prudential Admin</Link><nav className="!flex gap-1">{links.slice(0, 3).map(([label, href, Icon]) => <Link className="grid size-10 place-items-center rounded-md text-[#b9c8ce] hover:bg-white/10 hover:text-white" href={href} aria-label={label} key={href}><Icon className="size-4" /></Link>)}</nav></header>
      <section className="admin-main min-w-0 p-4 sm:p-6 lg:p-9">{children}</section>
    </main>
  );
}
