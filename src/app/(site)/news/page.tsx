import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
import Link from "next/link";
import type { NewsCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { asImage } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { VImage } from "@/components/ui/vimage";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Bản tin làng", description: "Thông báo của Ban quản lý làng gốm Bát Tràng: giá nguyên liệu, lịch cúp điện, chính sách hỗ trợ." };
export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = category && category in NEWS_CATEGORIES ? (category as NewsCategory) : undefined;
  const news = await prisma.communityNews.findMany({
    where: { isPublished: true, ...(active ? { category: active } : {}) },
    orderBy: [{ isUrgent: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6">
      <RevealText as="h1" text="Bản tin làng" className="title-lg block" />
      <p className="mt-3 max-w-2xl text-tro">Thông báo chính thức của Ban quản lý làng nghề: giá nguyên liệu, lịch cúp điện, chính sách hỗ trợ và sự kiện.</p>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Chuyên mục">
        <Link href="/news" className={cn("rounded-[4px] border px-4 py-1.5 text-sm transition", !active ? "border-lam bg-lam text-on" : "border-vua bg-su hover:border-muc/40")}>Tất cả</Link>
        {Object.entries(NEWS_CATEGORIES).map(([k, v]) => (
          <Link key={k} href={`/news?category=${k}`} className={cn("rounded-[4px] border px-4 py-1.5 text-sm transition", active === k ? "border-lam bg-lam text-on" : "border-vua bg-su hover:border-muc/40")}>{v}</Link>
        ))}
      </nav>
      {news.length === 0 ? (
        <div className="mt-10"><EmptyState title="Chưa có tin trong chuyên mục này" /></div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <Link key={n.id} href={`/news/${n.slug}`} data-reveal style={{ ["--d" as string]: `${(i % 3) * 70}ms` }} className={cn("group block", i === 0 && !active && "md:col-span-2 lg:col-span-2")}>
              <VImage image={asImage(n.coverImage)} ratio={i === 0 && !active ? "16/8" : "16/10"} sizes="(max-width: 768px) 100vw, 50vw" className="tile" imgClassName="transition-transform duration-[900ms] group-hover:scale-[1.04]" />
              <p className={cn("mt-4 text-xs font-semibold", n.isUrgent ? "text-doson" : "text-tro")}>{n.isUrgent && "Khẩn · "}{NEWS_CATEGORIES[n.category]} · {formatDate(n.publishedAt)}</p>
              <h2 className={cn("mt-1 font-serif font-bold normal-case leading-snug transition-colors group-hover:text-lam", i === 0 && !active ? "text-3xl md:text-4xl" : "text-2xl")}>{n.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-tro">{n.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
