import Link from "next/link";
import { Plus } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { listOwnProducts } from "@/lib/services/product-service";
import { asImages } from "@/lib/types";
import { GLAZES, categoryLabel } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { VImage } from "@/components/ui/vimage";

export const dynamic = "force-dynamic";

export default async function ArtisanProductsPage() {
  const user = await pageRequireRole("/dashboard/artisan/products", "ARTISAN");
  const products = await listOwnProducts(user.artisanId!);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Sản phẩm ({products.length})</h2>
        <ButtonLink href="/dashboard/artisan/products/new"><Plus className="size-4" /> Thêm sản phẩm</ButtonLink>
      </div>
      {products.length === 0 ? (
        <EmptyState title="Phòng trưng bày đang trống" description="Thêm tác phẩm đầu tiên với ảnh chụp đẹp và câu chuyện của nó." action={<ButtonLink href="/dashboard/artisan/products/new">Thêm sản phẩm</ButtonLink>} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/dashboard/artisan/products/${p.id}`} className="flex gap-3 rounded-[var(--radius-tile)] border border-vua bg-su/70 p-3 hover:border-datnung/40">
                <VImage image={asImages(p.images)[0]} ratio="1/1" sizes="88px" className="w-[88px] shrink-0 rounded" />
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg leading-tight">{p.name}</p>
                  <p className="text-xs text-tro">{GLAZES[p.glazeType].label} · {categoryLabel(p.category)}</p>
                  <p className="mt-1 font-mono text-sm">{formatVnd(p.priceVnd)}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge tone={p.isPublished ? "celadon" : "ash"}>{p.isPublished ? "Công khai" : "Nháp"}</Badge>
                    {p.currentBatch && <Badge tone="cobalt">{p.currentBatch.batchCode}</Badge>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
