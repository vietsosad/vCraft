import type { Metadata } from "next";
import Link from "next/link";
import { pageRequireRole } from "@/lib/auth/guards";
import { getQuoteForUser } from "@/lib/services/quotation-service";
import { AppError } from "@/lib/errors";
import { QuoteRoom } from "@/components/quotes/quote-room";
import type { QuoteView } from "@/components/quotes/types";
import { Invite, LangHead } from "@/components/lang/pieces";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Yêu cầu ${(await params).code}` };
}

const vet = "inline-flex min-h-11 items-center underline-offset-4 hover:text-[#fffdf8] hover:underline";

/** Phòng báo giá của khách: lò bậc thang sáu khoang, so sánh chào giá, gợi ý chia đơn, chốt có khóa phiên bản. */
export default async function QuoteDetailPage({ params }: Props) {
  const { code } = await params;
  const user = await pageRequireRole(`/account/quotes/${code}`, "BUYER");
  try {
    const quote = await getQuoteForUser(user, code);
    // Chuẩn hóa sang JSON để dữ liệu ban đầu và dữ liệu làm mới qua API có cùng dạng
    const initial = JSON.parse(JSON.stringify(quote)) as QuoteView;
    return (
      <QuoteRoom
        initial={initial}
        variant="lang"
        head={
          <nav aria-label="Vị trí" className="flex flex-wrap items-center gap-x-2 text-sm text-[#d9cdb7]">
            <Link href="/account" className={vet}>Đường làng</Link>
            <span aria-hidden>/</span>
            <Link href="/account/quotes" className={vet}>Lò đơn sỉ</Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="font-semibold text-[#fffdf8]">Phòng báo giá</span>
          </nav>
        }
      />
    );
  } catch (err) {
    if (err instanceof AppError && (err.status === 403 || err.status === 404)) {
      return (
        <>
          <LangHead icon="lo" title="Phòng báo giá" />
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6">
            <Invite
              title={err.status === 403 ? "Bạn không có quyền xem yêu cầu này" : "Không tìm thấy yêu cầu"}
              action={<Link href="/account/quotes" className="inline-flex min-h-11 items-center rounded-[6px] bg-lam px-5 font-semibold text-on hover:bg-lam-sang">Về lò đơn sỉ</Link>}
            >
              <p>{err.message}</p>
            </Invite>
          </div>
        </>
      );
    }
    throw err;
  }
}
