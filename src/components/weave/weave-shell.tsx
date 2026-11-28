"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { Ellipsis, Globe, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ZONES, type Role, type ZoneLink } from "@/components/layout/zones";
import { LogoMark } from "@/components/layout/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/motion/theme-toggle";

type ShellUser = { name: string; email: string; role: Role; status: string };

const BADGE_LABEL: Record<string, string> = {
  quotes: "đơn đang chờ bạn",
  reviews: "lượt chờ đánh giá",
  unread: "thư chưa đọc",
  more: "việc trong các mục khác",
};

function isActive(pathname: string, link: ZoneLink) {
  return pathname === link.href || (!link.exact && pathname.startsWith(link.href + "/"));
}

function NavCount({ count, kind }: { count: number; kind?: string }) {
  if (!count) return null;
  return (
    <span className="account-nav-count">
      <span aria-hidden>{count > 9 ? "9+" : count}</span>
      <span className="sr-only">{count} {BADGE_LABEL[kind ?? ""]}</span>
    </span>
  );
}

function Segment({ link, active, count, compact }: { link: ZoneLink; active: boolean; count: number; compact?: boolean }) {
  return (
    <Link href={link.href} aria-current={active ? "page" : undefined} className="account-nav-link">
      <link.icon className="size-[17px] shrink-0" aria-hidden />
      <span>{compact ? link.short ?? link.label : link.label}</span>
      <NavCount count={count} kind={link.badgeKey} />
    </Link>
  );
}

export function WeaveShell({ user, badges = {}, children }: { user: ShellUser; badges?: Record<string, number>; children: ReactNode }) {
  const zone = ZONES.BUYER;
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  const moreDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    moreDialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) moreDialog.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const count = (link: ZoneLink) => link.badgeKey ? badges[link.badgeKey] ?? 0 : 0;
  const dock = zone.nav.filter((link) => zone.tabs.includes(link.href));
  const rest = zone.nav.filter((link) => !zone.tabs.includes(link.href));
  const restBadge = rest.reduce((sum, link) => sum + count(link), 0);
  const restActive = rest.some((link) => isActive(pathname, link));

  return (
    <MotionConfig reducedMotion="user">
      <div className="det ui-operate">
        <header className="account-header no-print">
          <div className="account-container account-header-row">
            <Link href={zone.home} className="account-brand" aria-label="Tấm dệt – việc của tôi">
              <LogoMark tone="datnung" className="size-10 shrink-0" />
              <span className="min-w-0">
                <span className="account-brand-name">Tấm dệt</span>
                <span className="account-brand-caption">Không gian khách hàng</span>
              </span>
            </Link>
            <div className="account-tools">
              <Link href="/" className="account-site-link">
                <Globe className="size-4" aria-hidden /> Triển lãm
              </Link>
              <ThemeToggle className="account-tool" />
              <NotificationBell
                allHref="/account/notifications"
                initialUnread={badges.unread}
                className="account-bell"
                buttonClassName="account-tool"
                panelClassName="account-bell-panel"
              />
              <UserMenu user={user} showSiteLink triggerClassName="account-user-trigger" />
            </div>
          </div>
          <nav aria-label="Các mục của Tấm dệt" className="account-desktop-nav">
            <ul className="account-container">
              {zone.nav.map((link) => (
                <li key={link.href}>
                  <Segment link={link} active={isActive(pathname, link)} count={count(link)} />
                </li>
              ))}
            </ul>
          </nav>
          <div className="account-scroll-line" aria-hidden />
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <nav className="account-dock no-print" aria-label="Các mục của Tấm dệt">
          <ul>
            {dock.map((link) => (
              <li key={link.href}>
                <Segment link={link} active={isActive(pathname, link)} count={count(link)} compact />
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  moreDialog.current?.showModal();
                  setMore(true);
                }}
                aria-haspopup="dialog"
                aria-controls="account-more"
                aria-expanded={more}
                data-active={restActive || undefined}
                className="account-nav-link"
              >
                <Ellipsis className="size-5" aria-hidden />
                <span>Khác</span>
                <NavCount count={restBadge} kind="more" />
              </button>
            </li>
          </ul>
        </nav>

        <dialog
          id="account-more"
          ref={moreDialog}
          aria-labelledby="account-more-title"
          onClose={() => setMore(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) moreDialog.current?.close();
          }}
          className="account-more no-print"
        >
          <div className="account-more-content">
            <div className="account-more-head">
              <h2 id="account-more-title">Các mục khác</h2>
              <button type="button" onClick={() => moreDialog.current?.close()} className="account-tool" aria-label="Đóng">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <ul>
              {[...rest, { href: "/", label: "Trang triển lãm", icon: Globe }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(pathname, link) ? "page" : undefined}
                    onClick={() => moreDialog.current?.close()}
                    className={cn("account-nav-link", link.href === "/" && "account-more-site")}
                  >
                    <link.icon className="size-5" aria-hidden />
                    <span>{link.label}</span>
                    <NavCount count={count(link)} kind={link.badgeKey} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </dialog>
      </div>
    </MotionConfig>
  );
}
