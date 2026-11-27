import { Plus } from "lucide-react";
import { pageRequireRole } from "@/lib/auth/guards";
import { listOwnProducts } from "@/lib/services/product-service";
import { asImages } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/primitives";
import { ProductsExplorer, type ArtisanProductItem } from "@/components/artisan/products-explorer";

export const dynamic = "force-dynamic";

export default async function ArtisanProductsPage() {
  const user = await pageRequireRole("/dashboard/artisan/products", "ARTISAN");
  const rows = await listOwnProducts(user.artisanId!);

  const products: ArtisanProductItem[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    glazeType: p.glazeType,
    priceVnd: p.priceVnd,
    isPublished: p.isPublished,
    isUniquePiece: p.isUniquePiece,
    searchText: p.searchText,
    images: asImages(p.images),
    batchCode: p.currentBatch?.batchCode ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sản phẩm (${products.length})`}
        description="Quản lý tác phẩm trưng bày, gắn lô truy xuất nguồn gốc và trạng thái công khai."
        actions={
          <ButtonLink href="/dashboard/artisan/products/new" variant="earth">
            <Plus className="size-4" aria-hidden /> Thêm sản phẩm
          </ButtonLink>
        }
        className="mb-0"
      />
      <ProductsExplorer products={products} />
    </div>
  );
}
