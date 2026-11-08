"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { registerBuyerSchema } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EmailField } from "@/components/auth/email-field";
import { PasswordMeter } from "@/components/auth/password-meter";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const validateField = (k: keyof typeof form) => {
    const r = registerBuyerSchema.safeParse(form);
    const msg = r.success ? undefined : r.error.issues.find((i) => i.path[0] === k)?.message;
    setErrors((e) => ({ ...e, [k]: msg ?? "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = registerBuyerSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setLoading(true);
    try {
      await api("/api/auth/register", { body: parsed.data });
      toast({ kind: "success", title: "Tạo tài khoản thành công", description: "Bạn đã có thể gửi yêu cầu báo giá sỉ." });
      router.push("/b2b-quotes");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        toast({ kind: "error", title: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <p className="eyebrow">Khách hàng · Khách sỉ</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Tạo tài khoản</h1>
      <p className="mb-8 mt-2 text-ash">Để đặt hàng sỉ, theo dõi đơn và nhận thông báo từ các xưởng.</p>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Họ và tên" htmlFor="name" error={errors.name} required>
          <Input id="name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name")(e.target.value)} onBlur={() => validateField("name")} />
        </Field>
        <EmailField value={form.email} onChange={set("email")} error={errors.email} onError={(m) => setErrors((e) => ({ ...e, email: m ?? "" }))} />
        <Field label="Số điện thoại" htmlFor="phone" error={errors.phone} required hint="Tự chuẩn hóa về dạng +84">
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} invalid={!!errors.phone} onChange={(e) => set("phone")(e.target.value)} onBlur={() => validateField("phone")} placeholder="0912 345 678" />
        </Field>
        <Field label="Tổ chức / doanh nghiệp" htmlFor="organization" hint="Không bắt buộc – tự điền vào yêu cầu báo giá">
          <Input id="organization" autoComplete="organization" value={form.organization} onChange={(e) => set("organization")(e.target.value)} placeholder="Trường Đại học Công nghệ" />
        </Field>
        <Field label="Mật khẩu" htmlFor="password" error={errors.password} required>
          <Input id="password" type="password" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={(e) => set("password")(e.target.value)} />
        </Field>
        <PasswordMeter value={form.password} />
        <Button type="submit" size="lg" className="w-full" loading={loading}>Tạo tài khoản</Button>
        <p className="text-center text-sm text-ash">
          Bạn là hộ làm gốm? <Link href="/register/artisan" className="text-terracotta hover:underline">Đăng ký hộ nghề</Link>
        </p>
      </form>
    </div>
  );
}
