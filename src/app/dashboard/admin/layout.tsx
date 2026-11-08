import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await pageRequireRole("/dashboard/admin", "ADMIN");
  const pending = await prisma.artisanProfile.count({ where: { verificationStatus: "PENDING" } });
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <p className="eyebrow !text-cobalt">Ban quản lý làng nghề Bát Tràng</p>
      <h1 className="mt-2 text-4xl">Bảng điều phối</h1>
      <div className="mt-6">
        <DashboardNav
          tone="cobalt"
          items={[
            { href: "/dashboard/admin", label: "Tổng quan", exact: true },
            { href: "/dashboard/admin/approvals", label: `Duyệt hộ nghề${pending ? ` (${pending})` : ""}` },
            { href: "/dashboard/admin/coordination", label: "Điều phối đơn sỉ" },
            { href: "/dashboard/admin/news", label: "Tin tức" },
            { href: "/dashboard/admin/users", label: "Tài khoản" },
          ]}
        />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
