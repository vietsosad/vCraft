import Link from "next/link";
import { Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { ZoneShell } from "@/components/layout/zone-shell";

/** Khu nghệ nhân (đất nung): xưởng, lô & nhật ký, sản phẩm, báo giá, lịch trải nghiệm, đánh giá, thống kê. */
export default async function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const user = await pageRequireRole("/dashboard/artisan", "ARTISAN");
  const profile = await prisma.artisanProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, workshopName: true, slug: true, verificationStatus: true, verificationNote: true },
  });
  const [openInvites, pendingBookings] = profile
    ? await Promise.all([
        prisma.quoteInvitation.count({
          where: { artisanId: profile.id, quoteRequest: { status: { in: ["SENT_TO_ARTISANS", "ARTISANS_BIDDING"] }, bids: { none: { artisanId: profile.id } } } },
        }),
        prisma.experienceBooking.count({ where: { artisanId: profile.id, status: "PENDING" } }),
      ])
    : [0, 0];

  const banner =
    profile?.verificationStatus === "PENDING" ? (
      <div className="border-b border-vangrom/40 bg-vangrom/12 px-4 py-3 text-sm md:px-8">
        <p className="mx-auto flex max-w-6xl gap-3">
          <Clock className="mt-0.5 size-5 shrink-0 text-vangrom-dam" aria-hidden />
          <span>
            Ban quản lý đang xem hồ sơ của bạn, thường trong vòng 2 ngày làm việc. Trong lúc chờ, bạn có thể hoàn thiện hồ sơ xưởng và lưu
            sản phẩm ở dạng nháp; sản phẩm chỉ hiển thị công khai sau khi được duyệt.
          </span>
        </p>
      </div>
    ) : profile?.verificationStatus === "REJECTED" ? (
      <div className="border-b border-doson/30 bg-doson/8 px-4 py-3 text-sm md:px-8">
        <p className="mx-auto flex max-w-6xl gap-3">
          <XCircle className="mt-0.5 size-5 shrink-0 text-doson" aria-hidden />
          <span>
            Hồ sơ cần bổ sung: {profile.verificationNote}.{" "}
            <Link href="/dashboard/artisan/profile" className="font-semibold underline">Cập nhật hồ sơ xưởng</Link> rồi liên hệ Ban quản lý.
          </span>
        </p>
      </div>
    ) : null;

  return (
    <ZoneShell
      user={{ name: user.name, email: user.email, role: user.role, status: user.status }}
      subtitle={profile?.workshopName}
      badges={{ quotes: openInvites, bookings: pendingBookings }}
      banner={banner}
    >
      {children}
    </ZoneShell>
  );
}
