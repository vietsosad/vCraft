"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

export function NotificationLink({
  id,
  href,
  read,
  className,
  children,
  onActivate,
}: {
  id: string;
  href: string | null;
  read: boolean;
  className?: string;
  children: ReactNode;
  onActivate?: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const pending = useRef(false);

  async function open() {
    if (pending.current) return;
    pending.current = true;
    let updated = false;
    try {
      await api("/api/notifications", { body: { ids: [id] } });
      updated = true;
    } catch {
      toast({ kind: "error", title: "Chưa đánh dấu được thư đã đọc." });
    } finally {
      pending.current = false;
    }
    onActivate?.();
    if (href) router.push(href);
    if (updated) router.refresh();
  }

  if (!href) {
    return read
      ? <div className={className}>{children}</div>
      : <button type="button" className={className} onClick={open}>{children}</button>;
  }
  return (
    <Link
      href={href}
      className={className}
      onNavigate={(event) => {
        if (read) {
          onActivate?.();
          return;
        }
        event.preventDefault();
        void open();
      }}
    >
      {children}
    </Link>
  );
}
