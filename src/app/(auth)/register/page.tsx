import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Tạo tài khoản khách hàng" };

export default function RegisterPage() {
  return (
    <AuthShell portal="customer" image="shop-blue-white" title="Tạo tài khoản" subtitle="Để đặt hàng sỉ, đặt lịch nặn gốm, lưu tác phẩm yêu thích và nhận thông báo từ các xưởng.">
      <RegisterForm />
    </AuthShell>
  );
}
