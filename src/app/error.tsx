"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { MissingTile } from "@/components/ui/missing-tile";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <MissingTile code="!" title="Lò đang gặp trục trặc" actions={<><Button onClick={reset}>Thử lại</Button><ButtonLink href="/" variant="outline">Về trang chủ</ButtonLink></>}>
      Đã có lỗi khi tải trang này. Dữ liệu của bạn vẫn an toàn, hãy thử lại sau giây lát.
    </MissingTile>
  );
}
