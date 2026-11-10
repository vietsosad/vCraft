"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MailCheck, KeyRound } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/engagement";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PasswordMeter } from "./password-meter";
import { useToast } from "@/components/ui/toast";

/** Bước 1: nhập email. Luôn báo "đã gửi" dù email có tồn tại hay không. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<{ demoLink: string | null } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError("");
    setLoading(true);
    try {
      setSent(await api<{ sent: boolean; demoLink: string | null }>("/api/auth/forgot", { body: parsed.data }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không gửi được yêu cầu.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-rise space-y-4">
        <div className="flex gap-3 rounded-[var(--radius-tile)] border border-ngoc/35 bg-ngoc-nhat p-4 text-sm">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-ngoc" aria-hidden />
          <p>Nếu <strong>{email}</strong> đã đăng ký, đường dẫn đặt lại mật khẩu đã được gửi tới hộp thư. Đường dẫn có hiệu lực trong 30 phút và chỉ dùng được một lần.</p>
        </div>
        {sent.demoLink && (
          <div className="rounded-[var(--radius-tile)] border border-dashed border-vua p-4 text-sm">
            <p className="font-medium">Chế độ demo (chưa nối dịch vụ email)</p>
            <p className="mt-1 text-tro">Đường dẫn lẽ ra được gửi qua email:</p>
            <Link href={sent.demoLink.replace(/^https?:\/\/[^/]+/, "")} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-lam underline underline-offset-4">
              <KeyRound className="size-4" /> Mở trang đặt lại mật khẩu
            </Link>
          </div>
        )}
        <Link href="/login" className="block text-center text-sm text-tro hover:text-muc">Quay lại đăng nhập</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field label="Email đã đăng ký" htmlFor="email" error={error} required>
        <Input id="email" type="email" autoComplete="email" value={email} invalid={!!error} onChange={(e) => setEmail(e.target.value)} placeholder="ban@vidu.vn" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>Gửi đường dẫn đặt lại</Button>
      <p className="text-center text-sm text-tro">
        Nhớ ra rồi? <Link href="/login" className="font-semibold text-lam hover:underline">Đăng nhập</Link>
      </p>
    </form>
  );
}

const PORTAL_BY_ROLE: Record<string, string> = { BUYER: "/login", ARTISAN: "/login/artisan", ADMIN: "/login/admin" };

/** Bước 2: đặt mật khẩu mới bằng mã một lần trong đường dẫn. */
export function ResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const token = useSearchParams().get("token") ?? "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const parsed = resetPasswordSchema.safeParse({ ...form, token });
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      const res = await api<{ role: string }>("/api/auth/reset", { body: parsed.data });
      toast({ kind: "success", title: "Đã đặt mật khẩu mới", description: "Vui lòng đăng nhập lại bằng mật khẩu mới." });
      router.push(PORTAL_BY_ROLE[res.role] ?? "/login");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
      else setFormError(err instanceof ApiError ? err.message : "Không đặt lại được mật khẩu.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="rounded-[var(--radius-tile)] border border-doson/35 bg-doson/8 p-4 text-sm text-doson">
        Đường dẫn thiếu mã đặt lại. <Link href="/forgot-password" className="font-semibold underline">Yêu cầu đường dẫn mới</Link>
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-[var(--radius-tile)] border border-doson/35 bg-doson/8 px-3.5 py-3 text-sm text-doson">
          {formError} <Link href="/forgot-password" className="font-semibold underline">Yêu cầu đường dẫn mới</Link>
        </p>
      )}
      <Field label="Mật khẩu mới" htmlFor="newPassword" error={errors.newPassword} required>
        <Input id="newPassword" type="password" autoComplete="new-password" value={form.newPassword} invalid={!!errors.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      </Field>
      <PasswordMeter value={form.newPassword} />
      <Field label="Nhập lại mật khẩu mới" htmlFor="confirmPassword" error={errors.confirmPassword} required>
        <Input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} invalid={!!errors.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>Đặt mật khẩu mới</Button>
    </form>
  );
}
