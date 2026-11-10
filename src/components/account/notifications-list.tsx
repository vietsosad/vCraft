import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate, timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";
import { MarkAllRead } from "./mark-all-read";

/** Danh sách thông báo đầy đủ, nhóm theo ngày – dùng chung cho cả ba khu. */
export async function NotificationsList({ userId }: { userId: string }) {
  const items = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  if (items.length === 0) return <EmptyState title="Chưa có thông báo nào" description="Lời mời chào giá, lịch hẹn và tin từ Ban quản lý sẽ xuất hiện ở đây." />;

  const groups = new Map<string, typeof items>();
  for (const n of items) {
    const key = formatDate(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-8">
      {unread > 0 && (
        <div className="flex items-center justify-between rounded-[var(--radius-tile)] bg-lam-nhat px-4 py-3 text-sm">
          <span>Bạn có <strong>{unread}</strong> thông báo chưa đọc.</span>
          <MarkAllRead />
        </div>
      )}
      {[...groups.entries()].map(([day, list], gi) => (
        <section key={day} data-reveal style={{ ["--d" as string]: `${gi * 60}ms` }}>
          <h2 className="label mb-3">{day}</h2>
          <ul className="overflow-hidden rounded-[8px] border border-vua bg-su">
            {list.map((n) => (
              <li key={n.id} className="border-b border-vua last:border-0">
                <Link href={n.link ?? "#"} className={cn("flex gap-3 px-5 py-4 transition hover:bg-nga-dam/60", !n.readAt && "bg-lam-nhat/50")}>
                  <span className={cn("mt-2 size-2 shrink-0 rotate-45 rounded-[1px]", n.readAt ? "bg-vua" : "bg-datnung")} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{n.title}</span>
                    <span className="block text-sm text-tro">{n.body}</span>
                  </span>
                  <span className="shrink-0 text-xs text-tro">{timeAgo(n.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
