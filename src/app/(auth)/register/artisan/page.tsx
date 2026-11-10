import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ArtisanRegisterForm } from "@/components/auth/artisan-register-form";

export const metadata: Metadata = { title: "Đăng ký hộ nghề" };

export default function ArtisanRegisterPage() {
  return (
    <AuthShell
      portal="artisan"
      image="artisan-wheel"
      wide
      title="Đăng ký hộ nghề"
      subtitle="Ban quản lý đối chiếu với danh sách hộ làm nghề trong làng trước khi cấp huy hiệu xác thực, để tránh hàng nhái trà trộn."
    >
      <ArtisanRegisterForm />
    </AuthShell>
  );
}
