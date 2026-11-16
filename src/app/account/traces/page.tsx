import type { Metadata } from "next";
import { QrCode } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { tracedBatches } from "@/lib/services/cabinet-service";
import { ButtonLink } from "@/components/ui/button";
import { DrawerHead, ShelfTitle } from "@/components/cabinet/drawer-head";
import { TraceSheet } from "@/components/cabinet/paper-goods";

export const metadata: Metadata = { title: "Sổ truy xuất" };
export const dynamic = "force-dynamic";

/** Sổ truy xuất: những lô gốm khách đã quét tem khi đăng nhập, mới nhất trước. */
export default async function AccountTraces() {
  const user = await pageRequireRole("/account/traces", "BUYER");
  const items = await tracedBatches(user.id);
  const workshops = new Set(items.map((t) => t.artisan.slug)).size;

  return (
    <>
      <DrawerHead
        title="Sổ truy xuất"
        description="Mỗi lần bạn quét tem QR dưới đáy món gốm khi đã đăng nhập, nhật ký ra đời của lô đó được giữ lại ở đây: ai làm, đất từ đâu, nung bao nhiêu độ, khóa sổ ngày nào."
        actions={<ButtonLink href="/scan"><QrCode className="size-4" aria-hidden /> Quét tem QR</ButtonLink>}
      />
      {items.length === 0 ? (
        <div className="slip paper max-w-2xl p-6">
          <h2 className="font-serif text-2xl font-bold normal-case tracking-normal">Sổ chưa có trang nào</h2>
          <p className="mt-2 text-tro">
            Lật đáy món gốm bạn mua ở làng, quét tem bằng camera điện thoại hoặc nút “Quét tem QR”. Trang truy xuất mở ra, và lô đó được ghi vào sổ của bạn.
          </p>
          <ButtonLink href="/scan" className="mt-5"><QrCode className="size-4" aria-hidden /> Quét tem đầu tiên</ButtonLink>
        </div>
      ) : (
        <section aria-label="Các lô đã quét">
          <ShelfTitle count={items.length}>{workshops > 1 ? `Từ ${workshops} xưởng` : "Đã kiểm chứng"}</ShelfTitle>
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.map((t, i) => (
              <li key={t.code} data-reveal style={{ ["--d" as string]: `${Math.min(i, 6) * 60}ms` }}>
                <TraceSheet t={t} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
