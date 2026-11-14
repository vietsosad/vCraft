import Link from "next/link";
import { Logo } from "./logo";

/** Dải gốm ghép làm viền trên chân trang – các viên men lặp như con đường gốm sứ. */
const BAND = ["tile-lam", "tile-hoavan", "tile-ran", "tile-dat", "tile-sen", "tile-ngoc", "tile-lam", "tile-ran", "tile-hoavan", "tile-dat", "tile-ngoc", "tile-sen"];

export function Footer() {
  return (
    <footer className="mt-24 bg-dem text-giay/75">
      <div aria-hidden className="grid grid-cols-6 gap-[5px] bg-[#0a1226] p-[5px] sm:grid-cols-12">
        {BAND.map((t, i) => (
          <span key={i} data-reveal style={{ ["--d" as string]: `${i * 45}ms` }} className={`tile h-10 rounded-[4px] md:h-14 ${t} ${i >= 6 ? "hidden sm:block" : ""}`} />
        ))}
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="[&_span]:!text-giay [&_.text-datnung]:!text-lua [&_.text-tro]:!text-giay/55">
            <Logo />
          </div>
          <p className="mt-5 max-w-sm font-serif text-2xl italic leading-snug text-giay">“Nhất xương, nhì da, thứ ba đến lửa.”</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Triển lãm số do Ban quản lý làng gốm Bát Tràng vận hành: kể chuyện nghệ nhân, truy xuất nguồn gốc từng lô, đặt lịch nặn
            gốm và điều phối đơn hàng sỉ cho nhiều hộ cùng làm.
          </p>
        </div>
        <nav aria-label="Khám phá">
          <p className="text-sm font-semibold text-lua">Khám phá</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/products" className="transition hover:text-giay">Triển lãm tác phẩm</Link></li>
            <li><Link href="/artisans" className="transition hover:text-giay">Nghệ nhân & xưởng</Link></li>
            <li><Link href="/map" className="transition hover:text-giay">Bản đồ làng nghề</Link></li>
            <li><Link href="/news" className="transition hover:text-giay">Bản tin làng</Link></li>
            <li><Link href="/scan" className="transition hover:text-giay">Quét QR truy xuất</Link></li>
          </ul>
        </nav>
        <nav aria-label="Hợp tác">
          <p className="text-sm font-semibold text-lua">Hợp tác</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/b2b-quotes" className="transition hover:text-giay">Đặt hàng sỉ</Link></li>
            <li><Link href="/register/artisan" className="transition hover:text-giay">Đăng ký hộ nghề</Link></li>
            <li><Link href="/trace/BT-2026-RAN-001" className="transition hover:text-giay">Thử truy xuất một lô</Link></li>
          </ul>
        </nav>
        <nav aria-label="Cổng đăng nhập">
          <p className="text-sm font-semibold text-lua">Cổng đăng nhập</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/login" className="transition hover:text-giay">Khách hàng</Link></li>
            <li><Link href="/login/artisan" className="transition hover:text-giay">Nghệ nhân</Link></li>
            <li><Link href="/login/admin" className="transition hover:text-giay">Ban quản lý</Link></li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed">
            Ban quản lý làng nghề Bát Tràng
            <br />
            Xã Bát Tràng, Gia Lâm, Hà Nội
          </p>
        </nav>
      </div>
      <div className="border-t border-giay/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-5 text-xs text-giay/55 md:flex-row md:justify-between md:px-6">
          <p>Bài tập lớn INT3306 · Phát triển ứng dụng web · Fall 2026</p>
          <p>
            Bản đồ © OpenStreetMap contributors · Ảnh tư liệu: Wikimedia Commons (CC BY-SA / CC0), xem{" "}
            <Link href="/credits" className="underline hover:text-giay">ghi công</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
