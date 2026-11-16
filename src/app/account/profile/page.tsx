import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ProfileForm, PasswordForm, SessionsCard } from "@/components/account/profile-forms";
import { DrawerHead } from "@/components/cabinet/drawer-head";
import { WorkshopSeal } from "@/components/cabinet/hardware";

export const metadata: Metadata = { title: "Hồ sơ & bảo mật" };

export default async function AccountProfile() {
  const session = await pageRequireRole("/account/profile", "BUYER");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { name: true, email: true, phone: true, organization: true, createdAt: true },
  });
  const initials = user.name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]!.toUpperCase()).join("");

  return (
    <>
      <DrawerHead title="Hồ sơ" description="Thông tin trên danh thiếp này được tự điền vào yêu cầu báo giá và lịch hẹn. Các xưởng chỉ thấy khi bạn gửi yêu cầu hoặc đặt lịch." />
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* Danh thiếp: giấy dày, tên viết Alegreya, triện riêng của khách ở góc */}
        <div className="lg:sticky lg:top-24">
          <div className="paper relative aspect-[1.7/1] overflow-hidden rounded-[6px] p-5 shadow-[0_1px_0_rgb(28_18_12/0.08),0_24px_36px_-26px_rgb(28_18_12/0.7)] sm:p-6">
            <div className="hoi-van absolute inset-x-5 top-3 opacity-60" aria-hidden />
            <div className="flex h-full flex-col justify-end">
              <p className="font-serif text-[1.65rem] font-bold leading-tight">{user.name}</p>
              <p className="mt-0.5 text-sm text-tro">{user.organization || "Khách của làng gốm Bát Tràng"}</p>
              <div className="mt-3 space-y-0.5 text-[13px] text-muc/80">
                <p className="truncate">{user.email}</p>
                <p className="tabular">{user.phone || "Chưa có số điện thoại"}</p>
              </div>
            </div>
            <WorkshopSeal glyphs={initials} label={`Triện riêng của ${user.name}`} size={60} className="absolute bottom-5 right-5" style={{ rotate: "-6deg" }} />
          </div>
          <p className="mt-3 text-sm text-tro">Khách của vCraft từ {formatDate(user.createdAt)}.</p>
        </div>
        <div className="grid gap-6">
          <ProfileForm initial={{ name: user.name, email: user.email, phone: user.phone ?? "", organization: user.organization ?? "" }} showOrganization />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PasswordForm />
            <SessionsCard />
          </div>
        </div>
      </div>
    </>
  );
}
