import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, PortalSwitch } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập khách hàng" };

export default function LoginPage() {
  return (
    <AuthShell
      portal="customer"
      image="artisan-paint"
      title="Chào mừng trở lại"
      subtitle="Theo dõi đơn đặt sỉ, lịch nặn gốm và những tác phẩm bạn đã lưu."
      aside={<PortalSwitch current="customer" />}
    >
      <Suspense>
        <LoginForm demo={process.env.DEMO_MODE === "true"} portal="customer" />
      </Suspense>
    </AuthShell>
  );
}
