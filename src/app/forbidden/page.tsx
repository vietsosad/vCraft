import { getCurrentUser } from "@/lib/auth/session";
import { ButtonLink } from "@/components/ui/button";
import { MissingTile } from "@/components/ui/missing-tile";
import { ZONES } from "@/components/layout/zones";

/** 403: vào nhầm khu của vai trò khác – chỉ đường về khu của chính mình. */
export default async function ForbiddenPage() {
  const user = await getCurrentUser();
  const zone = user ? ZONES[user.role] : null;
  return (
    <MissingTile
      code="403"
      title="Khu này dành cho vai trò khác"
      actions={
        zone ? (
          <><ButtonLink href={zone.home}>Về {zone.name.toLowerCase()}</ButtonLink><ButtonLink href="/" variant="outline">Trang triển lãm</ButtonLink></>
        ) : (
          <><ButtonLink href="/login">Cổng khách hàng</ButtonLink><ButtonLink href="/login/artisan" variant="outline">Cổng nghệ nhân</ButtonLink><ButtonLink href="/login/admin" variant="outline">Cổng Ban quản lý</ButtonLink></>
        )
      }
    >
      {zone
        ? `Bạn đang đăng nhập với vai trò ${user?.role === "ADMIN" ? zone.roleLabel : zone.roleLabel.toLowerCase()}. Mỗi vai trò có khu làm việc riêng; hãy dùng đúng tài khoản cho khu này.`
        : "Hãy đăng nhập qua đúng cổng của vai trò để vào khu này."}
    </MissingTile>
  );
}
