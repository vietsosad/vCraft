"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, MoreHorizontal, QrCode, ShieldCheck, Clock, XCircle, X, Store } from "lucide-react";
import { cn } from "@/lib/cn";
import type { VerificationStatus } from "@prisma/client";
import { ZONES, type Role, type ZoneLink } from "@/components/layout/zones";
import { LogoMark } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";

type ShellUser = { name: string; email: string; role: Role; status: string };

function isActive(pathname: string, l: ZoneLink) {
  return l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
}

function VerificationPill({ status }: { status?: VerificationStatus }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-ngoc-nhat px-2 py-0.5 text-[11px] font-semibold text-ngoc">
        <ShieldCheck className="size-3.5" aria-hidden /> Hộ nghề xác thực
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-vangrom/20 px-2 py-0.5 text-[11px] font-semibold text-vangrom-dam">
        <Clock className="size-3.5" aria-hidden /> Chờ BQL duyệt
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-[4px] bg-doson/12 px-2 py-0.5 text-[11px] font-semibold text-doson">
        <XCircle className="size-3.5" aria-hidden /> Cần bổ sung hồ sơ
      </span>
    );
  }
  return null;
}

/**
 * Khung "Xưởng Đất Nung" riêng cho Nghệ nhân / Hộ gia đình:
 * - Thanh bên đất nung có đường mạch gạch và dấu triện xác thực trên máy tính.
 * - Đầu trang gọn gàng với nút mở lô nhanh (+ Mở lô mới).
 * - Thanh tab 56px dưới đáy trên điện thoại để thao tác một tay thuận tiện.
 */
