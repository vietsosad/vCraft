"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
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
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api<{ items: Item[]; unread: number }>("/api/notifications?limit=8");
      setItems(data.items);
      setUnread(data.unread);
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
        className="relative grid size-10 place-items-center rounded-full hover:bg-bisque"
        aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ""}`}
        aria-expanded={open}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid min-w-[18px] place-items-center rounded-full bg-terracotta px-1 font-mono text-[10px] leading-[18px] text-kaolin">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-line bg-white shadow-lift">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold">Thông báo</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-terracotta hover:underline">
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-ash">Chưa có thông báo nào.</li>}
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link ?? "/notifications"}
                  onClick={() => setOpen(false)}
                  className={cn("block border-b border-line/60 px-4 py-3 hover:bg-bisque/60", !n.readAt && "bg-terracotta/[0.05]")}
                >
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-terracotta" />}
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-ash">{n.body}</p>
                  <p className="mt-1 font-mono text-[10px] text-ash/80">{timeAgo(n.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-sm text-cobalt hover:bg-bisque">
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
  );
}
