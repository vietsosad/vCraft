"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";

/** Mảnh gốm nhỏ bắn ra khi bấm lưu – 6 mảnh men theo 6 hướng. */
const SHARDS = Array.from({ length: 6 }, (_, i) => {
  const a = (i / 6) * Math.PI * 2 + 0.3;
  return { x: Math.cos(a) * 22, y: Math.sin(a) * 22, r: (i % 2 ? 1 : -1) * 40, c: ["#1f4e9a", "#a34a23", "#5e8f7b"][i % 3] };
});

/**
 * Nút lưu tác phẩm/xưởng. Cập nhật lạc quan (đổi ngay, hoàn tác nếu lỗi).
 * Khách chưa đăng nhập được đưa tới cổng khách hàng rồi quay lại đúng trang.
 */
export function FavoriteButton({
  productId,
  artisanId,
  initial,
  canFavorite,
  variant = "icon",
  className,
}: {
  productId?: string;
  artisanId?: string;
  initial: boolean;
  /** false khi chưa đăng nhập hoặc không phải tài khoản khách hàng */
  canFavorite: boolean | "guest";
  variant?: "icon" | "pill";
  className?: string;
}) {
  const [on, setOn] = useState(initial);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();

  if (canFavorite === false) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (canFavorite === "guest") {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const next = !on;
    setOn(next);
    if (next) setBurst((b) => b + 1);
    setBusy(true);
    try {
      const res = await api<{ favorited: boolean }>("/api/favorites", { body: productId ? { productId } : { artisanId } });
      setOn(res.favorited);
      toast({ kind: "success", title: res.favorited ? "Đã lưu vào mục Đã lưu" : "Đã bỏ khỏi mục Đã lưu" });
      router.refresh();
    } catch (err) {
      setOn(!next);
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Không lưu được" });
    } finally {
      setBusy(false);
    }
  }

  const label = on ? "Bỏ lưu" : productId ? "Lưu tác phẩm" : "Lưu xưởng";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition",
        variant === "icon"
          ? "size-10 rounded-[var(--radius-tile)] bg-su/90 text-muc shadow-soft backdrop-blur hover:bg-su"
          : "h-11 rounded-[var(--radius-tile)] border border-muc/20 bg-su/60 px-4 text-[15px] font-semibold hover:border-muc/45",
        on && "text-datnung",
        className,
      )}
    >
      <span className="relative grid place-items-center">
        <motion.span key={on ? "on" : "off"} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 16 }}>
          <Heart className={cn("size-[18px]", on && "fill-current")} aria-hidden />
        </motion.span>
        <AnimatePresence>
          {burst > 0 && on && (
            <span key={burst} className="pointer-events-none absolute inset-0" aria-hidden>
              {SHARDS.map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 size-[5px] rounded-[1px]"
                  style={{ background: s.c }}
                  initial={{ x: -2, y: -2, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{ x: s.x, y: s.y, opacity: 0, rotate: s.r, scale: 0.6 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      {variant === "pill" && <span>{on ? "Đã lưu" : label}</span>}
    </button>
  );
}
