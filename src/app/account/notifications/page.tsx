import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/primitives";
import { NotificationsList } from "@/components/account/notifications-list";

export const metadata: Metadata = { title: "Thông báo" };
export const dynamic = "force-dynamic";

export default async function AccountNotifications() {
  const user = await pageRequireRole("/account/notifications", "BUYER");
  return (
    <>
      <PageHeader title="Thông báo" description="Chào giá mới, lịch hẹn được xác nhận và tin từ Ban quản lý." />
      <NotificationsList userId={user.id} />
    </>
  );
}
