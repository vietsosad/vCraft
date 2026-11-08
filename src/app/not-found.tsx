import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p className="font-mono text-sm text-terracotta">404</p>
      <h1 className="mt-3 text-5xl">Món này chưa ra lò</h1>
      <p className="mt-4 text-ash">Trang bạn tìm không tồn tại hoặc đã được dời đi. Có thể xưởng vừa đổi tên sản phẩm.</p>
      <div className="mt-8 flex gap-2">
        <ButtonLink href="/">Về trang chủ</ButtonLink>
        <ButtonLink href="/products" variant="outline">Phòng triển lãm</ButtonLink>
      </div>
    </div>
  );
}
