"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Hiển thị điểm sao (chỉ đọc). */
export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md"; className?: string }) {
  const s = size === "md" ? "size-5" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-vangrom", className)} aria-label={`${value.toFixed(1)} trên 5 sao`} role="img">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block">
            <Star className={cn(s, "text-vua")} fill="currentColor" strokeWidth={0} aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={s} fill="currentColor" strokeWidth={0} aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}

const WORDS = ["", "Chưa hài lòng", "Tạm được", "Hài lòng", "Rất hài lòng", "Tuyệt vời"];

/** Chọn số sao: dùng được bằng bàn phím (nhóm radio). */
export function StarInput({ value, onChange, name = "rating" }: { value: number; onChange: (v: number) => void; name?: string }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Số sao" className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <label key={i} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(i)}>
            <input type="radio" name={name} value={i} checked={value === i} onChange={() => onChange(i)} className="peer sr-only" />
            <Star
              className={cn("size-8 transition-transform duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-lam", i <= shown ? "scale-110 text-vangrom" : "text-vua")}
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
            <span className="sr-only">{i} sao</span>
          </label>
        ))}
      </div>
      <span className="text-sm font-medium text-tro">{WORDS[shown]}</span>
    </div>
  );
}
