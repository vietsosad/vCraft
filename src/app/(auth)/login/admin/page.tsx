import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, PortalSwitch } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Cổng Ban quản lý" };

export default function AdminLoginPage() {
  return (
    <AuthShell
      portal="admin"
      image="village-street"
      title="Bảng điều phối làng"
      subtitle="Duyệt hộ nghề, điều phối đơn sỉ và phát bản tin cho cả làng."
      aside={<PortalSwitch current="admin" />}
    >
      <Suspense>
        <LoginForm demo={process.env.DEMO_MODE === "true"} portal="admin" />
      </Suspense>
    </AuthShell>
  );
}
