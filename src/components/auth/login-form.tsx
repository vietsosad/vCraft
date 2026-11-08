"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { loginSchema } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const HOME_BY_ROLE = { ADMIN: "/dashboard/admin", ARTISAN: "/dashboard/artisan", BUYER: "/b2b-quotes" } as const;

/** Chỉ cho phép quay về đường dẫn nội bộ – chống open redirect qua tham số ?next=. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export function LoginForm({ demo }: { demo: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      const user = await api<{ role: keyof typeof HOME_BY_ROLE }>("/api/auth/login", { body: parsed.data });
      router.push(safeNext(params.get("next")) ?? HOME_BY_ROLE[user.role]);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Không đăng nhập được.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <p role="alert" className="rounded-md border border-terracotta/40 bg-terracotta/5 px-3 py-2.5 text-sm text-terracotta">{formError}</p>}
      <Field label="Email" htmlFor="email" error={errors.email} required>
        <Input id="email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ban@vidu.vn" />
      </Field>
      <Field label="Mật khẩu" htmlFor="password" error={errors.password} required>
        <Input id="password" type="password" autoComplete="current-password" value={form.password} invalid={!!errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </Field>
      <Button type="submit" loading={loading} className="w-full" size="lg">Đăng nhập</Button>
      <p className="text-center text-sm text-ash">
        Chưa có tài khoản? <Link href="/register" className="text-terracotta hover:underline">Đăng ký khách hàng</Link> ·{" "}
        <Link href="/register/artisan" className="text-terracotta hover:underline">Đăng ký hộ nghề</Link>
      </p>
      {demo && (
        <div className="rounded-md bg-bisque p-3 text-xs text-ash">
          <p className="font-medium text-ink">Tài khoản demo (mật khẩu <code className="font-mono">Vcraft@2026</code>)</p>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {["admin@vcraft.test", "lan.uet@vcraft.test", "ongtu@vcraft.test", "hungphat@vcraft.test"].map((email) => (
              <button key={email} type="button" onClick={() => setForm({ email, password: "Vcraft@2026" })} className="truncate rounded bg-white px-2 py-1 text-left font-mono hover:text-terracotta">
                {email}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
