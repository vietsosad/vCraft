import type { Metadata } from "next";
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
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <p className="eyebrow">Ban quản lý làng nghề</p>
      <h1 className="mt-3 text-5xl md:text-6xl">Bản tin làng</h1>
      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Chuyên mục">
        <Link href="/news" className={cn("rounded-full border px-4 py-1.5 text-sm", !active ? "border-ink bg-ink text-kaolin" : "border-line bg-white/70")}>Tất cả</Link>
        {Object.entries(NEWS_CATEGORIES).map(([k, v]) => (
          <Link key={k} href={`/news?category=${k}`} className={cn("rounded-full border px-4 py-1.5 text-sm", active === k ? "border-ink bg-ink text-kaolin" : "border-line bg-white/70")}>{v}</Link>
        ))}
      </nav>
      {news.length === 0 ? (
        <div className="mt-10"><EmptyState title="Chưa có tin trong chuyên mục này" /></div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n, i) => (
            <Link key={n.id} href={`/news/${n.slug}`} className={cn("group block", i === 0 && !active && "md:col-span-2 lg:col-span-2")}>
              <VImage image={asImage(n.coverImage)} ratio={i === 0 && !active ? "16/8" : "16/10"} sizes="(max-width: 768px) 100vw, 50vw" className="rounded-[var(--radius-tile)]" />
              <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-terracotta">{n.isUrgent && "Khẩn · "}{NEWS_CATEGORIES[n.category]} · {formatDate(n.publishedAt)}</p>
              <h2 className={cn("mt-1 group-hover:text-terracotta", i === 0 && !active ? "text-3xl md:text-4xl" : "text-2xl")}>{n.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-ash">{n.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
