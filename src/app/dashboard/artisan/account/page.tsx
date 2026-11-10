import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/primitives";
import { ProfileForm, PasswordForm, SessionsCard } from "@/components/account/profile-forms";

export const metadata: Metadata = { title: "Tài khoản & bảo mật" };

export default async function AccountPage() {
  const session = await pageRequireRole("/dashboard/artisan/account", "ARTISAN");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id }, select: { name: true, email: true, phone: true, organization: true } });
  return (
    <>
      <PageHeader title="Tài khoản & bảo mật" description="Thông tin đăng nhập, mật khẩu và các thiết bị đang đăng nhập." />
      <div className="grid gap-6">
        <ProfileForm initial={{ name: user.name, email: user.email, phone: user.phone ?? "", organization: user.organization ?? "" }} showOrganization={false} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PasswordForm />
          <SessionsCard />
        </div>
      </div>
    </>
  );
}
