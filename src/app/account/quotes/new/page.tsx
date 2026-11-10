import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/primitives";
import { QuoteWizard } from "@/components/quotes/quote-wizard";

export const metadata: Metadata = { title: "Tạo yêu cầu báo giá" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await pageRequireRole("/account/quotes/new", "BUYER");
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Tạo yêu cầu báo giá" description="Hệ thống mời các xưởng có sở trường và đủ công suất. Bản nháp được tự lưu trên trình duyệt." />
      <QuoteWizard
        defaults={{
          organizationName: user.organization ?? "",
          category: sp.category ?? "",
          preferredGlaze: sp.glaze ?? "",
          title: sp.ref ? `Đặt số lượng lớn theo mẫu “${sp.ref}”` : "",
        }}
      />
    </div>
  );
}
