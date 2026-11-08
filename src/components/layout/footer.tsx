import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-kaolin/80">
      <div className="wave-divider opacity-60 invert" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="[&_span]:!text-kaolin [&_.text-terracotta]:!text-ember">
            <Logo />
          </div>
          <p className="mt-4 max-w-sm font-display text-xl italic text-kaolin">
            “Nhất xương, nhì da, thứ ba đến lửa.”
          </p>
          <p className="mt-3 max-w-sm text-sm">
            Triển lãm số do Ban quản lý làng gốm Bát Tràng vận hành: kể chuyện nghệ nhân, truy xuất nguồn gốc từng lô và
            điều phối đơn hàng sỉ cho nhiều hộ cùng làm.
          </p>
        </div>
        <div>
          <p className="eyebrow !text-ember">Khám phá</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-kaolin">Triển lãm tác phẩm</Link></li>
            <li><Link href="/artisans" className="hover:text-kaolin">Nghệ nhân & xưởng</Link></li>
            <li><Link href="/map" className="hover:text-kaolin">Bản đồ làng nghề</Link></li>
            <li><Link href="/news" className="hover:text-kaolin">Bản tin làng</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-ember">Hợp tác</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/b2b-quotes" className="hover:text-kaolin">Đặt hàng sỉ</Link></li>
            <li><Link href="/register/artisan" className="hover:text-kaolin">Đăng ký hộ nghề</Link></li>
            <li><Link href="/trace/BT-2026-RAN-001" className="hover:text-kaolin">Thử truy xuất một lô</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-ember">Liên hệ</p>
          <p className="mt-4 text-sm">
            Ban quản lý làng nghề Bát Tràng
            <br />
            Xã Bát Tràng, Gia Lâm, Hà Nội
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-kaolin/55 md:flex-row md:justify-between md:px-6">
          <p>Bài tập lớn INT3306 · Phát triển ứng dụng web · Fall 2026</p>
          <p>
            Bản đồ © OpenStreetMap contributors · Ảnh tư liệu: Wikimedia Commons (CC BY-SA / CC0), xem{" "}
            <Link href="/credits" className="underline hover:text-kaolin">ghi công</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
