import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ProfileForm, PasswordForm, SessionsCard } from "@/components/account/profile-forms";
import { BandHead } from "@/components/weave/band";
import { WovenBadge } from "@/components/weave/woven";

export const metadata: Metadata = { title: "Hồ sơ & bảo mật" };

export default async function AccountProfile() {
  const session = await pageRequireRole("/account/profile", "BUYER");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.id },
    select: { name: true, email: true, phone: true, organization: true, createdAt: true },
  });

  return (
    <div data-hue="n1">
      <BandHead hue="n1" title="Hồ sơ" description="Thông tin trên nhãn dệt này được tự điền vào yêu cầu báo giá và lịch hẹn. Các xưởng chỉ thấy khi bạn gửi yêu cầu hoặc đặt lịch." />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 px-4 pb-16 pt-10 md:px-8 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
        {/* Nhãn dệt tên khách: như nhãn may trên áo thổ cẩm, chữ cái pixel dệt ở góc */}
        <div className="lg:sticky lg:top-28">
          <div className="band p-6" data-hue="n8" style={{ backgroundImage: "none" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xl font-bold leading-snug">{user.name}</p>
                <p className="soft mt-1 text-sm">{user.organization || "Khách của làng gốm Bát Tràng"}</p>
              </div>
              <WovenBadge name={user.name} size={58} />
            </div>
            <div className="mt-6 space-y-1 border-t border-white/15 pt-4 text-sm">
              <p className="truncate">{user.email}</p>
              <p className="tabular">{user.phone || "Chưa có số điện thoại"}</p>
            </div>
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
    </div>
  );
}
