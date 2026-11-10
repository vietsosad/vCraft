import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/primitives";
import { NotificationsList } from "@/components/account/notifications-list";

export const metadata: Metadata = { title: "Thông báo" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await pageRequireRole("/dashboard/artisan/notifications", "ARTISAN");
  return (
    <>
      <PageHeader title="Thông báo" />
      <NotificationsList userId={user.id} />
    </>
  );
}
