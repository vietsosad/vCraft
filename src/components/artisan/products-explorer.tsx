"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, RotateCcw, Search, X } from "lucide-react";
import type { GlazeType } from "@prisma/client";
import type { MediaImage } from "@/lib/types";
import { CATEGORIES, GLAZES, GLAZE_KEYS, categoryLabel } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/primitives";
import { Input, Select } from "@/components/ui/form";
import { VImage } from "@/components/ui/vimage";

export type ArtisanProductItem = {
  id: string;
  name: string;
  category: string;
  glazeType: GlazeType;
  priceVnd: number;
  isPublished: boolean;
  isUniquePiece: boolean;
  searchText: string;
  images: MediaImage[];
  batchCode: string | null;
  createdAt: string;
};

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";
type SortBy = "newest" | "price-asc" | "price-desc" | "name-asc";

function foldVi(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

/**
 * Danh sách sản phẩm của xưởng với tìm kiếm không dấu, lọc theo trạng thái / dòng men / phân loại và sắp xếp.
 */
export function ProductsExplorer({ products }: { products: ArtisanProductItem[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [glaze, setGlaze] = useState<"" | GlazeType>("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortBy>("newest");

  const publishedCount = useMemo(() => products.filter((p) => p.isPublished).length, [products]);
  const draftCount = products.length - publishedCount;
  const hasFilters = Boolean(query.trim() || status !== "ALL" || glaze || category || sort !== "newest");

  const filtered = useMemo(() => {
    const q = foldVi(query);
    const list = products.filter((p) => {
      if (status === "PUBLISHED" && !p.isPublished) return false;
      if (status === "DRAFT" && p.isPublished) return false;
      if (glaze && p.glazeType !== glaze) return false;
      if (category && p.category !== category) return false;
      if (q) {
        const haystack = `${p.searchText} ${foldVi(p.name)} ${p.batchCode ? foldVi(p.batchCode) : ""}`;
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceVnd - b.priceVnd);
    else if (sort === "price-desc") sorted.sort((a, b) => b.priceVnd - a.priceVnd);
    else if (sort === "name-asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [products, query, status, glaze, category, sort]);

  function resetFilters() {
    setQuery("");
    setStatus("ALL");
    setGlaze("");
    setCategory("");
    setSort("newest");
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Phòng trưng bày đang trống"
        description="Thêm tác phẩm đầu tiên với ảnh chụp đẹp và câu chuyện của nó."
        action={
          <ButtonLink href="/dashboard/artisan/products/new" variant="earth">
            <Plus className="size-4" /> Thêm sản phẩm
          </ButtonLink>
        }
      />
    );
  }

  const statusTabs: Array<{ key: StatusFilter; label: string }> = [
    { key: "ALL", label: `Tất cả (${products.length})` },
    { key: "PUBLISHED", label: `Công khai (${publishedCount})` },
    { key: "DRAFT", label: `Nháp (${draftCount})` },
  ];

  return (
    <div className="space-y-5">
      {/* Thẻ lọc trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc trạng thái sản phẩm">
          {statusTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={status === t.key}
              onClick={() => setStatus(t.key)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[var(--radius-tile)] border px-4 text-sm font-semibold transition-colors",
                status === t.key
                  ? "border-datnung bg-datnung text-on"
                  : "border-vua bg-su/80 text-tro hover:border-datnung/40 hover:text-muc",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-tro">
          Đang hiện <strong className="text-muc">{filtered.length}</strong> / {products.length} tác phẩm
        </p>
      </div>

      {/* Thanh tìm kiếm & bộ lọc chi tiết */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-tro" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên tác phẩm hoặc mã lô (gõ không dấu cũng được)..."
              aria-label="Tìm kiếm sản phẩm"
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-tro hover:bg-nga-dam hover:text-muc"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select aria-label="Lọc theo dòng men" value={glaze} onChange={(e) => setGlaze(e.target.value as "" | GlazeType)}>
            <option value="">Tất cả dòng men</option>
            {GLAZE_KEYS.map((k) => (
              <option key={k} value={k}>
                {GLAZES[k].label}
              </option>
            ))}
          </Select>

          <Select aria-label="Lọc theo phân loại" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Tất cả phân loại</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </Select>

          <Select aria-label="Sắp xếp sản phẩm" value={sort} onChange={(e) => setSort(e.target.value as SortBy)}>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="name-asc">Tên A → Z</option>
          </Select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="size-3.5" aria-hidden /> Đặt lại bộ lọc
            </Button>
          </div>
        )}
      </Card>

      {/* Kết quả */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Không tìm thấy tác phẩm phù hợp"
          description="Thử xóa bớt bộ lọc hoặc tìm bằng từ khóa khác."
          action={
            <Button type="button" variant="outline" onClick={resetFilters}>
              <RotateCcw className="size-4" /> Xóa bộ lọc
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/artisan/products/${p.id}`}
                className="tile glaze flex h-full gap-3 bg-su p-3.5 transition-colors hover:border-datnung/50"
              >
                <VImage image={p.images[0]} ratio="1/1" sizes="88px" className="w-[88px] shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg font-semibold leading-tight">{p.name}</p>
                  <p className="mt-0.5 text-xs text-tro">
                    {GLAZES[p.glazeType].label} · {categoryLabel(p.category)}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-datnung-dam">{formatVnd(p.priceVnd)}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge tone={p.isPublished ? "celadon" : "ash"}>{p.isPublished ? "Công khai" : "Nháp"}</Badge>
                    {p.isUniquePiece && <Badge tone="gold">Độc bản</Badge>}
                    {p.batchCode && <Badge tone="cobalt">{p.batchCode}</Badge>}
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
