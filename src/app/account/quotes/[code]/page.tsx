import type { Metadata } from "next";
import Link from "next/link";
import { pageRequireRole } from "@/lib/auth/guards";
import { getQuoteForUser } from "@/lib/services/quotation-service";
import { AppError } from "@/lib/errors";
import { QuoteRoom } from "@/components/quotes/quote-room";
import type { QuoteView } from "@/components/quotes/types";
import { EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Yêu cầu ${(await params).code}` };
}

/** Phòng báo giá của khách: so sánh chào giá, gợi ý chia đơn, chốt có khóa phiên bản. */
export default async function QuoteDetailPage({ params }: Props) {
  const { code } = await params;
  const user = await pageRequireRole(`/account/quotes/${code}`, "BUYER");
  try {
    const quote = await getQuoteForUser(user, code);
    // Chuẩn hóa sang JSON để dữ liệu ban đầu và dữ liệu làm mới qua API có cùng dạng
    const initial = JSON.parse(JSON.stringify(quote)) as QuoteView;
    return (
      <>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-tro">
          <Link href="/account/quotes" className="hover:text-muc">Đơn đặt sỉ</Link> / <span className="code text-muc">{code}</span>
        </nav>
        <QuoteRoom initial={initial} />
      </>
    );
  } catch (err) {
    if (err instanceof AppError && (err.status === 403 || err.status === 404)) {
      return (
        <EmptyState
          title={err.status === 403 ? "Bạn không có quyền xem yêu cầu này" : "Không tìm thấy yêu cầu"}
          description={err.message}
          action={<ButtonLink href="/account/quotes">Về danh sách đơn sỉ</ButtonLink>}
        />
      );
    }
    throw err;
  }
}
