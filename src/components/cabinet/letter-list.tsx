import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { MarkAllRead } from "@/components/account/mark-all-read";
import { ShelfTitle } from "./drawer-head";
import { cn } from "@/lib/cn";

/** Hộc thư của khách: mỗi thông báo là một lá thư; thư chưa mở còn nguyên dấu sáp son. */
export async function LetterList({ userId }: { userId: string }) {
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  if (items.length === 0) {
    return <p className="font-serif text-lg text-tro">Hộc thư còn trống. Lời mời chào giá, lịch hẹn được xác nhận và tin từ Ban quản lý sẽ gửi về đây.</p>;
  }
  const groups = new Map<string, typeof items>();
  for (const n of items) {
    const key = formatDate(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-10">
      {unread > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-muc/20 pb-4">
          <p className="font-serif text-lg">
            Còn <strong className="font-bold text-datnung">{unread} lá thư</strong> chưa mở.
          </p>
          <MarkAllRead />
        </div>
      )}
      {[...groups.entries()].map(([day, list], gi) => (
        <section key={day} data-reveal style={{ ["--d" as string]: `${Math.min(gi, 5) * 60}ms` }}>
          <ShelfTitle count={list.length} className="text-[1.15rem]">{day}</ShelfTitle>
          <ul className="space-y-2.5">
            {list.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.link ?? "#"}
                  className={cn(
                    "paper group flex items-start gap-4 rounded-[4px] px-4 py-3.5 transition-[translate,box-shadow] duration-500 [transition-timing-function:var(--ease-out-expo)] hover:-translate-y-0.5 sm:px-5",
                    n.readAt
                      ? "shadow-[0_1px_0_rgb(28_18_12/0.06)]"
                      : "shadow-[0_1px_0_rgb(28_18_12/0.08),0_14px_22px_-16px_rgb(28_18_12/0.6)]",
                  )}
                >
                  <span className={n.readAt ? "wax-open mt-0.5" : "wax mt-0.5"} aria-label={n.readAt ? "Đã mở" : "Chưa mở"}>
                    <span className="font-display text-[12px]">v</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block leading-snug", n.readAt ? "font-medium text-muc/85" : "font-semibold")}>{n.title}</span>
                    <span className="mt-0.5 block text-sm text-tro">{n.body}</span>
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs text-tro">{timeAgo(n.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
