import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { pendingReviews } from "@/lib/services/engagement-service";
import { workedWorkshops } from "@/lib/services/buyer-zone";
import { formatDate } from "@/lib/format";
import { ReviewForm } from "@/components/engagement/review-form";
import { Stars } from "@/components/engagement/stars";
import { LangHead, Seal, hoaDau, soChu } from "@/components/lang/pieces";

export const metadata: Metadata = { title: "Đánh giá" };
export const dynamic = "force-dynamic";

const nhom = "mb-4 flex flex-wrap items-baseline gap-x-3 font-serif text-[1.6rem] font-bold leading-tight giong-ke";

export default async function AccountReviews() {
  const user = await pageRequireRole("/account/reviews", "BUYER");
  const [pending, mine, worked] = await Promise.all([
    pendingReviews(user.id),
    prisma.review.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: { artisan: { select: { workshopName: true, slug: true } }, quoteRequest: { select: { requestCode: true } }, booking: { select: { code: true } } },
    }),
    workedWorkshops(user.id),
  ]);

  return (
    <>
      <LangHead
        icon="danhgia"
        title={pending.length ? "xưởng chờ lời đánh giá của bạn" : "Đánh giá"}
        count={pending.length}
        lead={<p>Chỉ khách đã nhận hàng hoặc đã ghé xưởng mới được đánh giá, nên mỗi lời nhận xét trên trang của xưởng đều có thật.</p>}
      />

      <div className="mx-auto max-w-7xl space-y-12 px-4 pb-16 pt-9 md:px-6">
        {worked.length > 0 && (
          <section aria-labelledby="da-lam-cung">
            <h2 id="da-lam-cung" className={nhom}>
              {hoaDau(soChu(worked.length))} xưởng bạn đã làm việc cùng
            </h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-4">
              {worked.map((w) => (
                <li key={w.id}>
                  <Link href={`/artisans/${w.slug}`} className="group flex min-h-11 items-center gap-3">
                    <Seal name={w.workshopName} size={50} faded={w.rating === null} />
                    <span className="leading-tight">
                      <span className="block font-semibold underline decoration-vua underline-offset-4 group-hover:decoration-current">{w.workshopName}</span>
                      <span className="mt-0.5 block text-[13px] text-tro">{[w.visited && "đã ghé", w.ordered && "đã đặt", w.rating !== null ? `bạn chấm ${w.rating}/5` : "chưa đánh giá"].filter(Boolean).join(" · ")}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="cho-danh-gia">
          <h2 id="cho-danh-gia" className={nhom}>Chờ bạn đánh giá <span className="font-sans text-sm font-semibold text-tro">{pending.length}</span></h2>
          {pending.length === 0 ? (
            <p className="font-serif text-[1.2rem] text-tro giong-ke">Không có đơn hàng hay buổi trải nghiệm nào đang chờ lời của bạn.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {pending.map((p, i) => (
                <article id={`review-${p.ref}-${p.artisan.id}`} key={`${p.ref}-${p.artisan.id}`} className="viec gan-vien scroll-mt-28 flex-col items-stretch gap-0 p-6" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-serif text-[1.35rem] font-bold leading-snug giong-ke">{p.artisan.workshopName}</h3>
                      <p className="text-sm text-tro">{p.title}</p>
                      <p className="mt-1 text-[13px] text-tro">
                        {p.kind === "quote" ? "Đơn sỉ" : "Buổi nặn gốm"} <span className="code">{p.ref}</span> · {formatDate(p.date)}
                      </p>
                    </div>
                    <Seal name={p.artisan.workshopName} size={52} faded />
                  </div>
                  <div className="mt-4 border-t border-dashed border-vua pt-4">
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

        <section aria-labelledby="loi-da-viet">
          <h2 id="loi-da-viet" className={nhom}>Lời bạn đã viết <span className="font-sans text-sm font-semibold text-tro">{mine.length}</span></h2>
          {mine.length === 0 ? (
            <p className="font-serif text-[1.2rem] text-tro giong-ke">Bạn chưa viết đánh giá nào.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {mine.map((r, i) => (
                <li key={r.id} className="gan-vien" style={{ animationDelay: `${Math.min(i, 6) * 70}ms` }}>
                  <article className="viec thu-do h-full flex-col items-stretch gap-0 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/artisans/${r.artisan.slug}#danh-gia`} className="font-serif text-[1.3rem] font-bold leading-snug hover:underline giong-ke">{r.artisan.workshopName}</Link>
                        <div className="mt-1"><Stars value={r.rating} /></div>
                      </div>
                      <Seal name={r.artisan.workshopName} size={44} />
                    </div>
                    <p className="mt-3 font-serif text-[1.1rem] leading-[1.55] giong-ke">“{r.comment}”</p>
                    <p className="muc-do mt-3 text-[13px]">
                      {formatDate(r.createdAt)} ·{" "}
                      {r.quoteRequest ? <>đơn sỉ <span className="code">{r.quoteRequest.requestCode}</span></> : <>buổi nặn gốm <span className="code">{r.booking?.code}</span></>}
                    </p>
                    {r.artisanReply && (
                      <div className="mt-4 rounded-[6px] border-l-[3px] border-ngoc bg-ngoc-nhat/60 p-4 text-sm">
                        <p className="font-semibold text-ngoc">Nghệ nhân trả lời</p>
                        <p className="mt-1">{r.artisanReply}</p>
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
