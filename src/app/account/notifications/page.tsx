import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { DrawerHead } from "@/components/cabinet/drawer-head";
import { LetterList } from "@/components/cabinet/letter-list";

export const metadata: Metadata = { title: "Hộc thư" };
export const dynamic = "force-dynamic";

export default async function AccountNotifications() {
  const user = await pageRequireRole("/account/notifications", "BUYER");
  return (
    <>
      <DrawerHead title="Hộc thư" description="Chào giá mới, lịch hẹn được xác nhận và tin từ Ban quản lý làng." />
      <LetterList userId={user.id} />
    </>
  );
}
