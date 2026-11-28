import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { MarkAllRead } from "@/components/account/mark-all-read";
import { LangHead, LetterCard, hoaDau, soChu } from "@/components/lang/pieces";

export const metadata: Metadata = { title: "Bến thư" };
export const dynamic = "force-dynamic";

/** Bến thư: thông báo là những lá thư giấy dó, xếp theo ngày; thư chưa mở mang dấu son "Mới" cho tới khi mở. */
export default async function AccountNotifications() {
  const user = await pageRequireRole("/account/notifications", "BUYER");
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const groups = new Map<string, typeof items>();
  for (const n of items) {
    const key = formatDate(n.createdAt);
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }

  return (
    <>
      <LangHead
        icon="thu"
        title={unread ? "lá thư chưa đọc" : "Bến thư"}
        count={unread}
        lead={<p>{unread ? `${hoaDau(soChu(unread))} lá thư mới cập bến. ` : ""}Chào giá mới, lịch hẹn được xác nhận và tin từ Ban quản lý làng.</p>}
        actions={unread > 0 ? <MarkAllRead variant="outline" size="md" /> : undefined}
      />
      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 pt-9 md:px-6">
        {items.length === 0 ? (
          <p className="font-serif text-[1.25rem] text-tro giong-ke">Chưa có thư nào. Lời mời chào giá, lịch hẹn được xác nhận và tin từ Ban quản lý sẽ cập bến ở đây.</p>
        ) : (
          [...groups.entries()].map(([day, list]) => (
            <section key={day} aria-labelledby={`ngay-${day}`}>
              <h2 id={`ngay-${day}`} className="mb-3.5 flex flex-wrap items-baseline gap-x-3 font-serif text-[1.35rem] font-bold leading-tight giong-ke">
                {day} <span className="font-sans text-sm font-semibold text-tro">{list.length} thư</span>
              </h2>
              <ul className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((n, i) => <li key={n.id} className="gan-vien" style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}><LetterCard n={n} /></li>)}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}
