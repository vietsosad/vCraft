"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ZONES, type Role, type ZoneLink } from "@/components/layout/zones";
import { LogoMark } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { BrassLabel, CabinetDefs, Pull, SealCount } from "./hardware";

type ShellUser = { name: string; email: string; role: Role; status: string };

const BADGE_LABEL: Record<string, string> = {
  quotes: "đơn đang chờ bạn",
  reviews: "xưởng chờ đánh giá",
  unread: "thư chưa đọc",
};

function isActive(pathname: string, l: ZoneLink) {
  return l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
}

/**
 * Khung "Tủ chè" của khách hàng: hoành phi sơn then trên cùng, hàng mặt ngăn kéo làm điều hướng,
 * mỗi trang con là lòng một ngăn kéo được kéo ra. Trên điện thoại, hàng ngăn kéo xuống đáy màn hình.
 */
export function CabinetShell({ user, badges = {}, children }: { user: ShellUser; badges?: Record<string, number>; children: ReactNode }) {
  const zone = ZONES[user.role];
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  const home = pathname === zone.home;
  const dock = zone.tabs.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const rest = zone.nav.filter((n) => !zone.tabs.includes(n.href));
  const restBadge = rest.reduce((s, l) => s + (l.badgeKey ? badges[l.badgeKey] ?? 0 : 0), 0);
  const restActive = rest.some((l) => isActive(pathname, l));
  const firstName = user.name.split(" ").slice(-1)[0];

  return (
    <div className="grout min-h-dvh [--cell:88px]">
      <CabinetDefs />

      {/* Hoành phi: tấm biển sơn then treo trên tủ */}
      <header className="hoanh-phi lacquer sticky top-[var(--demo-h)] z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href={zone.home} className="group flex min-w-0 items-center gap-3" aria-label="Tủ chè – trang tổng quan của bạn">
            <span className="brass rounded-[6px] p-[4px] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:-rotate-6">
              <span className="block rounded-[3px] bg-giay p-[2px]">
                <LogoMark tone="lam" className="size-8" />
              </span>
            </span>
            <span className="min-w-0 leading-none">
              <span className="block font-display text-[1.45rem] tracking-[0.02em] text-chi-nhat">Tủ chè</span>
              <span className="mt-1 block truncate font-serif text-[0.95rem] italic text-giay/70">của {user.name}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="hidden items-center gap-2 rounded-[var(--radius-tile)] px-3 py-2 text-sm text-giay/75 transition hover:bg-giay/10 hover:text-giay md:inline-flex">
              <Globe className="size-4" aria-hidden /> Trang triển lãm
            </Link>
            <ThemeToggle className="text-giay/80 hover:bg-giay/10 hover:text-giay" />
            <NotificationBell allHref="/account/notifications" buttonClassName="text-giay/85 hover:bg-giay/10! hover:text-giay" />
            <UserMenu
              user={user}
              showSiteLink
              triggerClassName="border-[color-mix(in_srgb,var(--color-chi)_45%,transparent)]! bg-giay/[0.06]! text-giay hover:border-[color-mix(in_srgb,var(--color-chi)_80%,transparent)]!"
              nameClassName="text-giay/70!"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 pb-32 pt-5 md:px-6 md:pt-8 lg:pb-16">
        {/* Nóc tủ và hàng mặt ngăn kéo (máy tính, máy tính bảng ngang) */}
        <nav aria-label="Các ngăn tủ" className="cab-top lacquer hidden px-2.5 pb-3 pt-2 lg:block">
          <div className="hoi-van mx-2 mb-2.5" aria-hidden />
          <ul className="grid grid-cols-8 gap-2">
            {zone.nav.map((l) => {
              const active = isActive(pathname, l);
              const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
              return (
                <li key={l.href}>
                  <Link href={l.href} aria-current={active ? "page" : undefined} className="drawer-face" aria-label={l.exact ? `${l.label} – tổng quan` : undefined}>
                    <BrassLabel>{l.label}</BrassLabel>
                    <Pull />
                    <SealCount value={count} label={`${count} ${BADGE_LABEL[l.badgeKey ?? ""] ?? ""}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main id="main" className={cn(!home && "drawer-box paper-nga px-4 pb-10 pt-7 sm:px-8 lg:mx-5 lg:px-10 lg:pt-9")}>
          {children}
        </main>
      </div>

      {/* Hàng ngăn kéo dưới đáy (điện thoại, máy tính bảng): vùng bấm 58px cho thao tác một tay */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 lg:hidden" aria-label="Các ngăn tủ">
        <div className="lacquer border-t border-[color-mix(in_srgb,var(--color-chi)_55%,transparent)] px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-12px_24px_-16px_rgb(20_12_8/0.7)]">
          <ul className="grid grid-cols-5 gap-1.5">
            {dock.map((l) => {
              const active = isActive(pathname, l);
              const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
              return (
                <li key={l.href}>
                  <Link href={l.href} aria-current={active ? "page" : undefined} className="drawer-face min-h-[58px] gap-1 px-1 pb-1.5 pt-1.5 [&[aria-current=page]]:-translate-y-1.5 [&[aria-current=page]]:scale-100">
                    <Pull className="h-[14px] w-[17px]" />
                    <BrassLabel className="[&>span]:px-1.5 [&>span]:text-[10px]">{l.short ?? l.label}</BrassLabel>
                    <SealCount value={count} label={`${count} ${BADGE_LABEL[l.badgeKey ?? ""] ?? ""}`} />
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={() => setMore(true)}
                aria-expanded={more}
                aria-current={restActive ? "page" : undefined}
                className="drawer-face min-h-[58px] w-full gap-1 px-1 pb-1.5 pt-1.5 [&[aria-current=page]]:-translate-y-1.5 [&[aria-current=page]]:scale-100"
              >
                <Pull className="h-[14px] w-[17px]" />
                <BrassLabel className="[&>span]:px-1.5 [&>span]:text-[10px]">Khác</BrassLabel>
                <SealCount value={restBadge} label={`${restBadge} việc trong các ngăn khác`} />
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <AnimatePresence>
        {more && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-[rgb(20_12_8/0.55)]" aria-label="Đóng" onClick={() => setMore(false)} />
            <motion.div
              role="dialog"
              aria-label="Các ngăn khác của tủ"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="lacquer absolute inset-x-0 bottom-0 rounded-t-[14px] px-2.5 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2"
            >
              <div className="hoi-van mx-2 mb-1" aria-hidden />
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="font-display text-lg text-chi-nhat">Tủ chè của {firstName}</p>
                <button onClick={() => setMore(false)} className="grid size-11 place-items-center text-giay/80" aria-label="Đóng">
                  <X className="size-5" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {[...rest, { href: "/", label: "Trang triển lãm", icon: Globe } as ZoneLink].map((l, i) => {
                  const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
                  return (
                    <motion.li key={l.href} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}>
                      <Link href={l.href} aria-current={isActive(pathname, l) ? "page" : undefined} className="drawer-face min-h-[84px] items-start justify-between px-3.5 py-3 [&[aria-current=page]]:translate-y-0 [&[aria-current=page]]:scale-100">
                        <l.icon className="size-5 text-chi-nhat" aria-hidden />
                        <BrassLabel>{l.label}</BrassLabel>
                        <SealCount value={count} label={`${count} ${BADGE_LABEL[l.badgeKey ?? ""] ?? ""}`} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