export function KilnShell({
  user,
  workshopName,
  workshopSlug,
  verificationStatus,
  isOpenForVisit,
  badges = {},
  banner,
  children,
}: {
  user: ShellUser;
  workshopName?: string;
  workshopSlug?: string;
  verificationStatus?: VerificationStatus;
  isOpenForVisit?: boolean;
  badges?: Record<string, number>;
  banner?: ReactNode;
  children: ReactNode;
}) {
  const zone = ZONES.ARTISAN;
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [pathname]);

  const tabs = zone.tabs.map((h) => zone.nav.find((n) => n.href === h)!).filter(Boolean);
  const current = zone.nav.find((l) => isActive(pathname, l));

  return (
    <div className="kiln-zone min-h-dvh lg:grid lg:grid-cols-[276px_minmax(0,1fr)]">
      {/* Thanh bên Đất nung (máy tính) */}
      <aside
        className="tile-dat sticky top-[var(--demo-h)] hidden h-[calc(100dvh-var(--demo-h))] flex-col text-giay lg:flex"
        aria-label={zone.name}
      >
        <div className="kiln-brick-strip shrink-0 opacity-90" aria-hidden />
        <div className="flex min-w-0 items-center gap-3 px-5 pb-4 pt-5">
          <Link href={zone.home} className="group flex min-w-0 items-center gap-3">
            <span className="rounded-[7px] bg-giay/95 p-[3px] shadow-soft transition-transform duration-500 group-hover:-rotate-6">
              <LogoMark tone="datnung" className="size-9" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block font-display text-[1.35rem]">Xưởng đất nung</span>
              <span className="block truncate text-xs text-giay/75">{workshopName ?? zone.roleLabel}</span>
            </span>
          </Link>
        </div>

        {/* Trạng thái mở cửa nhanh */}
        <div className="mx-4 mb-3 flex items-center justify-between gap-2 rounded-[var(--radius-tile)] bg-giay/10 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 font-medium">
            <span
              className={cn("size-2 rounded-full", isOpenForVisit ? "bg-[#6ee7b7] shadow-[0_0_8px_#6ee7b7]" : "bg-giay/40")}
              aria-hidden
            />
            {isOpenForVisit ? "Đang mở đón khách" : "Tạm đóng cửa tham quan"}
          </span>
          {workshopSlug && (
            <Link href={`/artisans/${workshopSlug}`} target="_blank" className="text-giay/80 underline-offset-2 hover:text-giay hover:underline">
              Gian hàng ↗
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Điều hướng xưởng nghệ nhân">
          <ul className="space-y-1">
            {zone.nav.map((l) => {
              const active = isActive(pathname, l);
              const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
              return (
                <li key={l.href} className="relative">
                  {active && (
                    <motion.span
                      layoutId="kiln-active-nav"
                      className="absolute inset-0 rounded-[var(--radius-tile)] bg-giay shadow-soft"
                      transition={{ type: "spring", stiffness: 460, damping: 38 }}
                      aria-hidden
                    />
                  )}
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 rounded-[var(--radius-tile)] px-3 text-[15px] font-medium transition-colors",
                      active ? "font-semibold text-datnung-dam" : "text-giay/85 hover:bg-giay/10 hover:text-giay",
                    )}
                  >
                    <l.icon className="size-[18px] shrink-0" aria-hidden />
                    <span className="flex-1">{l.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "grid min-w-6 place-items-center rounded-[4px] px-1.5 text-[11px] font-bold leading-5",
                          active ? "bg-datnung text-giay" : "bg-giay text-datnung-dam",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-giay/15 px-4 py-3">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-tile)] px-2 py-2 text-sm text-giay/85 hover:bg-giay/10 hover:text-giay">
            <Globe className="size-4" aria-hidden /> Trang triển lãm
          </Link>
          <ThemeToggle className="text-giay/85 hover:bg-giay/10 hover:text-giay" />
        </div>
      </aside>

      {/* Vùng nội dung chính */}
      <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
        <header className="sticky top-[var(--demo-h)] z-20 flex min-h-16 items-center justify-between gap-3 border-b border-vua bg-su/90 px-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link href={zone.home} className="shrink-0 lg:hidden" aria-label={zone.name}>
              <LogoMark tone="datnung" className="size-9" />
            </Link>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-display text-lg uppercase tracking-tight text-datnung-dam md:text-xl">
                  {current?.label ?? workshopName ?? "Xưởng của tôi"}
                </span>
                <VerificationPill status={verificationStatus} />
              </div>
              {workshopName && (
                <p className="hidden truncate text-xs text-tro sm:block">
                  <Store className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
                  {workshopName}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard/artisan/batches/new"
              className="hidden h-10 items-center gap-1.5 rounded-[var(--radius-tile)] bg-datnung px-3.5 text-sm font-semibold text-on shadow-soft transition-colors hover:bg-datnung-dam sm:inline-flex"
            >
              <QrCode className="size-4" aria-hidden /> Mở lô mới
            </Link>
            <ThemeToggle className="lg:hidden" />
            <NotificationBell allHref="/dashboard/artisan/notifications" />
            <UserMenu user={user} />
          </div>
        </header>

        {banner}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      {/* Thanh tab dưới đáy (điện thoại: vùng bấm 56px thao tác một tay) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-vua bg-su/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Thanh điều hướng nhanh"
      >
        {tabs.map((l) => {
          const active = isActive(pathname, l);
          const count = l.badgeKey ? badges[l.badgeKey] ?? 0 : 0;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors",
                active ? "bg-datnung-nhat/60 text-datnung-dam" : "text-tro hover:text-muc",
              )}
            >
              {active && <span className="absolute inset-x-3 top-0 h-[3px] rounded-b bg-datnung" aria-hidden />}
              <l.icon className="size-5" aria-hidden />
              <span className="truncate">{l.short ?? l.label}</span>
              {count > 0 && (
                <span className="absolute right-2 top-1.5 grid min-w-4 place-items-center rounded-full bg-datnung px-1 text-[10px] font-bold text-giay">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          aria-label="Thêm mục khác"
          className="flex min-h-[56px] w-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-tro hover:text-muc"
        >
          <MoreHorizontal className="size-5" aria-hidden />
          <span>Thêm</span>
        </button>
      </nav>

      {/* Ngăn kéo "Thêm" trên điện thoại */}
      <AnimatePresence>
        {more && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-muc/45 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMore(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-vua bg-su p-4 pb-8 shadow-lift lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              role="dialog"
              aria-label="Tất cả mục xưởng"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-lg uppercase text-datnung-dam">Tất cả mục xưởng</span>
                <button
                  type="button"
                  onClick={() => setMore(false)}
                  aria-label="Đóng"
                  className="grid size-11 place-items-center rounded-[var(--radius-tile)] text-tro hover:bg-nga-dam"
                >
                  <X className="size-5" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-2">
                {zone.nav.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setMore(false)}
                      className={cn(
                        "flex min-h-12 items-center gap-2.5 rounded-[var(--radius-tile)] border px-3 py-2.5 text-sm font-medium",
                        isActive(pathname, l)
                          ? "border-datnung bg-datnung-nhat/60 text-datnung-dam"
                          : "border-vua bg-nga/60 text-muc hover:border-datnung/40",
                      )}
                    >
                      <l.icon className="size-4 shrink-0 text-datnung" aria-hidden />
                      <span className="truncate">{l.label}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/"
                    onClick={() => setMore(false)}
                    className="flex min-h-12 items-center gap-2.5 rounded-[var(--radius-tile)] border border-vua bg-nga/60 px-3 py-2.5 text-sm font-medium text-muc"
                  >
                    <Globe className="size-4 shrink-0 text-datnung" aria-hidden />
                    <span>Trang triển lãm</span>
                  </Link>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
