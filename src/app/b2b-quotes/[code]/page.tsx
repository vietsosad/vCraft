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

export default async function QuoteDetailPage({ params }: Props) {
  const { code } = await params;
  const user = await pageRequireRole(`/b2b-quotes/${code}`);
  try {
    const quote = await getQuoteForUser(user, code);
    // Chuẩn hóa sang JSON để dữ liệu ban đầu và dữ liệu làm mới qua API có cùng dạng
    const initial = JSON.parse(JSON.stringify(quote)) as QuoteView;
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ash">
          <Link href={user.role === "ARTISAN" ? "/dashboard/artisan/quotes" : user.role === "ADMIN" ? "/dashboard/admin/coordination" : "/b2b-quotes"} className="hover:text-ink">Đặt hàng sỉ</Link> / <span className="text-ink">{code}</span>
        </nav>
        <QuoteRoom initial={initial} />
      </div>
    );
  } catch (err) {
    if (err instanceof AppError && (err.status === 403 || err.status === 404)) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-24">
          <EmptyState title={err.status === 403 ? "Bạn không có quyền xem yêu cầu này" : "Không tìm thấy yêu cầu"} description={err.message} action={<ButtonLink href="/b2b-quotes">Về trang đặt hàng sỉ</ButtonLink>} />
        </div>
      );
    }
    throw err;
  }
}
