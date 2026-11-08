"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Presentation } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";

/** Các vai trò demo. Mỗi vai trò đăng nhập bằng tài khoản seed thật (có phiên, có phân quyền). */
const PERSONAS = [
  { key: "guest", label: "Du khách", email: null, landing: "/" },
  { key: "buyer", label: "Khách sỉ · ĐH Công nghệ", email: "lan.uet@vcraft.test", landing: "/b2b-quotes" },
  { key: "artisan", label: "Nghệ nhân · Xưởng Ông Tư", email: "ongtu@vcraft.test", landing: "/dashboard/artisan" },
  { key: "artisan2", label: "Nghệ nhân · Hưng Phát", email: "hungphat@vcraft.test", landing: "/dashboard/artisan" },
  { key: "admin", label: "Ban quản lý", email: "admin@vcraft.test", landing: "/dashboard/admin" },
] as const;

/**
 * Thanh "Chế độ Demo Vấn đáp": chuyển vai trò bằng 1 cú bấm.
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
      toast({ kind: "info", title: `Đã chuyển sang vai trò: ${persona.label}` });
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
    <div className="no-print border-b border-cobalt/20 bg-cobalt text-kaolin">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-1.5 text-xs md:px-6">
        <span className="flex shrink-0 items-center gap-1.5 font-mono uppercase tracking-widest text-kaolin/70">
          <Presentation className="size-3.5" /> Demo vấn đáp
        </span>
        <div className="flex gap-1">
          {PERSONAS.map((p) => (
            <button
              key={p.key}
              onClick={() => switchTo(p)}
              disabled={pending || busy !== null}
              aria-pressed={current === p.key}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 transition",
                current === p.key ? "bg-kaolin text-cobalt" : "text-kaolin/85 hover:bg-white/10",
                busy === p.key && "animate-pulse",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
