import type { Metadata } from "next";
import { QrScanner } from "@/components/trace/qr-scanner";

export const metadata: Metadata = { title: "Quét QR truy xuất", description: "Quét tem QR trên sản phẩm gốm Bát Tràng để xem hành trình ra đời của lô." };

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-14">
      <h1 className="title-lg">Quét tem, xem hành trình</h1>
      <p className="mb-8 mt-3 max-w-2xl text-tro">Hướng camera điện thoại vào tem QR dưới đáy sản phẩm. vCraft mở ngay nhật ký của lô gốm đó.</p>
      <QrScanner />
    </div>
  );
}
