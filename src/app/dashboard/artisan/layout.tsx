import Link from "next/link";
import { Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { VerifiedSeal } from "@/components/ui/primitives";

export default async function ArtisanLayout({ children }: { children: React.ReactNode }) {
  const user = await pageRequireRole("/dashboard/artisan", "ARTISAN");
  const profile = await prisma.artisanProfile.findUnique({
    where: { userId: user.id },
    select: { workshopName: true, slug: true, verificationStatus: true, verificationNote: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Xưởng của tôi</p>
          <h1 className="mt-2 text-4xl">{profile?.workshopName}</h1>
        </div>
        {profile?.verificationStatus === "APPROVED" ? (
          <div className="flex items-center gap-3">
            <VerifiedSeal />
            <Link href={`/artisans/${profile.slug}`} className="text-sm text-terracotta hover:underline">Xem trang công khai →</Link>
          </div>
        ) : null}
      </div>

      {profile?.verificationStatus === "PENDING" && (
        <p className="mt-5 flex gap-3 rounded-[var(--radius-tile)] border border-kiln/40 bg-kiln/10 p-4 text-sm">
          <Clock className="mt-0.5 size-5 shrink-0 text-kiln" />
          <span>Ban quản lý đang xem hồ sơ của bạn, thường trong vòng 2 ngày làm việc. Trong lúc chờ, bạn có thể hoàn thiện hồ sơ xưởng và lưu sản phẩm ở dạng nháp; sản phẩm chỉ hiển thị công khai sau khi được duyệt.</span>
        </p>
      )}
      {profile?.verificationStatus === "REJECTED" && (
        <p className="mt-5 flex gap-3 rounded-[var(--radius-tile)] border border-terracotta/40 bg-terracotta/5 p-4 text-sm">
          <XCircle className="mt-0.5 size-5 shrink-0 text-terracotta" />
          <span>Hồ sơ cần bổ sung: {profile.verificationNote}. Vui lòng cập nhật hồ sơ xưởng và liên hệ Ban quản lý.</span>
        </p>
      )}

      <div className="mt-6">
        <DashboardNav
          items={[
            { href: "/dashboard/artisan", label: "Tổng quan", exact: true },
            { href: "/dashboard/artisan/profile", label: "Hồ sơ xưởng" },
            { href: "/dashboard/artisan/products", label: "Sản phẩm" },
            { href: "/dashboard/artisan/batches", label: "Lô & nhật ký" },
            { href: "/dashboard/artisan/quotes", label: "Cơ hội báo giá" },
          ]}
        />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
