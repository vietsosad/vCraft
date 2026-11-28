import { prisma } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { MarkAllRead } from "@/components/account/mark-all-read";
import { NotificationLink } from "@/components/account/notification-link";
import { cn } from "@/lib/cn";

/** Thư của khách: mỗi thông báo là một miếng vải khâu; thư chưa mở mang nhãn chỉ vàng cho tới khi mở. */
export async function LetterList({ userId, unread }: { userId: string; unread: number }) {
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  if (items.length === 0) {
    return <p className="text-lg text-tro">Chưa có thư nào. Lời mời chào giá, lịch hẹn được xác nhận và tin từ Ban quản lý sẽ về đây.</p>;
  }
  const groups = new Map<string, typeof items>();
  for (const n of items) {
    const key = formatDate(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  return (
    <div className="space-y-10" data-hue="n2">
      {unread > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
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
              <li key={n.id} data-reveal="weave">
                <NotificationLink id={n.id} href={n.link} read={!!n.readAt} className="patch grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-3 px-4 py-4 text-left sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-5">
                  <span className={cn("nhan mt-0.5 px-2 py-1", n.readAt ? "text-tro" : "rounded bg-lam-nhat text-chu-nau")}>
                    {n.readAt ? "Đã đọc" : "Chưa đọc"}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block leading-snug", n.readAt ? "font-medium" : "font-semibold")}>{n.title}</span>
                    <span className="mt-0.5 block text-sm text-tro">{n.body}</span>
                  </span>
                  <span className="col-start-2 text-xs text-tro sm:col-start-3 sm:pt-1">{timeAgo(n.createdAt)}</span>
                </NotificationLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
