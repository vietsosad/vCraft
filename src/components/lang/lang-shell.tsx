"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Globe, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ZONES, type Role, type ZoneLink } from "@/components/layout/zones";
import { LogoMark } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { HoiVan } from "./glyphs";
import { LangPress } from "./lang-press";

type ShellUser = { name: string; email: string; role: Role; status: string };

const BADGE_LABEL: Record<string, string> = {
  quotes: "đơn đang chờ bạn",
  reviews: "xưởng chờ bạn đánh giá",
  unread: "thư chưa đọc",
};

function isActive(pathname: string, l: ZoneLink) {
  return l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
}

function Count({ n, kind, className }: { n: number; kind?: string; className?: string }) {
  if (!n) return null;
  return (
    <span className={cn("so-dem", className)}>
      <span aria-hidden>{n > 9 ? "9+" : n}</span>
      <span className="sr-only">{n} {BADGE_LABEL[kind ?? ""] ?? ""}</span>
    </span>
  );
}

/**
 * Vạch men lam dưới mục đang mở: trượt sang mục mới khi chuyển trang; dải cuộn ngang thì cuộn mục mới vào giữa.
 * Không có JavaScript thì vạch tĩnh của CSS (a[aria-current]::after) vẫn hiện.
 */
function NavMarker({ pathname }: { pathname: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const vach = ref.current;
    const nav = vach?.parentElement;
    if (!vach || !nav || typeof ResizeObserver === "undefined") return;
    const place = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active?.offsetWidth) { delete nav.dataset.vach; return; }
      vach.style.setProperty("--x", `${active.offsetLeft + 11}px`);
      vach.style.setProperty("--w", `${Math.max(0, active.offsetWidth - 22)}px`);
      nav.dataset.vach = "";
    };
    place();
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (active && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    }
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [pathname, reduce]);
  return <span ref={ref} aria-hidden className="nav-vach" />;
}

/** Các mục đặt trên đầu trang máy tính (Đánh giá, Hồ sơ nằm trong menu tài khoản và tấm "Khác"). */
const TOP = ["/account", "/account/quotes", "/account/bookings", "/account/favorites", "/account/traces", "/account/notifications"];

/**
 * Khung "Đường làng" của khách hàng: đầu trang ngà có dải hồi văn, sáu điểm dừng làm điều hướng,
 * chân trang ghép viên gốm; trên điện thoại là thanh năm ô dưới đáy (bốn điểm dừng chính và "Khác").
 */
