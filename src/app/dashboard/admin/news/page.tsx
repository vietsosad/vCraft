import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const news = await prisma.communityNews.findMany({ orderBy: { publishedAt: "desc" }, include: { author: { select: { name: true } } } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl">Tin tức cộng đồng</h2>
        <ButtonLink href="/dashboard/admin/news/new" variant="cobalt"><Plus className="size-4" /> Đăng tin</ButtonLink>
      </div>
      <ul className="divide-y divide-vua rounded-[var(--radius-tile)] border border-vua bg-su/70">
        {news.map((n) => (
          <li key={n.id}>
            <Link href={`/dashboard/admin/news/${n.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-nga-dam/40">
              <div className="min-w-0">
                <p className="font-medium">{n.title}</p>
                <p className="text-xs text-tro">{NEWS_CATEGORIES[n.category]} · {n.author.name} · {formatDate(n.publishedAt)}</p>
              </div>
              <div className="flex gap-1.5">
                {n.isUrgent && <Badge tone="terracotta">Khẩn</Badge>}
                <Badge tone={n.isPublished ? "celadon" : "ash"}>{n.isPublished ? "Đã đăng" : "Nháp"}</Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
