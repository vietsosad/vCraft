import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { QuoteWizard } from "@/components/quotes/quote-wizard";
import { LangHead, LIEN_KET } from "@/components/lang/pieces";

export const metadata: Metadata = { title: "Tạo yêu cầu báo giá" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await pageRequireRole("/account/quotes/new", "BUYER");
  const sp = await searchParams;
  return (
    <>
      <LangHead
        icon="lo"
        title="Nhóm lửa một mẻ mới"
        back={<Link href="/account/quotes" className={`-ml-1 px-1 text-sm ${LIEN_KET}`}><ArrowLeft className="size-4" aria-hidden /> Về lò đơn sỉ</Link>}
        lead={<p>Ba bước: nhu cầu, yêu cầu riêng, thời hạn và nơi giao. Hệ thống mời các xưởng có sở trường và đủ công suất; bản nháp tự lưu trên trình duyệt này.</p>}
      />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-6">
        <QuoteWizard
          defaults={{
            organizationName: user.organization ?? "",
            category: sp.category ?? "",
            preferredGlaze: sp.glaze ?? "",
            title: sp.ref ? `Đặt số lượng lớn theo mẫu “${sp.ref}”` : "",
          }}
        />
      </div>
    </>
  );
}
