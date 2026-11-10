"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { loginSchema } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Portal } from "./auth-shell";

const HOME_BY_ROLE = { ADMIN: "/dashboard/admin", ARTISAN: "/dashboard/artisan", BUYER: "/account" } as const;

const DEMO: Record<Portal, string[]> = {
  customer: ["lan.uet@vcraft.test", "minh@vcraft.test"],
  artisan: ["ongtu@vcraft.test", "hungphat@vcraft.test"],
  admin: ["admin@vcraft.test"],
};

const BUTTON: Record<Portal, "primary" | "earth" | "celadon"> = { customer: "primary", artisan: "earth", admin: "celadon" };

/** Chỉ cho phép quay về đường dẫn nội bộ – chống open redirect qua tham số ?next=. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function LoginForm({ demo, portal = "customer" }: { demo: boolean; portal?: Portal }) {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; href?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ ...form, portal });
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      const user = await api<{ role: keyof typeof HOME_BY_ROLE }>("/api/auth/login", { body: parsed.data });
      router.push(safeNext(params.get("next")) ?? HOME_BY_ROLE[user.role]);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.code === "WRONG_PORTAL") {
        const href = (err.details as { href?: string } | undefined)?.href;
        setFormError({ message: err.message, href });
      } else {
        setFormError({ message: err instanceof ApiError ? err.message : "Không đăng nhập được." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <div role="alert" className="animate-rise rounded-[var(--radius-tile)] border border-doson/35 bg-doson/8 px-3.5 py-3 text-sm text-doson">
          <p>{formError.message}</p>
          {formError.href && (
            <Link href={formError.href} className="mt-1.5 inline-flex items-center gap-1 font-semibold underline underline-offset-4">
              Đi tới cổng đúng <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}
      <Field label="Email" htmlFor="email" error={errors.email} required>
        <Input id="email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@vidu.vn" />
      </Field>
      <Field label="Mật khẩu" htmlFor="password" error={errors.password} required>
        <Input id="password" type="password" autoComplete="current-password" value={form.password} invalid={!!errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-sm text-tro underline-offset-4 hover:text-muc hover:underline">Quên mật khẩu?</Link>
      </div>
      <Button type="submit" variant={BUTTON[portal]} loading={loading} className="w-full" size="lg">Đăng nhập</Button>
      {portal === "customer" && (
        <p className="text-center text-sm text-tro">
          Chưa có tài khoản? <Link href="/register" className="font-semibold text-lam hover:underline">Đăng ký khách hàng</Link>
        </p>
      )}
      {portal === "artisan" && (
        <p className="text-center text-sm text-tro">
          Hộ gia đình làm gốm chưa có tài khoản? <Link href="/register/artisan" className="font-semibold text-datnung hover:underline">Đăng ký hộ nghề</Link>
        </p>
      )}
      {portal === "admin" && <p className="text-center text-sm text-tro">Tài khoản Ban quản lý do Hội làng nghề cấp, không tự đăng ký.</p>}
      {demo && (
        <div className="rounded-[var(--radius-tile)] border border-dashed border-vua p-3 text-xs text-tro">
          <p className="font-medium text-muc">Tài khoản demo của cổng này (mật khẩu <code className="code">Vcraft@2026</code>)</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DEMO[portal].map((email) => (
              <button key={email} type="button" onClick={() => setForm({ email, password: "Vcraft@2026" })} className="rounded-[4px] bg-nga-dam px-2 py-1 font-mono transition hover:bg-nga-sau hover:text-muc">
                {email}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
