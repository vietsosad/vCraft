"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ZONES, type Role, type ZoneLink } from "./zones";
import { LogoMark } from "./logo";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";

type ShellUser = { name: string; email: string; role: Role; status: string };

/** Nền thanh bên của từng khu: mỗi vai trò một màu men chiếm trọn mảng. */
const SIDEBAR: Record<Role, { aside: string; active: string; idle: string; badge: string; sub: string }> = {
  BUYER: { aside: "tile-lam text-giay", active: "bg-giay text-[#163a73]", idle: "text-giay/80 hover:bg-giay/10 hover:text-giay", badge: "bg-lua text-[#121823]", sub: "text-giay/60" },
  ARTISAN: { aside: "tile-dat text-giay", active: "bg-giay text-[#84391a]", idle: "text-giay/80 hover:bg-giay/10 hover:text-giay", badge: "bg-[#fffdf8] text-[#84391a]", sub: "text-giay/60" },
  ADMIN: { aside: "bg-dem text-giay", active: "bg-[#2f5c4d] text-giay", idle: "text-giay/70 hover:bg-giay/8 hover:text-giay", badge: "bg-[#8fc7b1] text-[#121823]", sub: "text-giay/50" },
};

function isActive(pathname: string, l: ZoneLink) {
  return l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
}

/**
 * Khung làm việc riêng của mỗi vai trò (không dùng chung đầu trang triển lãm):
 * thanh bên màu men của khu trên máy tính, thanh tab dưới đáy trên điện thoại (bấm một tay).
 */
export function ZoneShell({
  user,
  subtitle,
  badges = {},
  banner,
  children,
}: {
  user: ShellUser;
  subtitle?: string;
  badges?: Record<string, number>;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const zone = ZONES[user.role];
  const style = SIDEBAR[user.role];
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  const tabs = zone.tabs.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const current = zone.nav.find((l) => isActive(pathname, l));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      {/* Thanh bên (máy tính) */}
      <aside className={cn("sticky top-[var(--demo-h)] hidden h-[calc(100dvh-var(--demo-h))] flex-col lg:flex", style.aside)} aria-label={zone.name}>
        <div className="flex min-w-0 items-center gap-3 px-5 pb-5 pt-6">
          <Link href={zone.home} className="group flex min-w-0 items-center gap-3">
            <span className="rounded-[7px] bg-giay/95 p-[3px] shadow-soft transition-transform duration-500 group-hover:-rotate-6">
              <LogoMark tone={zone.tone} className="size-9" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-display text-[1.35rem]">{zone.name}</span>
              <span className={cn("block truncate text-xs", style.sub)}>{subtitle ?? zone.roleLabel}</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Điều hướng khu làm việc">
          <ul className="space-y-0.5">
            {zone.nav.map((l) => {
              const active = isActive(pathname, l);
              const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
              return (
                <li key={l.href} className="relative">
                  {active && (
                    <motion.span layoutId={`zone-active-${user.role}`} className={cn("absolute inset-0 rounded-[var(--radius-tile)] shadow-soft", style.active)} transition={{ type: "spring", stiffness: 460, damping: 38 }} aria-hidden />
                  )}
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn("relative flex min-h-11 items-center gap-3 rounded-[var(--radius-tile)] px-3 text-[14.5px] font-medium transition-colors", active ? style.active.split(" ").filter((c) => c.startsWith("text-")).join(" ") : style.idle)}
                  >
                    <l.icon className="size-[18px] shrink-0" aria-hidden />
                    <span className="flex-1">{l.label}</span>
                    {count > 0 && <span className={cn("grid min-w-6 place-items-center rounded-[4px] px-1.5 text-[11px] font-bold leading-5", style.badge)}>{count}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-giay/10 px-4 py-3">
          <Link href="/" className={cn("inline-flex items-center gap-2 rounded-[var(--radius-tile)] px-2 py-2 text-sm", style.idle)}>
            <Globe className="size-4" /> Trang triển lãm
          </Link>
          <ThemeToggle className="text-giay/80 hover:bg-giay/10 hover:text-giay" />
        </div>
      </aside>

      {/* Vùng làm việc */}
      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-[var(--demo-h)] z-40 border-b border-vua bg-nga/88 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href={zone.home} className="lg:hidden" aria-label={zone.name}>
                <LogoMark tone={zone.tone} className="size-9" />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-tro lg:hidden">{zone.name}</p>
                <p className="truncate font-semibold">{current?.label ?? zone.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle className="lg:hidden" />
              <NotificationBell />
              <UserMenu user={user} showSiteLink />
            </div>
          </div>
        </header>
        {banner}
        <main id="main" className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pt-8 lg:pb-12">
          <div className="mx-auto max-w-6xl animate-rise">{children}</div>
        </main>
      </div>

      {/* Thanh tab dưới đáy (điện thoại): vùng bấm 56px cho thao tác một tay */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-vua bg-su/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden" aria-label="Điều hướng nhanh">
        <ul className="grid grid-cols-6">
          {tabs.map((l) => {
            const active = isActive(pathname, l);
            const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
            return (
              <li key={l.href}>
                <Link href={l.href} aria-current={active ? "page" : undefined} className={cn("relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium", active ? "text-muc" : "text-tro")}>
                  {active && <motion.span layoutId={`tab-${user.role}`} className={cn("absolute inset-x-3 top-0 h-[3px] rounded-b-[2px]", ZONE_BAR[user.role])} aria-hidden />}
                  <span className="relative">
                    <l.icon className="size-5" aria-hidden />
                    {count > 0 && <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-[3px] bg-datnung px-0.5 text-[9px] font-bold leading-4 text-on">{count}</span>}
                  </span>
                  {l.short ?? l.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={() => setMore(true)} className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium text-tro" aria-expanded={more}>
              <MoreHorizontal className="size-5" aria-hidden /> Thêm
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {more && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-dem/50" aria-label="Đóng" onClick={() => setMore(false)} />
            <motion.div
              role="dialog"
              aria-label="Tất cả mục"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 rounded-t-[14px] border-t border-vua bg-vua p-1.5 pb-[calc(env(safe-area-inset-bottom)+6px)]"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <p className="font-semibold">{zone.name}</p>
                <button onClick={() => setMore(false)} className="grid size-10 place-items-center" aria-label="Đóng"><X className="size-5" /></button>
              </div>
              <ul className="grid grid-cols-3 gap-1.5">
                {[...zone.nav, { href: "/", label: "Trang triển lãm", icon: Globe } as ZoneLink].map((l, i) => (
                  <motion.li key={l.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 + i * 0.025, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={l.href} className={cn("tile flex h-24 flex-col justify-between bg-su p-3 text-sm font-medium", isActive(pathname, l) && cn(SIDEBAR[user.role].aside))}>
                      <l.icon className="size-5" aria-hidden />
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ZONE_BAR: Record<Role, string> = { BUYER: "bg-lam", ARTISAN: "bg-datnung", ADMIN: "bg-ngoc" };
