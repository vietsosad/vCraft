import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ProfileForm, PasswordForm, SessionsCard } from "@/components/account/profile-forms";
import { LangHead, Seal } from "@/components/lang/pieces";
import { HoiVan } from "@/components/lang/glyphs";

export const metadata: Metadata = { title: "Hồ sơ & bảo mật" };

export default async function AccountProfile() {
  const session = await pageRequireRole("/account/profile", "BUYER");
  const [user, visits, traced, orders] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.id },
      select: { name: true, email: true, phone: true, organization: true, createdAt: true },
    }),
    prisma.experienceBooking.count({ where: { userId: session.id, status: "COMPLETED" } }),
    prisma.scanEvent.groupBy({ by: ["batchId"], where: { userId: session.id } }).then((r) => r.length),
    prisma.quoteRequest.count({ where: { buyerId: session.id, status: "DELIVERED" } }),
  ]);

  return (
    <>
      <LangHead icon="hoso" title="Hồ sơ" lead={<p>Thông tin liên hệ được điền sẵn khi bạn gửi yêu cầu báo giá hoặc đặt buổi nặn gốm.</p>} />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-4 pb-16 pt-9 md:px-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        {/* Thẻ du khách: tấm thẻ men lam viền hồi văn mà làng cấp cho người ghé thăm */}
        <div className="lg:sticky lg:top-[calc(var(--demo-h)+8.5rem)] xl:top-[calc(var(--demo-h)+6rem)]">
          <div className="gan-vien overflow-hidden rounded-[12px] shadow-lift">
            <div className="tile-lam relative px-6 pb-6 pt-5 text-giay">
              <p className="font-display text-[13px] font-bold tracking-[0.08em] text-giay/85 dau-hieu">Thẻ du khách · làng gốm Bát Tràng</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-[1.6rem] font-bold leading-tight giong-ke">{user.name}</p>
                  <p className="mt-1 text-sm text-giay/85">{user.organization || "Khách của làng"}</p>
                </div>
                <Seal name={user.name} size={56} className="!bg-none !bg-giay !text-lam shadow-none" />
              </div>
            </div>
            <HoiVan id="lang-hoi-van-the" className="bg-lam-nen text-giay opacity-60" />
            <div className="space-y-1 bg-su px-6 py-4 text-sm">
              <p className="truncate">{user.email}</p>
              <p className="tabular">{user.phone || "Chưa có số điện thoại"}</p>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-vua border-t border-vua bg-su text-center">
              <div className="px-2 py-3"><dt className="text-[13px] text-tro">Buổi nặn</dt><dd className="font-display text-[1.6rem] leading-tight text-lam dau-hieu">{visits}</dd></div>
              <div className="px-2 py-3"><dt className="text-[13px] text-tro">Con triện</dt><dd className="font-display text-[1.6rem] leading-tight text-lam dau-hieu">{traced}</dd></div>
              <div className="px-2 py-3"><dt className="text-[13px] text-tro">Mẻ ra lò</dt><dd className="font-display text-[1.6rem] leading-tight text-lam dau-hieu">{orders}</dd></div>
            </dl>
          </div>
          <p className="mt-3 text-sm text-tro">Khách của vCraft từ {formatDate(user.createdAt)}.</p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-6">
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
