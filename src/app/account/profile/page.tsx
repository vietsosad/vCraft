import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/primitives";
import { ProfileForm, PasswordForm, SessionsCard } from "@/components/account/profile-forms";

export const metadata: Metadata = { title: "Hồ sơ & bảo mật" };

export default async function AccountProfile() {
  const session = await pageRequireRole("/account/profile", "BUYER");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id }, select: { name: true, email: true, phone: true, organization: true } });
  return (
    <>
      <PageHeader title="Hồ sơ & bảo mật" description="Thông tin liên hệ dùng để tự điền vào yêu cầu báo giá và lịch hẹn." />
      <div className="grid gap-6">
        <ProfileForm initial={{ name: user.name, email: user.email, phone: user.phone ?? "", organization: user.organization ?? "" }} showOrganization />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PasswordForm />
          <SessionsCard />
        </div>
      </div>
    </>
  );
}
