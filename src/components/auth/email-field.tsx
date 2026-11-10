"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { emailSchema } from "@/lib/validators/auth";
import { Field, Input } from "@/components/ui/form";

/** Ô email kiểm tra bất đồng bộ khi rời ô: định dạng đúng và chưa được đăng ký. */
export function EmailField({ value, onChange, error, onError }: { value: string; onChange: (v: string) => void; error?: string; onError: (msg?: string) => void }) {
  const [available, setAvailable] = useState(false);

  async function check() {
    setAvailable(false);
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) return onError(parsed.error.issues[0].message);
    try {
      const res = await api<{ available: boolean }>(`/api/auth/check-email?email=${encodeURIComponent(parsed.data)}`);
      if (res.available) {
        onError(undefined);
        setAvailable(true);
      } else onError("Email này đã được đăng ký. Bạn có muốn đăng nhập?");
    } catch {
      /* bỏ qua lỗi mạng, server sẽ kiểm tra lại khi gửi */
    }
  }

  return (
    <Field label="Email" htmlFor="email" error={error} required hint={available ? <span className="inline-flex items-center gap-1 text-ngoc"><CheckCircle2 className="size-3.5" /> Email dùng được</span> : undefined}>
      <Input id="email" type="email" autoComplete="email" value={value} invalid={!!error} onBlur={check}
        onChange={(e) => { onChange(e.target.value); setAvailable(false); }} placeholder="ban@vidu.vn" />
    </Field>
  );
}
