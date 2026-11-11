import type { ElementType } from "react";
import { cn } from "@/lib/cn";

/**
 * Tiêu đề hiện từng từ khi cuộn tới (CSS + bộ chạy chuyển động, không cần JS riêng).
 * Mỗi từ trồi lên khỏi một khe có lề đủ cho dấu tiếng Việt chồng. Trình đọc màn hình đọc câu nguyên vẹn.
 */
export function RevealText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={cn(className)} data-reveal="words" style={{ ["--d" as string]: `${delay}ms` }}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="w">
              <span style={{ ["--i" as string]: i }}>{w}</span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
