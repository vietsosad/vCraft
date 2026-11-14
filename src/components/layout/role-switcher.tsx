"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Presentation } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";

/** Các vai trò demo. Mỗi vai trò đăng nhập bằng tài khoản seed thật (có phiên, có phân quyền). */
const PERSONAS = [
  { key: "guest", label: "Du khách", zone: "Công khai", email: null, landing: "/", dot: "bg-giay" },
  { key: "buyer", label: "Khách sỉ · ĐH Công nghệ", zone: "Khu khách hàng", email: "lan.uet@vcraft.test", landing: "/account", dot: "bg-[#8fb1ec]" },
  { key: "artisan", label: "Nghệ nhân · Xưởng Ông Tư", zone: "Khu xưởng", email: "ongtu@vcraft.test", landing: "/dashboard/artisan", dot: "bg-[#ec9a72]" },
  { key: "artisan2", label: "Nghệ nhân · Hưng Phát", zone: "Khu xưởng", email: "hungphat@vcraft.test", landing: "/dashboard/artisan", dot: "bg-[#ec9a72]" },
  { key: "admin", label: "Ban quản lý", zone: "Bảng điều phối", email: "admin@vcraft.test", landing: "/dashboard/admin", dot: "bg-[#8fc7b1]" },
] as const;

/**
 * Thanh "Demo vấn đáp": chuyển vai trò bằng một cú bấm và đưa thẳng tới khu riêng của vai trò đó.
 * Chỉ hiển thị khi DEMO_MODE=true; API phía server cũng từ chối nếu không bật chế độ này.
 */
export function RoleSwitcher({ currentEmail }: { currentEmail: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const current = PERSONAS.find((p) => p.email === currentEmail)?.key ?? (currentEmail ? null : "guest");

  async function switchTo(persona: (typeof PERSONAS)[number]) {
    setBusy(persona.key);
    try {
      await api("/api/auth/demo-login", { body: { persona: persona.key } });
      toast({ kind: "info", title: `Đã chuyển sang: ${persona.label}`, description: persona.zone });
      startTransition(() => {
        router.push(persona.landing);
        router.refresh();
      });
    } catch (err) {
      toast({ kind: "error", title: "Không chuyển được vai trò", description: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="demo-bar no-print sticky top-0 z-[650] h-9 bg-dem text-giay">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 overflow-x-auto px-4 text-xs md:px-6 [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-1.5 font-semibold text-giay/60">
          <Presentation className="size-3.5" aria-hidden /> Demo vấn đáp
        </span>
        <div className="flex gap-1" role="group" aria-label="Chuyển vai trò demo">
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              onClick={() => switchTo(p)}
              disabled={pending || busy !== null}
              aria-pressed={current === p.key}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-[4px] px-2.5 py-1 transition duration-200",
                current === p.key ? "bg-giay text-dem" : "text-giay/80 hover:bg-giay/10 hover:text-giay",
                busy === p.key && "animate-pulse",
              )}
            >
              <span className={cn("size-1.5 rounded-full", p.dot, current === p.key && "ring-2 ring-dem/15")} aria-hidden />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
