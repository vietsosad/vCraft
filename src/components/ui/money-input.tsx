"use client";

import { Input } from "./form";

/**
 * Ô nhập tiền: hiển thị "1.250.000" khi gõ, lưu giá trị số nguyên.
 * Tự loại ký tự không phải số – người dùng có thể dán "1,250,000 đ".
 */
export function MoneyInput({ id, value, onChange, invalid, placeholder, suffix = "₫" }: {
  id: string; value: number | ""; onChange: (v: number | "") => void; invalid?: boolean; placeholder?: string; suffix?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="numeric"
        invalid={invalid}
        value={value === "" ? "" : value.toLocaleString("vi-VN")}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
          onChange(digits ? Number(digits) : "");
        }}
        placeholder={placeholder}
        className="pr-10 font-mono tabular"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-ash">{suffix}</span>
    </div>
  );
}
