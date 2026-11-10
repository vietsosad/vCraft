import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Đặt lại mật khẩu", robots: { index: false } };

export default function ResetPasswordPage() {
  return (
    <AuthShell portal="customer" image="kiln-loading" title="Mật khẩu mới" subtitle="Sau khi đặt lại, mọi thiết bị đang đăng nhập sẽ được đăng xuất để bảo vệ tài khoản.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
