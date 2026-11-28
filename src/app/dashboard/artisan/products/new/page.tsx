import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { ProductForm } from "@/components/artisan/product-form";

export default async function NewProductPage() {
  const user = await pageRequireRole("/dashboard/artisan/products/new", "ARTISAN");
  const batches = await prisma.productBatch.findMany({ where: { artisanId: user.artisanId! }, select: { id: true, batchCode: true, batchTitle: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6">Thêm sản phẩm</h1>
      <ProductForm batches={batches} verified={user.artisanVerified} />
    </div>
  );
}
