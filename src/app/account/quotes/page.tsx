import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { buyerQuotes, type BuyerQuote } from "@/lib/services/cabinet-service";
import { formatNumber, formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { DrawerHead } from "@/components/cabinet/drawer-head";
import { OrderSlip } from "@/components/cabinet/paper-goods";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Đơn đặt sỉ" };
export const dynamic = "force-dynamic";

/** Các tờ chia ngăn: lọc theo việc khách cần làm, không theo tên trạng thái kỹ thuật. */
const DIVIDERS: { key: string; label: string; test: (q: BuyerQuote) => boolean; empty: string }[] = [
  { key: "dang-chay", label: "Đang chạy", test: (q) => !["DELIVERED", "CANCELLED"].includes(q.status), empty: "Không có đơn nào đang chạy." },
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

  const delivered = quotes.filter((q) => q.status === "DELIVERED" || q.status === "IN_PRODUCTION" || q.status === "BUYER_ACCEPTED");
  const units = delivered.reduce((s, q) => s + q.quantity, 0);
  const workshops = new Set(delivered.flatMap((q) => q.workshops.map((w) => w.slug))).size;
  const value = delivered.reduce((s, q) => s + q.total, 0);

  return (
    <>
      <DrawerHead
        title="Đơn sỉ"
        description="Một yêu cầu, nhiều xưởng chào giá kín. Bạn so sánh, chốt và chia đơn cho nhiều hộ cùng làm, rồi theo dõi từng mẻ đến khi nhận hàng."
        actions={<ButtonLink href="/account/quotes/new"><FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá</ButtonLink>}
      />

      {quotes.length > 0 && (
        <p className="mb-7 max-w-3xl font-serif text-[1.15rem] leading-relaxed text-muc/85">
          {units > 0 ? (
            <>
              Bạn đã chốt <strong className="font-bold text-muc">{formatNumber(units)} sản phẩm</strong> với{" "}
              <strong className="font-bold text-muc">{workshops} xưởng</strong>
              {value > 0 && <>, tổng giá trị <strong className="font-bold text-muc">{formatVnd(value)}</strong></>}.
            </>
          ) : (
            <>Bạn có {quotes.length} yêu cầu báo giá. Đơn nào đã chốt sẽ được cộng dồn ở đây.</>
          )}
        </p>
      )}

      {/* Tờ chia ngăn */}
      <nav aria-label="Lọc đơn sỉ" className="-mx-1 mb-6 overflow-x-auto px-1 pb-1">
        <ul className="flex min-w-max gap-1.5 border-b border-muc/15">
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
                    "relative -mb-px flex min-h-11 items-center gap-2 rounded-t-[6px] border border-b-0 px-4 text-sm font-semibold transition",
                    on ? "paper border-muc/15 text-muc" : "border-transparent text-tro hover:bg-muc/[0.04] hover:text-muc",
                  )}
                >
                  {d.label}
                  <span className={cn("grid min-w-6 place-items-center rounded-[3px] px-1 text-[11px] tabular leading-5", on ? (d.key === "can-ban" && n ? "bg-datnung text-on" : "bg-lam text-on") : "bg-muc/8")}>{n}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {quotes.length === 0 ? (
        <div className="slip paper max-w-2xl p-6">
          <h2 className="font-serif text-2xl font-bold normal-case tracking-normal">Ngăn đơn sỉ còn trống</h2>
          <p className="mt-2 text-tro">Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới: hệ thống mời các xưởng có sở trường và đủ công suất, bạn nhận chào giá kín trong vài ngày.</p>
          <ButtonLink href="/account/quotes/new" className="mt-5">Tạo yêu cầu đầu tiên</ButtonLink>
        </div>
      ) : list.length === 0 ? (
        <p className="py-8 font-serif text-lg text-tro">{active.empty}</p>
      ) : (
        <ul className="space-y-3.5">
          {list.map((q, i) => (
            <li key={q.id} data-reveal style={{ ["--d" as string]: `${Math.min(i, 6) * 50}ms` }}>
              <OrderSlip q={q} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
