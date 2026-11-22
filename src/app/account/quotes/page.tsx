import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { buyerQuotes, type BuyerQuote } from "@/lib/services/buyer-zone";
import { formatNumber, formatVnd } from "@/lib/format";
import { BandHead } from "@/components/weave/band";
import { OrderPatch } from "@/components/weave/goods";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Đơn đặt sỉ" };
export const dynamic = "force-dynamic";

/** Các tờ chia: lọc theo việc khách cần làm, không theo tên trạng thái kỹ thuật. */
const DIVIDERS: { key: string; label: string; test: (q: BuyerQuote) => boolean; empty: string }[] = [
  { key: "dang-chay", label: "Đang dệt", test: (q) => !["DELIVERED", "CANCELLED"].includes(q.status), empty: "Không có đơn nào đang chạy." },
  { key: "can-ban", label: "Cần bạn", test: (q) => !!q.next?.urgent, empty: "Không có đơn nào đang chờ bạn quyết định." },
  { key: "da-giao", label: "Đã giao", test: (q) => q.status === "DELIVERED", empty: "Chưa có đơn nào giao xong." },
  { key: "da-huy", label: "Đã hủy", test: (q) => q.status === "CANCELLED", empty: "Không có đơn nào bị hủy." },
  { key: "tat-ca", label: "Tất cả", test: () => true, empty: "" },
];

export default async function AccountQuotes({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await pageRequireRole("/account/quotes", "BUYER");
  const sp = await searchParams;
  const quotes = await buyerQuotes(user.id);
  const active = DIVIDERS.find((d) => d.key === sp.ngan) ?? DIVIDERS[0]!;
  const list = quotes.filter(active.test);
  const running = quotes.filter(DIVIDERS[0]!.test).length;

  const settled = quotes.filter((q) => ["DELIVERED", "IN_PRODUCTION", "BUYER_ACCEPTED"].includes(q.status));
  const units = settled.reduce((s, q) => s + q.quantity, 0);
  const workshops = new Set(settled.flatMap((q) => q.workshops.map((w) => w.slug))).size;
  const value = settled.reduce((s, q) => s + q.total, 0);

  return (
    <div data-hue="n7">
      <BandHead
        hue="n7"
        title={running ? "đơn sỉ đang dệt" : "Đơn sỉ"}
        description="Một yêu cầu, nhiều xưởng chào giá kín. Bạn so sánh, chốt và chia đơn cho nhiều hộ cùng làm, rồi theo dõi từng mẻ đến khi nhận hàng."
        count={running}
        actions={<Link href="/account/quotes/new" className="btn-moc"><FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá</Link>}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-8">
        {units > 0 && (
          <p className="mb-8 max-w-3xl text-[1.08rem] leading-relaxed">
            Bạn đã chốt <strong className="so whitespace-nowrap text-[1.5rem] text-chu-nau">{formatNumber(units)}</strong> sản phẩm với{" "}
            <strong className="so text-[1.5rem] text-chu-nau">{workshops}</strong> xưởng
            {value > 0 && <>, tổng giá trị <strong className="so whitespace-nowrap text-[1.5rem] text-chu-nau">{formatVnd(value)}</strong></>}.
          </p>
        )}

        <nav aria-label="Lọc đơn sỉ" className="-mx-1 mb-7 overflow-x-auto px-1 pb-1">
          <ul className="flex min-w-max gap-1.5">
            {DIVIDERS.map((d) => {
              const n = quotes.filter(d.test).length;
              const on = d.key === active.key;
              return (
                <li key={d.key}>
                  <Link
                    href={d.key === "dang-chay" ? "/account/quotes" : `/account/quotes?ngan=${d.key}`}
                    aria-current={on ? "page" : undefined}
                    scroll={false}
                    className={cn(
                      "nhan flex min-h-11 items-center gap-2 px-4 transition",
                      on ? "bg-nau text-[#fbfaf5]" : "bg-muc/[0.05] text-tro hover:bg-muc/10 hover:text-muc",
                    )}
                  >
                    {d.label}
                    <span className={cn("so grid min-w-6 place-items-center px-1 py-0.5 text-[0.8rem]", on ? "bg-[#fbfaf5] text-nau" : "bg-muc/10")}>{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {quotes.length === 0 ? (
          <div className="patch max-w-2xl p-7">
            <h2 className="text-[1.6rem]">Chưa có đơn sỉ nào</h2>
            <p className="mt-2 text-tro">Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới: hệ thống mời các xưởng có sở trường và đủ công suất, bạn nhận chào giá kín trong vài ngày.</p>
            <Link href="/account/quotes/new" className="mt-5 inline-flex min-h-11 items-center gap-2 bg-nau px-5 font-semibold text-[#fbfaf5]">Tạo yêu cầu đầu tiên</Link>
          </div>
        ) : list.length === 0 ? (
          <p className="py-8 text-lg text-tro">{active.empty}</p>
        ) : (
          <ul className="space-y-4">
            {list.map((q) => <li key={q.id}><OrderPatch q={q} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