export function LangShell({ user, badges = {}, children }: { user: ShellUser; badges?: Record<string, number>; children: ReactNode }) {
  const zone = ZONES[user.role];
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  const count = (l: ZoneLink) => (l.badgeKey ? badges[l.badgeKey] ?? 0 : 0);
  const top = TOP.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const tabs = zone.tabs.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const rest = zone.nav.filter((n) => !zone.tabs.includes(n.href));
  const restCount = rest.reduce((s, l) => s + count(l), 0);
  const restActive = rest.some((l) => isActive(pathname, l));
  const firstName = user.name.trim().split(/\s+/).at(-1);

  return (
    <div className="lang ui-operate flex min-h-dvh flex-col bg-nga pb-[calc(60px+env(safe-area-inset-bottom))] text-muc lg:pb-0">
      <header className="sticky top-[var(--demo-h)] z-40 border-b border-vua bg-nga/92 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-4 md:px-6">
          <Link href={zone.home} className="group flex min-w-0 items-center gap-3" aria-label={`Đường làng của ${user.name}`}>
            <LogoMark tone="lam" className="size-10 transition-transform duration-500 group-hover:-rotate-6" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-serif text-[1.45rem] font-extrabold giong-ke">v<span className="text-datnung">Craft</span></span>
              <span className="truncate text-[13px] text-tro">Đường làng của {firstName}</span>
            </span>
          </Link>
          <nav aria-label="Các điểm dừng trên đường làng" className="nav-lang ml-2 hidden flex-1 items-center gap-0.5 xl:flex">
            {top.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(pathname, l) ? "page" : undefined}>
                {l.label}
                <Count n={count(l)} kind={l.badgeKey} />
              </Link>
            ))}
            <NavMarker pathname={pathname} />
          </nav>
          <div className="no-print ml-auto flex items-center gap-1">
            <Link href="/" title="Trang triển lãm" className="hidden min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap rounded-[6px] px-2.5 text-sm text-tro hover:bg-nga-dam hover:text-muc md:inline-flex">
              <Globe className="size-[18px]" aria-hidden /> <span className="sr-only 2xl:not-sr-only">Trang triển lãm</span>
            </Link>
            <ThemeToggle />
            <NotificationBell allHref="/account/notifications" initialUnread={badges.unread ?? 0} />
            <UserMenu user={user} showSiteLink />
          </div>
        </div>
        {/* máy tính vừa: dải điểm dừng cuộn ngang dưới đầu trang */}
        <nav aria-label="Các điểm dừng (màn vừa)" className="nav-lang hidden overflow-x-auto border-t border-vua/70 px-4 lg:flex xl:hidden">
          {zone.nav.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(pathname, l) ? "page" : undefined}>
              {l.label}
              <Count n={count(l)} kind={l.badgeKey} />
            </Link>
          ))}
          <NavMarker pathname={pathname} />
        </nav>
        <HoiVan id="lang-hoi-van-dau" className="text-lam opacity-30" />
      </header>

      <main id="main" className="flex-1">{children}</main>
      <LangPress />

      <footer className="bg-dem text-giay">
        <div className="grid grid-cols-6 gap-[6px] bg-vua p-[6px] sm:grid-cols-12" aria-hidden>
          {["tile-lam", "tile-hoavan", "tile-dat", "tile-ran", "tile-ngoc", "tile-sen", "tile-lam", "tile-hoavan", "tile-dat", "tile-ngoc", "tile-ran", "tile-lam"].map((t, i) => (
            <span key={i} className={cn("tile h-12 sm:h-14", t, i >= 6 && "hidden sm:block")} />
          ))}
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-8 md:px-6">
          <p className="font-serif text-[1.4rem] italic giong-ke">“Tinh hoa làng nghề, muôn phương lan tỏa.”</p>
          <p className="max-w-md text-[13px] text-giay/75">Ban quản lý làng gốm Bát Tràng vận hành. Ảnh tác phẩm tách nền từ Wikimedia Commons, mỗi ảnh có tệp ghi nguồn đi kèm.</p>
        </div>
      </footer>

      {/* Thanh đáy điện thoại: năm ô bằng nhau */}
      <nav aria-label="Các điểm dừng" className="no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-vua bg-su/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {tabs.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="tab-lang"
            aria-current={isActive(pathname, l) ? "page" : undefined}
            aria-label={count(l) ? `${l.short ?? l.label}, ${count(l)} ${BADGE_LABEL[l.badgeKey ?? ""] ?? ""}` : undefined}
          >
            <span className="relative">
              <l.icon className="size-[22px]" aria-hidden />
              <Count n={count(l)} kind={l.badgeKey} className="absolute -right-3 -top-2" />
            </span>
            {l.short ?? l.label}
          </Link>
        ))}
        <button
          type="button"
          className="tab-lang"
          onClick={() => setMore(true)}
          aria-expanded={more}
          aria-haspopup="dialog"
          aria-current={restActive ? "page" : undefined}
          aria-label={restCount ? `Khác, ${restCount} việc trong các mục khác` : "Khác"}
        >
          <span className="relative">
            <MoreHorizontal className="size-[22px]" aria-hidden />
            {restCount > 0 && <span className="so-dem absolute -right-3 -top-2"><span aria-hidden>{restCount > 9 ? "9+" : restCount}</span><span className="sr-only">{restCount} việc trong các mục khác</span></span>}
          </span>
          Khác
        </button>
      </nav>

      <AnimatePresence>
        {more && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-dem/55" aria-label="Đóng" onClick={() => setMore(false)} />
            <motion.div
              role="dialog"
              aria-label="Các điểm dừng khác"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 rounded-t-[16px] border-t border-vua bg-nga pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between px-4 pb-1 pt-3">
                <p className="font-serif text-[1.25rem] font-bold giong-ke">Đường làng của {firstName}</p>
                <button onClick={() => setMore(false)} className="grid size-11 place-items-center rounded-[6px] hover:bg-nga-dam" aria-label="Đóng"><X className="size-5" /></button>
              </div>
              <ul className="grid grid-cols-1 gap-1.5 p-3 pt-1">
                {[...rest, { href: "/", label: "Trang triển lãm", icon: Globe } as ZoneLink].map((l, i) => (
                  <motion.li key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={l.href} aria-current={isActive(pathname, l) ? "page" : undefined} className="viec min-h-14 gap-3 py-2.5 aria-[current=page]:border-lam">
                      <span className="tile tile-lam grid size-10 shrink-0 place-items-center text-giay"><l.icon className="size-5" aria-hidden /></span>
                      <span className="flex-1 font-semibold">{l.label}</span>
                      <Count n={count(l)} kind={l.badgeKey} />
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
