import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { buyerQuotes, type BuyerQuote } from "@/lib/services/buyer-zone";
import { formatNumber, formatVnd } from "@/lib/format";
import { CONG_DOAN, Invite, LangHead, NUT, OrderCard, hoaDau, soChu } from "@/components/lang/pieces";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Lò đơn sỉ" };
export const dynamic = "force-dynamic";

/** Các ngăn lọc: theo việc khách cần làm, không theo tên trạng thái kỹ thuật. */
const DIVIDERS: { key: string; label: string; test: (q: BuyerQuote) => boolean; empty: string }[] = [
  { key: "dang-chay", label: "Đang chạy", test: (q) => !["DELIVERED", "CANCELLED"].includes(q.status), empty: "Không có mẻ nào đang chạy. Lò đang nghỉ lửa." },
  { key: "can-ban", label: "Cần bạn", test: (q) => !!q.next, empty: "Không có đơn nào đang chờ bạn quyết định. Các xưởng đang làm phần của họ." },
  { key: "da-giao", label: "Đã ra lò", test: (q) => q.status === "DELIVERED", empty: "Chưa có mẻ nào ra lò và giao xong." },
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
  const waiting = quotes.filter((q) => q.next).length;

  const settled = quotes.filter((q) => ["DELIVERED", "IN_PRODUCTION", "BUYER_ACCEPTED"].includes(q.status));
  const units = settled.reduce((s, q) => s + q.quantity, 0);
  const workshops = new Set(settled.flatMap((q) => q.workshops.map((w) => w.slug))).size;
  const value = settled.reduce((s, q) => s + q.total, 0);

  return (
    <>
      <LangHead
        icon="lo"
        title={running ? "mẻ đang chạy trong lò" : "Lò đơn sỉ"}
        count={running}
        lead={
          units > 0 ? (
            <p>
              Bạn đã chốt <strong className="tabular font-bold text-lam">{formatNumber(units)}</strong> sản phẩm với {soChu(workshops)} xưởng
              {value > 0 && <>, tổng giá trị <strong className="tabular whitespace-nowrap font-bold text-lam">{formatVnd(value)}</strong></>}.
              {waiting > 0 && ` ${hoaDau(soChu(waiting))} đơn đang chờ bạn quyết định.`}
            </p>
          ) : (
            <p>So sánh chào giá kín, chia đơn cho một hay nhiều xưởng và theo mẻ gốm qua sáu công đoạn, từ đất thô đến lúc ra lò.</p>
          )
        }
        actions={<Link href="/account/quotes/new" className={NUT.dat}><FilePlus2 className="size-4" aria-hidden /> Tạo yêu cầu báo giá</Link>}
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 md:px-6">
        {quotes.length === 0 ? (
          <Invite title="Lò chưa nhóm lửa mẻ nào" action={<Link href="/account/quotes/new" className={NUT.lam}>Tạo yêu cầu đầu tiên</Link>}>
            <p>Thử đặt 500 chiếc cốc men trắng ngà in logo cho sự kiện sắp tới: hệ thống mời các xưởng có sở trường và đủ công suất, bạn nhận chào giá kín trong vài ngày rồi tự chia đơn.</p>
          </Invite>
        ) : (
          <>
            <nav aria-label="Lọc đơn sỉ" className="-mx-1 mb-6 overflow-x-auto px-1 pb-1">
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
                          "flex min-h-11 items-center gap-2 rounded-[6px] border px-4 text-[15px] font-semibold transition-colors",
                          on ? "border-lam bg-lam text-on" : "border-vua bg-su text-muc hover:border-lam/40 hover:bg-nga-dam",
                        )}
                      >
                        {d.label}
                        <span className={cn("tabular grid min-w-6 place-items-center rounded-[4px] px-1 py-0.5 text-[13px]", on ? "bg-on/20 text-on" : "bg-nga-dam text-muc")}>{n}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div key={active.key} className="hien">
              {list.length === 0 ? (
                <p className="py-6 font-serif text-[1.25rem] text-tro giong-ke">{active.empty}</p>
              ) : (
                <>
                  <ol className="mb-2 hidden grid-cols-6 gap-1.5 px-[17px] text-[13px] text-tro sm:grid" aria-hidden>
                    {CONG_DOAN.map((c) => <li key={c} className="truncate">{c}</li>)}
                  </ol>
                  <ul className="grid grid-cols-1 gap-3.5">
                    {list.map((q, i) => (
                      <li key={q.id} className="gan-vien" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}><OrderCard q={q} /></li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
