import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Đăng nhập để đặt hàng sỉ, quản lý xưởng hoặc điều phối làng nghề.">
      <Suspense>
        <LoginForm demo={process.env.DEMO_MODE === "true"} />
      </Suspense>
    </AuthShell>
  );
}
