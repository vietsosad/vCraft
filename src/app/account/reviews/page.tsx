import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { sealGlyphs, workshopSeals } from "@/lib/services/cabinet-service";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "@/components/engagement/review-form";
import { Stars } from "@/components/engagement/stars";
import { DrawerHead, ShelfTitle } from "@/components/cabinet/drawer-head";
import { WorkshopSeal } from "@/components/cabinet/hardware";

export const metadata: Metadata = { title: "Đánh giá" };
export const dynamic = "force-dynamic";

export default async function AccountReviews() {
  const user = await pageRequireRole("/account/reviews", "BUYER");
  const [pending, mine, seals] = await Promise.all([
    pendingReviews(user.id),
    prisma.review.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { artisan: { select: { workshopName: true, slug: true } }, quoteRequest: { select: { requestCode: true } }, booking: { select: { code: true } } },
    }),
    workshopSeals(user.id),
  ]);

  return (
    <>
      <DrawerHead
        title="Đánh giá"
        description="Chỉ khách đã nhận hàng hoặc đã ghé xưởng mới được đánh giá, nên mỗi lời nhận xét đều có thật. Đóng dấu xong, con triện của xưởng vào hộp triện của bạn."
      />

      {seals.length > 0 && (
        <section aria-label="Hộp triện" className="lacquer mb-12 rounded-[8px] p-2.5 shadow-[0_24px_36px_-28px_rgb(20_12_8/0.8)]">
          <div className="paper rounded-[5px] px-4 py-4 text-muc shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-chi)_70%,transparent),inset_0_10px_14px_-10px_rgb(20_12_8/0.45)] sm:px-6">
            <ShelfTitle count={seals.length} className="mb-3">Hộp triện</ShelfTitle>
            <ul className="flex flex-wrap gap-x-6 gap-y-4">
              {seals.map((s, i) => (
                <li key={s.id}>
                  <Link href={`/artisans/${s.slug}`} className="group flex items-center gap-3">
                    <WorkshopSeal glyphs={sealGlyphs(s.workshopName)} label={`Triện ${s.workshopName}`} size={58} faded={s.rating === null} style={{ rotate: `${[-4, 3, -2, 5, -3, 2][i % 6]}deg` }} className="transition-transform duration-500 group-hover:scale-105" />
                    <span className="leading-tight">
                      <span className="block font-serif text-[1.05rem] font-bold group-hover:text-lam">{s.workshopName}</span>
                      <span className="block text-xs text-tro">
                        {[s.visited && "đã ghé", s.ordered && "đã đặt", s.rating !== null ? `bạn chấm ${s.rating}/5` : "chưa đánh giá"].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="space-y-14">
        <section aria-label="Chờ bạn đóng dấu">
          <ShelfTitle count={pending.length}>Chờ bạn đóng dấu</ShelfTitle>
          {pending.length === 0 ? (
            <p className="font-serif text-lg text-tro">Không có đơn hàng hay buổi trải nghiệm nào đang chờ đánh giá.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {pending.map((p, i) => (
                <article key={`${p.ref}-${p.artisan.id}`} data-reveal style={{ ["--d" as string]: `${i * 60}ms` }} className="slip paper p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.4rem] font-bold leading-tight">{p.artisan.workshopName}</h3>
                      <p className="text-sm text-tro">{p.title}</p>
                      <p className="mt-1 text-xs text-tro">
                        {p.kind === "quote" ? "Đơn sỉ" : "Buổi trải nghiệm"} <span className="code">{p.ref}</span> · {formatDate(p.date)}
                      </p>
                    </div>
                    <WorkshopSeal glyphs={sealGlyphs(p.artisan.workshopName)} label={`Triện ${p.artisan.workshopName}, chưa đóng`} size={56} faded style={{ rotate: "4deg" }} />
                  </div>
                  <div className="mt-4 border-t border-dashed border-muc/15 pt-4">
                    <ReviewForm
                      artisanId={p.artisan.id}
                      workshopName={p.artisan.workshopName}
                      quoteCode={p.kind === "quote" ? p.ref : undefined}
                      bookingCode={p.kind === "booking" ? p.ref : undefined}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Lời bạn đã viết">
          <ShelfTitle count={mine.length}>Lời bạn đã viết</ShelfTitle>
          {mine.length === 0 ? (
            <p className="font-serif text-lg text-tro">Bạn chưa viết đánh giá nào.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {mine.map((r, i) => (
                <li key={r.id} data-reveal style={{ ["--d" as string]: `${Math.min(i, 6) * 50}ms` }}>
                  <article className="paper relative h-full rounded-[4px] p-5 pr-24 shadow-[0_1px_0_rgb(28_18_12/0.06),0_14px_24px_-18px_rgb(28_18_12/0.6)]">
                    <WorkshopSeal glyphs={sealGlyphs(r.artisan.workshopName)} label={`Đã đóng dấu ${r.artisan.workshopName}`} size={62} className="absolute right-5 top-5" style={{ rotate: `${i % 2 ? 6 : -5}deg` }} />
                    <Link href={`/artisans/${r.artisan.slug}#danh-gia`} className="font-serif text-[1.3rem] font-bold leading-tight hover:text-lam">{r.artisan.workshopName}</Link>
                    <div className="mt-1"><Stars value={r.rating} /></div>
                    <p className="mt-3 font-serif text-[1.08rem] leading-relaxed">“{r.comment}”</p>
                    <p className="mt-3 text-xs text-tro">
                      {formatDate(r.createdAt)} ·{" "}
                      {r.quoteRequest ? <>đơn sỉ <span className="code">{r.quoteRequest.requestCode}</span></> : <>trải nghiệm <span className="code">{r.booking?.code}</span></>}
                    </p>
                    {r.artisanReply && (
                      <div className="mt-4 rounded-[4px] bg-datnung-nhat p-3.5 text-sm">
                        <p className="font-semibold text-datnung">Nghệ nhân trả lời</p>
                        <p className="mt-0.5 font-serif text-[1.02rem] italic">{r.artisanReply}</p>
                      </div>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
