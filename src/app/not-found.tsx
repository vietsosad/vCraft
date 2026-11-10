import { ButtonLink } from "@/components/ui/button";
import { MissingTile } from "@/components/ui/missing-tile";

export default function NotFound() {
  return (
    <MissingTile
      code="404"
      title="Món này chưa ra lò"
      actions={<><ButtonLink href="/">Về trang chủ</ButtonLink><ButtonLink href="/products" variant="outline">Phòng triển lãm</ButtonLink><ButtonLink href="/scan" variant="ghost">Quét lại tem QR</ButtonLink></>}
    >
      Trang bạn tìm không có trong bức ghép. Có thể xưởng vừa đổi tên sản phẩm, hoặc mã QR không thuộc hộ nghề đã xác thực.
    </MissingTile>
  );
}
