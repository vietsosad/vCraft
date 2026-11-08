"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/** Thanh điều hướng của khu quản lý (nghệ nhân / BQL), cuộn ngang trên điện thoại. */
export function DashboardNav({ items, tone = "terracotta" }: { items: { href: string; label: string; exact?: boolean }[]; tone?: "terracotta" | "cobalt" }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Điều hướng khu quản lý" className="-mx-4 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-1">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block px-3.5 py-3 text-sm transition",
                  active ? "font-medium text-ink" : "text-ash hover:text-ink",
                  active && "after:absolute after:inset-x-2 after:-bottom-px after:h-[2px]",
                  active && (tone === "cobalt" ? "after:bg-cobalt" : "after:bg-terracotta"),
                )}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
