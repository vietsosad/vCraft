"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p className="font-mono text-sm text-terracotta">Lỗi</p>
      <h1 className="mt-3 text-5xl">Lò đang gặp trục trặc</h1>
      <p className="mt-4 text-ash">Đã có lỗi khi tải trang. Vui lòng thử lại.</p>
      <Button className="mt-8" onClick={reset}>Thử lại</Button>
    </div>
  );
}
