"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { NotificationLink } from "@/components/account/notification-link";
import { useToast } from "@/components/ui/toast";

type Item = { id: string; title: string; body: string; link: string | null; readAt: string | null; createdAt: string };

/**
 * Chuông thông báo: hỏi lại server mỗi 20 giây bằng fetch (JSON) và cập nhật DOM,
 * không tải lại trang. Tạm dừng khi tab bị ẩn để tiết kiệm tài nguyên.
 */
export function NotificationBell({
  className, buttonClassName, panelClassName, allHref = "/notifications", initialUnread = 0,
}: { className?: string; buttonClassName?: string; panelClassName?: string; allHref?: string; initialUnread?: number } = {}) {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(initialUnread);
  const [open, setOpen] = useState(false);
  const [ring, setRing] = useState(0);
  const [marking, setMarking] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const prevUnread = useRef(initialUnread);
  const router = useRouter();
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api<{ items: Item[]; unread: number }>("/api/notifications?limit=8");
      setItems(data.items);
      setUnread(data.unread);
      // Có thông báo mới: chuông lắc nhẹ một lần
      if (data.unread > prevUnread.current) setRing((r) => r + 1);
      prevUnread.current = data.unread;
    } catch {
      /* bỏ qua lỗi mạng tạm thời */
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 20000);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !open) return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      clearInterval(timer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [load, open]);

  useEffect(() => {
    void load();
  }, [initialUnread, load]);

  async function markAll() {
    setMarking(true);
    try {
      await api("/api/notifications", { body: { all: true } });
      await load();
      router.refresh();
    } catch {
      toast({ kind: "error", title: "Chưa đánh dấu được tất cả thông báo." });
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) void load();
        }}
        className={cn("relative grid size-10 place-items-center rounded-[var(--radius-tile)] hover:bg-nga-dam", buttonClassName)}
        aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ""}`}
        aria-expanded={open}
      >
        <motion.span
          key={ring}
          initial={ring ? { rotate: 0 } : false}
          animate={ring ? { rotate: [0, -16, 13, -9, 6, 0] } : undefined}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid origin-top place-items-center"
        >
          <Bell className="size-[19px]" />
        </motion.span>
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 grid min-w-[18px] animate-pop place-items-center rounded-[4px] bg-datnung px-1 text-[10px] font-bold leading-[18px] text-on">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn("absolute right-0 top-12 z-50 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-[8px] border border-vua bg-su shadow-lift", panelClassName)}
        >
          <div className="flex items-center justify-between border-b border-vua px-4 py-3">
            <p className="font-semibold">Thông báo</p>
            {unread > 0 && (
              <button type="button" onClick={markAll} disabled={marking} className="min-h-11 text-xs text-datnung hover:underline disabled:opacity-60">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-tro">Chưa có thông báo nào.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <NotificationLink
                  id={n.id}
                  href={n.link ?? allHref}
                  read={!!n.readAt}
                  onActivate={() => setOpen(false)}
                  className={cn("block border-b border-vua/60 px-4 py-3 hover:bg-nga-dam/60", !n.readAt && "bg-datnung/[0.05]")}
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-datnung" />}
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-tro">{n.body}</p>
                  <p className="mt-1 text-[11px] text-tro">{timeAgo(n.createdAt)}</p>
                </NotificationLink>
              </li>
            ))}
          </ul>
          <Link href={allHref} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-sm text-lam hover:bg-nga-dam">
            Xem tất cả
          </Link>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
