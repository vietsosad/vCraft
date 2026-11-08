import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await pageRequireRole("/notifications");
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl">Thông báo</h1>
      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState title="Chưa có thông báo nào" />
        ) : (
          <ul className="divide-y divide-line rounded-[var(--radius-tile)] border border-line bg-white/70">
            {items.map((n) => (
              <li key={n.id}>
                <Link href={n.link ?? "#"} className={`block px-5 py-4 hover:bg-bisque/40 ${n.readAt ? "" : "bg-terracotta/[0.04]"}`}>
                  <p className="font-medium">{!n.readAt && <span className="mr-2 inline-block size-2 rounded-full bg-terracotta" />}{n.title}</p>
                  <p className="text-sm text-ash">{n.body}</p>
                  <p className="mt-1 font-mono text-[11px] text-ash">{formatDate(n.createdAt, true)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
