import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageRequireRole } from "@/lib/auth/guards";
import { getQuoteForUser } from "@/lib/services/quotation-service";
import { AppError } from "@/lib/errors";
import { QuoteRoom } from "@/components/quotes/quote-room";
import type { QuoteView } from "@/components/quotes/types";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Điều phối ${(await params).code}` };
}

/** Ban quản lý xem phòng báo giá trong bảng điều phối (thấy mọi chào giá, mời thêm xưởng). */
export default async function AdminQuotePage({ params }: Props) {
  const { code } = await params;
  const user = await pageRequireRole(`/dashboard/admin/coordination/${code}`, "ADMIN");
  try {
    const quote = await getQuoteForUser(user, code);
    return (
      <>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-tro">
          <Link href="/dashboard/admin/coordination" className="hover:text-muc">Điều phối đơn sỉ</Link> / <span className="code text-muc">{code}</span>
        </nav>
        <QuoteRoom initial={JSON.parse(JSON.stringify(quote)) as QuoteView} />
      </>
    );
  } catch (err) {
    if (err instanceof AppError && (err.status === 403 || err.status === 404)) notFound();
    throw err;
  }
}
