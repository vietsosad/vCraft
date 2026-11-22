import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { BandHead } from "@/components/weave/band";
import { QuoteWizard } from "@/components/quotes/quote-wizard";

export const metadata: Metadata = { title: "Tạo yêu cầu báo giá" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await pageRequireRole("/account/quotes/new", "BUYER");
  const sp = await searchParams;
  return (
    <div data-hue="n7">
      <BandHead
        hue="n7"
        title="Yêu cầu báo giá mới"
        description="Ba bước: nhu cầu, yêu cầu riêng, thời hạn và nơi giao. Hệ thống mời các xưởng có sở trường và đủ công suất; bản nháp được tự lưu trên trình duyệt."
        actions={<Link href="/account/quotes" className="btn-soi"><ArrowLeft className="size-4" aria-hidden /> Về đơn sỉ</Link>}
      />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-8">
        <QuoteWizard
          defaults={{
            organizationName: user.organization ?? "",
            category: sp.category ?? "",
            preferredGlaze: sp.glaze ?? "",
            title: sp.ref ? `Đặt số lượng lớn theo mẫu “${sp.ref}”` : "",
          }}
        />
      </div>
    </div>
  );
}
