import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { BandHead } from "@/components/weave/band";
import { LetterList } from "@/components/weave/letters";

export const metadata: Metadata = { title: "Thư" };
export const dynamic = "force-dynamic";

export default async function AccountNotifications() {
  const user = await pageRequireRole("/account/notifications", "BUYER");
  const unread = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
  return (
    <div data-hue="n2">
      <BandHead hue="n2" title={unread ? "thư chưa đọc" : "Hộp thư"} count={unread} description="Chào giá mới, xác nhận lịch hẹn và tin từ Ban quản lý làng." />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-10 md:px-8">
        <LetterList userId={user.id} unread={unread} />
      </div>
    </div>
  );
}
