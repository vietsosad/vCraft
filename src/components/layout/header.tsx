import Link from "next/link";
import { Heart, ScanLine, ArrowUpRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "./logo";
import { NavLinks, MobileNav } from "./nav-links";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { LoginPortals } from "./login-portals";
import { ZONES } from "./zones";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/cn";

/** Đầu trang của khu công khai (triển lãm). Các khu làm việc có thanh riêng. */
export async function Header() {
  const user = await getCurrentUser();
  const zone = user ? ZONES[user.role] : null;

  return (
    <header className="sticky top-[var(--demo-h)] z-[500] border-b border-vua bg-nga/88 backdrop-blur-md supports-[backdrop-filter]:bg-nga/80">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks />
        </div>
        <div className="flex items-center gap-1">
          <Link href="/scan" className="hidden size-10 place-items-center rounded-[var(--radius-tile)] text-muc/80 transition hover:bg-nga-dam hover:text-muc sm:grid" aria-label="Quét mã QR trên sản phẩm" title="Quét mã QR">
            <ScanLine className="size-[18px]" />
          </Link>
          <ThemeToggle />
          {user && zone ? (
            <>
              {user.role === "BUYER" && (
                <Link href="/account/favorites" className="hidden size-10 place-items-center rounded-[var(--radius-tile)] text-muc/80 transition hover:bg-nga-dam hover:text-datnung sm:grid" aria-label="Tác phẩm đã lưu" title="Đã lưu">
                  <Heart className="size-[18px]" />
                </Link>
              )}
              <NotificationBell />
              <Link
                href={zone.home}
                className={cn(
                  "mx-1 hidden items-center gap-1.5 rounded-[var(--radius-tile)] px-3 py-2 text-sm font-semibold text-giay transition hover:brightness-110 md:inline-flex",
                  zone.band,
                )}
              >
                {zone.name} <ArrowUpRight className="size-4" />
              </Link>
              <UserMenu user={{ name: user.name, email: user.email, role: user.role, status: user.status }} />
            </>
          ) : (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <LoginPortals />
              <Link href="/register" className="rounded-[var(--radius-tile)] bg-lam px-4 py-2 text-sm font-semibold text-on shadow-soft transition hover:bg-lam-sang">
                Đăng ký
              </Link>
            </div>
          )}
          <MobileNav loggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
