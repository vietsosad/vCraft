import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        title="403 · Bạn không có quyền vào khu vực này"
        description="Khu vực này dành cho vai trò khác (nghệ nhân hoặc Ban quản lý). Hãy đăng nhập bằng tài khoản phù hợp."
        action={<div className="flex gap-2"><ButtonLink href="/">Về trang chủ</ButtonLink><ButtonLink href="/login" variant="outline">Đổi tài khoản</ButtonLink></div>}
      />
    </div>
  );
}
