import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, PortalSwitch } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Cổng nghệ nhân" };

export default function ArtisanLoginPage() {
  return (
    <AuthShell
      portal="artisan"
      image="hands-wheel"
      title="Vào xưởng"
      subtitle="Ghi nhật ký mẻ gốm, nhận lời mời chào giá và lịch khách ghé nặn gốm."
      aside={<PortalSwitch current="artisan" />}
    >
      <Suspense>
        <LoginForm demo={process.env.DEMO_MODE === "true"} portal="artisan" />
      </Suspense>
    </AuthShell>
  );
}
