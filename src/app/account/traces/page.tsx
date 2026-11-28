import type { Metadata } from "next";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { tracedBatches } from "@/lib/services/buyer-zone";
import { LangHead, NUT, Passport, TraceCard, soChu } from "@/components/lang/pieces";

export const metadata: Metadata = { title: "Hộ chiếu làng nghề" };
export const dynamic = "force-dynamic";

/** Hộ chiếu làng nghề: mỗi lô gốm khách đã quét tem khi đăng nhập là một con triện son, mới nhất trước. */
export default async function AccountTraces() {
  const user = await pageRequireRole("/account/traces", "BUYER");
  const items = await tracedBatches(user.id);
  const workshops = new Set(items.map((t) => t.artisan.slug)).size;
  const firstName = user.name.trim().split(/\s+/).at(-1) ?? user.name;
  const stamps = items.slice(0, 9);
  const empty = Math.max(0, (stamps.length < 3 ? 3 : Math.ceil(stamps.length / 3) * 3) - stamps.length);

  return (
    <>
      <LangHead
        icon="trien"
        title={items.length ? "lô gốm đã kiểm chứng" : "Hộ chiếu làng nghề"}
        count={items.length}
        lead={
          <p>
            {items.length
              ? `Từ ${soChu(workshops)} xưởng trong làng. Mỗi trang ghi lô đó ai làm, nung bao nhiêu độ, khóa sổ ngày nào.`
              : "Mỗi lần bạn quét tem QR dưới đáy món gốm khi đã đăng nhập, Ban quản lý làng đóng một con triện vào sổ này."}
          </p>
        }
        actions={<Link href="/scan" className={NUT.lam}><QrCode className="size-4" aria-hidden /> Quét tem QR</Link>}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 pt-9 md:px-6">
        <Passport
          stamps={stamps}
          empty={empty}
          left={
            <>
              <h2 className="font-serif text-[1.9rem] font-bold leading-tight giong-ke">
                {items.length ? `Sổ của ${firstName}: ${items.length} con triện` : `Sổ của ${firstName} còn trắng trang`}
              </h2>
              <p className="chu-so mt-3 max-w-md">
                {items.length
                  ? "Bấm vào một con triện để mở hành trình của lô: sáu công đoạn từ đất thô đến lúc ra lò, kèm ảnh và nhiệt độ nung do chính xưởng ghi."
                  : "Lật đáy món gốm bạn mua ở làng, quét tem bằng camera điện thoại hoặc nút “Quét tem QR”. Trang truy xuất mở ra, và lô đó được đóng triện vào sổ của bạn."}
              </p>
              {items.length > stamps.length && <p className="chu-so mt-3 text-sm">Trang này giữ chín con triện mới nhất; toàn bộ {items.length} lô nằm trong sổ bên dưới.</p>}
            </>
          }
        />

        {items.length > 0 && (
          <section aria-labelledby="so-truy-xuat">
            <h2 id="so-truy-xuat" className="mb-5 font-serif text-[1.6rem] font-bold leading-tight giong-ke">Từng trang trong sổ</h2>
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {items.map((t, i) => <li key={t.code} className="gan-vien" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}><TraceCard t={t} /></li>)}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
