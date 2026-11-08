import type { Metadata } from "next";
import { pageRequireRole } from "@/lib/auth/guards";
import { QuoteWizard } from "@/components/quotes/quote-wizard";

export const metadata: Metadata = { title: "Tạo yêu cầu báo giá" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await pageRequireRole("/b2b-quotes/new", "BUYER", "ADMIN");
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow !text-cobalt">Phòng đấu thầu B2B</p>
      <h1 className="mt-3 text-4xl md:text-5xl">Tạo yêu cầu báo giá</h1>
      <p className="mt-2 text-ash">Hệ thống sẽ mời các xưởng có sở trường và đủ công suất. Bản nháp được tự lưu trên trình duyệt.</p>
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
