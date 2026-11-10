import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilePlus2, Users, Scale, Lock, Factory, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatNumber } from "@/lib/format";
import { VImage } from "@/components/ui/vimage";
import manifest from "../../../../public/seed/manifest.json";

export const metadata: Metadata = { title: "Đặt hàng sỉ", description: "Gửi yêu cầu báo giá sỉ tới các xưởng gốm Bát Tràng, so sánh chào giá và chia đơn cho nhiều hộ." };
export const dynamic = "force-dynamic";

const STEPS = [
  { icon: FilePlus2, title: "Gửi một yêu cầu", text: "Số lượng, dòng men, thời hạn, file logo. Bản nháp tự lưu." },
  { icon: Users, title: "Mời đúng xưởng", text: "Lọc theo sở trường dòng men, công suất còn trống và uy tín." },
  { icon: Scale, title: "So sánh chào giá kín", text: "Các xưởng không thấy giá của nhau, bạn so trên cùng mặt bằng." },
  { icon: Lock, title: "Chốt và chia đơn", text: "Khóa phiên bản chống chốt trùng, sinh lô có QR cho từng hộ." },
  { icon: Factory, title: "Theo dõi sản xuất", text: "Xem nhật ký lô của từng xưởng ngay trong tài khoản." },
  { icon: Truck, title: "Nhận hàng, đánh giá", text: "Xác nhận khi mọi lô đã xong, rồi đánh giá từng xưởng." },
];

/** Trang giới thiệu sàn báo giá sỉ (công khai). Danh sách đơn của khách nằm trong khu tài khoản. */
export default async function WholesaleLanding() {
  const user = await getCurrentUser();
  if (user?.role === "ARTISAN") redirect("/dashboard/artisan/quotes");
  if (user?.role === "ADMIN") redirect("/dashboard/admin/coordination");

  const [capacity, workshops, delivered] = await Promise.all([
    prisma.artisanProfile.aggregate({ where: { verificationStatus: "APPROVED", acceptsWholesale: true }, _sum: { maxMonthlyCapacity: true } }),
    prisma.artisanProfile.count({ where: { verificationStatus: "APPROVED", acceptsWholesale: true } }),
    prisma.quoteRequest.count({ where: { status: { in: ["DELIVERED", "IN_PRODUCTION", "BUYER_ACCEPTED"] } } }),
  ]);
  const start = user ? "/account/quotes/new" : "/login?next=/account/quotes/new";

  return (
    <>
      <section className="grout px-3 pb-10 pt-4 sm:px-4 md:px-6">
        <div className="mosaic mx-auto max-w-[1440px] grid-cols-1 md:grid-cols-12">
          <div className="tile tile-lam animate-tile-set flex flex-col justify-between gap-10 p-8 text-giay md:col-span-7 md:p-12">
            <div>
              <h1 className="title-xl !text-[clamp(2.4rem,5.4vw,4.6rem)]">Một yêu cầu, cả làng chào giá</h1>
              <p className="mt-5 max-w-xl text-[17px] text-giay/85">
                Gửi một yêu cầu báo giá, hệ thống mời đúng các xưởng có sở trường và đủ công suất. Bạn so sánh chào giá kín, chốt và chia đơn
                cho nhiều hộ cùng làm. Mỗi phần đơn có lô sản xuất và mã QR riêng.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={start} className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] bg-giay px-6 font-semibold text-[#163a73] transition hover:bg-white">
                <FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá
              </Link>
              {user?.role === "BUYER" && (
                <Link href="/account/quotes" className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-tile)] px-5 font-semibold text-giay ring-1 ring-inset ring-giay/35 transition hover:bg-giay/10">
                  Đơn sỉ của tôi <ArrowRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>
          <div className="tile animate-tile-set md:col-span-5" style={{ ["--d" as string]: "120ms" }}>
            <VImage image={manifest["cups-batch"]} ratio="4/3" priority sizes="(max-width: 768px) 100vw, 40vw" className="h-full" imgClassName="h-full" />
          </div>
          {[
            { v: workshops, l: "xưởng đang nhận đơn sỉ" },
            { v: capacity._sum.maxMonthlyCapacity ?? 0, l: "sản phẩm/tháng công suất chung" },
            { v: delivered, l: "đơn đã chốt hoặc đã giao" },
          ].map((x, i) => (
            <div key={x.l} className="tile animate-tile-set bg-su p-5 md:col-span-4" style={{ ["--d" as string]: `${200 + i * 80}ms` }}>
              <p className="font-display text-4xl">{formatNumber(x.v)}</p>
              <p className="text-sm text-tro">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-6 md:py-24">
        <h2 className="title-lg">Sáu bước, một bản ghi</h2>
        <p className="mt-3 max-w-2xl text-tro">Mọi chuyển trạng thái đều ghi lịch sử. Hai người bấm chốt cùng lúc thì chỉ một lần được nhận, lần còn lại được báo để xem lại.</p>
        <ol className="mosaic mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className={i % 2 ? "tile bg-su p-6" : "tile tile-hoavan p-6"}>
              <div className="rounded-[6px] bg-su/92 p-4">
                <p className="flex items-center justify-between">
                  <s.icon className="size-6 text-lam" aria-hidden />
                  <span className="font-display text-3xl text-lam/35">{i + 1}</span>
                </p>
                <p className="mt-4 font-serif text-xl font-bold">{s.title}</p>
                <p className="mt-1 text-sm text-tro">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
