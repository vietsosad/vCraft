import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { tracedBatches } from "@/lib/services/buyer-zone";
import { BandHead } from "@/components/weave/band";
import { TracePatch } from "@/components/weave/goods";

export const metadata: Metadata = { title: "Sổ truy xuất" };
export const dynamic = "force-dynamic";

/** Sổ truy xuất: những lô gốm khách đã quét tem khi đăng nhập, mới nhất trước. */
export default async function AccountTraces() {
  const user = await pageRequireRole("/account/traces", "BUYER");
  const items = await tracedBatches(user.id);
  const workshops = new Set(items.map((t) => t.artisan.slug)).size;

  return (
    <div data-hue="n4">
      <BandHead
        hue="n4"
        title={items.length ? `lô đã kiểm chứng${workshops > 1 ? `, từ ${workshops} xưởng` : ""}` : "Sổ truy xuất"}
        description="Mỗi lần bạn quét tem QR dưới đáy món gốm khi đã đăng nhập, nhật ký ra đời của lô đó được giữ lại ở đây: ai làm, nung bao nhiêu độ, khóa sổ ngày nào."
        count={items.length}
        actions={<Link href="/scan" className="btn-moc"><QrCode className="size-4" aria-hidden /> Quét tem QR</Link>}
      />
      <div className="account-container pb-16 pt-8">
        {items.length === 0 ? (
          <div className="patch max-w-2xl p-7">
            <h2>Sổ chưa có trang nào</h2>
            <p className="mt-2 text-tro">Lật đáy món gốm bạn mua ở làng, quét tem bằng camera điện thoại hoặc nút “Quét tem QR”. Trang truy xuất mở ra, và lô đó được ghi vào sổ của bạn.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.map((t) => <li key={t.code}><TracePatch t={t} /></li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
