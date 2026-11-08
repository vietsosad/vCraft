"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { href: "/products", label: "Triển lãm" },
  { href: "/artisans", label: "Nghệ nhân" },
  { href: "/map", label: "Bản đồ làng" },
  { href: "/b2b-quotes", label: "Đặt hàng sỉ" },
  { href: "/news", label: "Bản tin" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng chính" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-3 py-2 text-[15px] text-ink/75 transition hover:text-ink",
                isActive(pathname, item.href) &&
                  "text-ink after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:rounded after:bg-terracotta",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function MobileNav({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-md hover:bg-bisque"
        aria-expanded={open}
        aria-label={open ? "Đóng menu" : "Mở menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-kaolin px-4 pb-6 pt-2 shadow-lift">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block border-b border-line/60 py-3.5 font-display text-2xl",
                    isActive(pathname, item.href) && "text-terracotta",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {!loggedIn && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link href="/login" className="rounded-md border border-ink/20 py-2.5 text-center">
                Đăng nhập
              </Link>
              <Link href="/register" className="rounded-md bg-terracotta py-2.5 text-center text-kaolin">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
