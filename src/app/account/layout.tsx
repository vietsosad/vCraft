import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { ZoneShell } from "@/components/layout/zone-shell";

/** Khu khách hàng (men lam): đơn sỉ, lịch trải nghiệm, đã lưu, đánh giá, hồ sơ. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await pageRequireRole("/account", "BUYER");
  const reviews = (await pendingReviews(user.id)).length;
  return (
    <ZoneShell user={{ name: user.name, email: user.email, role: user.role, status: user.status }} subtitle={user.organization ?? user.email} badges={{ reviews }}>
      {children}
    </ZoneShell>
  );
}
