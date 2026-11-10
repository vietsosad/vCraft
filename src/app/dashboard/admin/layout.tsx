import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { ZoneShell } from "@/components/layout/zone-shell";

/** Khu Ban quản lý (men ngọc trên nền mực): duyệt hộ, điều phối, bản tin, người dùng, báo cáo, nhật ký. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await pageRequireRole("/dashboard/admin", "ADMIN");
  const approvals = await prisma.artisanProfile.count({ where: { verificationStatus: "PENDING" } });
  return (
    <ZoneShell user={{ name: user.name, email: user.email, role: user.role, status: user.status }} subtitle="Làng nghề Bát Tràng" badges={{ approvals }}>
      {children}
    </ZoneShell>
  );
}
