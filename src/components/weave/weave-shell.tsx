"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ZONES, type Role, type ZoneLink } from "@/components/layout/zones";
import { LogoMark } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { HAT_TRANG, ROUTE_HUE, bandVars, edgeUrl } from "./loom";

/** Biên vải đầu trang: răng cưa nâu men trên nền nâu đen, hàng hạt men trắng. */
const SELVAGE_EDGE = edgeUrl("#644b26", HAT_TRANG);

type ShellUser = { name: string; email: string; role: Role; status: string };

const BADGE_LABEL: Record<string, string> = {
  quotes: "đơn đang chờ bạn",
  reviews: "xưởng chờ đánh giá",
  unread: "thư chưa mở",
};

function isActive(pathname: string, l: ZoneLink) {
  return l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
}

function Segment({ l, active, count, compact }: { l: ZoneLink; active: boolean; count: number; compact?: boolean }) {
  const hue = ROUTE_HUE[l.href] ?? "n8";
  return (
    <Link
      href={l.href}
      aria-current={active ? "page" : undefined}
      data-hue={hue}
      style={bandVars(hue) as CSSProperties}
      className={cn("selv", compact ? "min-h-[3.6rem] items-center px-1 pb-2 text-center [&[aria-current=page]]:min-h-[4.1rem]" : "top")}
    >
      <l.icon className={cn("relative size-[18px] opacity-90", compact ? "mx-auto" : "mb-auto")} aria-hidden />
      <span className={cn("nhan relative", compact ? "text-[0.64rem] tracking-[0.06em]" : "text-[0.72rem]")}>{compact ? l.short ?? l.label : l.label}</span>
      {count > 0 && (
        <span className="dem" aria-label={`${count} ${BADGE_LABEL[l.badgeKey ?? ""] ?? ""}`}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

/**
 * Khung "Tấm dệt" của khách hàng: biên vải nâu đen trên cùng, sọc biên tám nấc nâu làm điều hướng
 * (đậm dần sang nhạt theo thứ tự mục, mục đang mở dệt dài hơn); trên điện thoại sọc biên xuống đáy màn hình.
 */
export function WeaveShell({ user, badges = {}, children }: { user: ShellUser; badges?: Record<string, number>; children: ReactNode }) {
  const zone = ZONES[user.role];
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  const dock = zone.tabs.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const rest = zone.nav.filter((n) => !zone.tabs.includes(n.href));
  const restBadge = rest.reduce((s, l) => s + (l.badgeKey ? badges[l.badgeKey] ?? 0 : 0), 0);
  const restActive = rest.some((l) => isActive(pathname, l));
  const firstName = user.name.split(" ").slice(-1)[0];
  const count = (l: ZoneLink) => (l.badgeKey ? badges[l.badgeKey] ?? 0 : 0);

  return (
    <div className="det min-h-dvh pb-24 lg:pb-0">
      {/* Biên vải trên */}
      <header className="selvage-top sticky top-[var(--demo-h)] z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href={zone.home} className="group flex min-w-0 items-center gap-3" aria-label="Tấm dệt – việc của tôi">
            <span className="rounded-[3px] bg-[#fbfaf5] p-[3px] transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:-rotate-3">
              <LogoMark tone="datnung" className="size-8" />
            </span>
            <span className="min-w-0 leading-none">
              <span className="hieu block text-[1.3rem] text-nghe">Tấm dệt</span>
              <span className="mt-1 block truncate text-[0.82rem] text-[#fbfaf5]/70">của {user.name}</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/" className="hidden items-center gap-2 rounded-[3px] px-3 py-2 text-sm text-[#fbfaf5]/75 transition hover:bg-white/10 hover:text-[#fbfaf5] md:inline-flex">
              <Globe className="size-4" aria-hidden /> Trang triển lãm
            </Link>
            <ThemeToggle className="text-[#fbfaf5]/80 hover:bg-white/10 hover:text-[#fbfaf5]" />
            <NotificationBell allHref="/account/notifications" buttonClassName="text-[#fbfaf5]/85 hover:bg-white/10! hover:text-[#fbfaf5]" />
            <UserMenu
              user={user}
              showSiteLink
              triggerClassName="border-white/25! bg-white/[0.06]! text-[#fbfaf5] hover:border-white/60!"
              nameClassName="text-[#fbfaf5]/70!"
            />
          </div>
        </div>
        <div aria-hidden className="h-[15px]" style={{ backgroundImage: SELVAGE_EDGE, backgroundSize: "30px 15px", backgroundColor: "var(--color-mun)" }} />
      </header>

      {/* Sọc biên: tám nấc nâu, tám mục (máy tính) */}
      <nav aria-label="Các mục của tấm dệt" className="relative z-30 hidden lg:block">
        <ul className="grid grid-cols-8">
          {zone.nav.map((l) => (
            <li key={l.href}>
              <Segment l={l} active={isActive(pathname, l)} count={count(l)} />
            </li>
          ))}
        </ul>
      </nav>

      <main id="main" className="relative">
        {children}
      </main>

      {/* Sọc biên dưới đáy (điện thoại, máy tính bảng) */}
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 lg:hidden" aria-label="Các mục của tấm dệt">
        <ul className="grid grid-cols-5 items-end bg-mun pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_24px_-14px_rgb(0_0_0/0.6)]">
          {dock.map((l) => (
            <li key={l.href}>
              <Segment l={l} active={isActive(pathname, l)} count={count(l)} compact />
            </li>
          ))}
          <li>
            <button
              onClick={() => setMore(true)}
              aria-expanded={more}
              aria-current={restActive ? "page" : undefined}
              data-hue="n4"
              style={bandVars("n4") as CSSProperties}
              className="selv min-h-[3.6rem] w-full items-center px-1 pb-2 text-center [&[aria-current=page]]:min-h-[4.1rem]"
            >
              <span className="relative mx-auto grid size-[18px] grid-cols-2 gap-[3px]" aria-hidden>
                <i className="bg-current" /><i className="bg-current opacity-70" /><i className="bg-current opacity-45" /><i className="bg-current opacity-25" />
              </span>
              <span className="nhan relative text-[0.64rem] tracking-[0.06em]">Khác</span>
              {restBadge > 0 && <span className="dem" aria-label={`${restBadge} việc trong các mục khác`}>{restBadge > 9 ? "9+" : restBadge}</span>}
            </button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {more && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-black/55" aria-label="Đóng" onClick={() => setMore(false)} />
            <motion.div
              role="dialog"
              aria-label="Các mục khác"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 bg-mun pb-[env(safe-area-inset-bottom)] text-[#fbfaf5]"
            >
              <div aria-hidden className="h-[15px] -scale-y-100" style={{ backgroundImage: SELVAGE_EDGE, backgroundSize: "30px 15px" }} />
              <div className="flex items-center justify-between px-4 py-2">
                <p className="hieu text-lg text-nghe">Tấm dệt của {firstName}</p>
                <button onClick={() => setMore(false)} className="grid size-11 place-items-center text-[#fbfaf5]/80" aria-label="Đóng">
                  <X className="size-5" />
                </button>
              </div>
              <ul className="grid grid-cols-1">
                {[...rest, { href: "/", label: "Trang triển lãm", icon: Globe } as ZoneLink].map((l, i) => {
                  const hue = ROUTE_HUE[l.href] ?? "n8";
                  const c = count(l);
                  return (
                    <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}>
                      <Link
                        href={l.href}
                        aria-current={isActive(pathname, l) ? "page" : undefined}
                        data-hue={hue}
                        style={bandVars(hue) as CSSProperties}
                        className="band flex min-h-14 items-center gap-3 px-5"
                      >
                        <l.icon className="size-5" aria-hidden />
                        <span className="flex-1 font-semibold">{l.label}</span>
                        {c > 0 && <span className="so bg-[#fbfaf5] px-2 py-1 text-sm text-mun">{c}</span>}
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
