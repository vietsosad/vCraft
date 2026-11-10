import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = { title: "Quên mật khẩu" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell portal="customer" image="kiln-loading" title="Quên mật khẩu" subtitle="Nhập email bạn đã đăng ký, chúng tôi gửi đường dẫn đặt lại mật khẩu dùng một lần.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
