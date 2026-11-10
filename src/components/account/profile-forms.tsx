"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Laptop, Smartphone, ShieldCheck } from "lucide-react";
import { api, ApiError, zodFieldErrors } from "@/lib/api-client";
import { changePasswordSchema, profileSchema } from "@/lib/validators/engagement";
import { timeAgo } from "@/lib/format";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { PasswordMeter } from "@/components/auth/password-meter";
import { useToast } from "@/components/ui/toast";

export function ProfileForm({ initial, showOrganization }: { initial: { name: string; email: string; phone: string; organization: string }; showOrganization: boolean }) {
  const [form, setForm] = useState({ name: initial.name, phone: initial.phone, organization: initial.organization });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      await api("/api/account/profile", { method: "PATCH", body: parsed.data });
      toast({ kind: "success", title: "Đã lưu hồ sơ" });
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
    <Card className="p-6">
      <h2 className="font-serif text-2xl font-bold normal-case">Thông tin cá nhân</h2>
      <form onSubmit={onSubmit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Họ và tên" htmlFor="pf-name" error={errors.name} required>
          <Input id="pf-name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email đăng nhập" htmlFor="pf-email" hint="Liên hệ Ban quản lý nếu cần đổi email.">
          <Input id="pf-email" value={initial.email} disabled readOnly />
        </Field>
        <Field label="Số điện thoại" htmlFor="pf-phone" error={errors.phone}>
          <Input id="pf-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 678" />
        </Field>
        {showOrganization && (
          <Field label="Tổ chức / doanh nghiệp" htmlFor="pf-org" hint="Tự điền vào yêu cầu báo giá sỉ.">
            <Input id="pf-org" autoComplete="organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </Field>
        )}
        <div className="sm:col-span-2">
          <Button type="submit" loading={loading}>Lưu thay đổi</Button>
        </div>
      </form>
    </Card>
  );
}

export function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodFieldErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    try {
      const res = await api<{ revokedSessions: number }>("/api/account/password", { body: parsed.data });
      toast({
        kind: "success",
        title: "Đã đổi mật khẩu",
        description: res.revokedSessions ? `Đã đăng xuất ${res.revokedSessions} thiết bị khác.` : "Thiết bị này vẫn đăng nhập.",
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        if (!Object.keys(err.fieldErrors).length) toast({ kind: "error", title: err.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-serif text-2xl font-bold normal-case">Đổi mật khẩu</h2>
      <p className="mt-1 text-sm text-tro">Sau khi đổi, mọi thiết bị khác sẽ bị đăng xuất.</p>
      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        <Field label="Mật khẩu hiện tại" htmlFor="pw-current" error={errors.currentPassword} required>
          <Input id="pw-current" type="password" autoComplete="current-password" value={form.currentPassword} invalid={!!errors.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mật khẩu mới" htmlFor="pw-new" error={errors.newPassword} required>
            <Input id="pw-new" type="password" autoComplete="new-password" value={form.newPassword} invalid={!!errors.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          </Field>
          <Field label="Nhập lại mật khẩu mới" htmlFor="pw-confirm" error={errors.confirmPassword} required>
            <Input id="pw-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} invalid={!!errors.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </Field>
        </div>
        <PasswordMeter value={form.newPassword} />
        <Button type="submit" variant="earth" loading={loading}>Đổi mật khẩu</Button>
      </form>
    </Card>
  );
}

type SessionRow = { id: string; userAgent: string | null; ipAddress: string | null; lastSeenAt: string; current: boolean };

function deviceName(ua: string | null) {
  if (!ua) return "Thiết bị không rõ";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Thiết bị";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : /curl|node|undici/i.test(ua) ? "Công cụ dòng lệnh" : "Trình duyệt";
  return `${br} trên ${os}`;
}

export function SessionsCard() {
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  useEffect(() => {
    api<SessionRow[]>("/api/account/sessions").then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-bold normal-case"><ShieldCheck className="size-5 text-ngoc" /> Thiết bị đang đăng nhập</h2>
      <ul className="mt-4 divide-y divide-vua">
        {rows === null && <li className="py-3 text-sm text-tro">Đang tải…</li>}
        {rows?.map((s) => {
          const mobile = /Android|iPhone|iPad/.test(s.userAgent ?? "");
          const Icon = mobile ? Smartphone : Laptop;
          return (
            <li key={s.id} className="flex items-center gap-3 py-3 text-sm">
              <Icon className="size-5 text-tro" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium">{deviceName(s.userAgent)}</span>
                <span className="block text-xs text-tro">{s.ipAddress ?? "IP không rõ"} · hoạt động {timeAgo(s.lastSeenAt)}</span>
              </span>
              {s.current && <span className="rounded-[4px] bg-ngoc-nhat px-2 py-0.5 text-xs font-semibold text-ngoc">Thiết bị này</span>}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
