"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api-client";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

type Item = { id: string; title: string; body: string; link: string | null; readAt: string | null; createdAt: string };

/**
 * Chuông thông báo: hỏi lại server mỗi 20 giây bằng fetch (JSON) và cập nhật DOM,
 * không tải lại trang. Tạm dừng khi tab bị ẩn để tiết kiệm tài nguyên.
 */
export function NotificationBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [ring, setRing] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const prevUnread = useRef(0);

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
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 20000);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("click", onClick);
    };
  }, [load]);

  async function markAll() {
    setUnread(0);
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    await api("/api/notifications", { body: { all: true } });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid size-10 place-items-center rounded-[var(--radius-tile)] hover:bg-nga-dam"
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
          className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-[8px] border border-vua bg-su shadow-lift"
        >
          <div className="flex items-center justify-between border-b border-vua px-4 py-3">
            <p className="font-semibold">Thông báo</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-datnung hover:underline">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-tro">Chưa có thông báo nào.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link ?? "/notifications"}
                  onClick={() => setOpen(false)}
                  className={cn("block border-b border-vua/60 px-4 py-3 hover:bg-nga-dam/60", !n.readAt && "bg-datnung/[0.05]")}
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-datnung" />}
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-tro">{n.body}</p>
                  <p className="mt-1 text-[11px] text-tro">{timeAgo(n.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-sm text-lam hover:bg-nga-dam">
            Xem tất cả
          </Link>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
