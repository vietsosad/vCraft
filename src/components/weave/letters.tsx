import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { MarkAllRead } from "@/components/account/mark-all-read";
import { cn } from "@/lib/cn";

/** Thư của khách: mỗi thông báo là một miếng vải khâu; thư chưa mở mang nhãn chỉ vàng cho tới khi mở. */
export async function LetterList({ userId }: { userId: string }) {
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  if (items.length === 0) {
    return <p className="text-lg text-tro">Chưa có thư nào. Lời mời chào giá, lịch hẹn được xác nhận và tin từ Ban quản lý sẽ về đây.</p>;
  }
  const groups = new Map<string, typeof items>();
  for (const n of items) {
    const key = formatDate(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-10" data-hue="n2">
      {unread > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg">
            Còn <strong className="so text-lg text-chu-nau">{unread}</strong> thư chưa mở.
          </p>
          <MarkAllRead />
        </div>
      )}
      {[...groups.entries()].map(([day, list]) => (
        <section key={day}>
          <h2 className="mb-3 flex items-baseline gap-2 text-base">
            {day} <span className="nhan text-tro">{list.length} thư</span>
          </h2>
          <ul className="space-y-2.5">
            {list.map((n) => (
              <li key={n.id}>
                <Link href={n.link ?? "#"} className={cn("patch flex items-start gap-4 px-5 py-4", n.readAt && "opacity-80")}>
                  {n.readAt ? (
                    <span className="nhan mt-0.5 w-12 shrink-0 text-tro">Đã mở</span>
                  ) : (
                    <span className="nhan mt-0.5 w-12 shrink-0 bg-nghe px-1.5 py-1 text-center text-[#2a1d0c]">Mới</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block leading-snug", n.readAt ? "font-medium" : "font-semibold")}>{n.title}</span>
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
