"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, GLAZES, GLAZE_KEYS } from "@/lib/constants";
import { ProductCard, type ProductCardData } from "./product-card";
import { SearchBox } from "./search-box";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type Meta = { total: number; page: number; pageSize: number; pageCount: number };
const FILTER_KEYS = ["q", "category", "glaze", "artisan", "minPrice", "maxPrice", "unique", "traceable", "sort"] as const;

const PRICE_PRESETS = [
  { label: "Dưới 500.000 ₫", min: undefined, max: 500000 },
  { label: "500.000 – 2.000.000 ₫", min: 500000, max: 2000000 },
  { label: "Trên 2.000.000 ₫", min: 2000000, max: undefined },
];

/**
 * Phòng triển lãm: mọi thao tác lọc / sắp xếp / xem thêm đều gọi GET /api/products (JSON)
 * và cập nhật lưới sản phẩm tại chỗ – không tải lại trang. Bộ lọc đồng bộ lên URL nên chia sẻ được.
 */
export function ProductExplorer({ initialItems, initialMeta, artisans }: {
  initialItems: ProductCardData[];
  initialMeta: Meta;
  artisans: { slug: string; workshopName: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const first = useRef(true);

  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) ?? ""])) as Record<(typeof FILTER_KEYS)[number], string>;

  const setFilter = useCallback(
    (patch: Partial<Record<(typeof FILTER_KEYS)[number], string | undefined>>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v) next.set(k, v);
        else next.delete(k);
      }
      next.delete("page");
      router.replace(`/products${next.toString() ? `?${next}` : ""}`, { scroll: false });
    },
    [params, router],
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams(params.toString());
    qs.set("page", "1");
    fetch(`/api/products?${qs}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data ?? []);
        setMeta(json.meta);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [params]);

  async function loadMore() {
    setLoadingMore(true);
    const qs = new URLSearchParams(params.toString());
    qs.set("page", String(meta.page + 1));
    try {
      const res = await fetch(`/api/products?${qs}`).then((r) => r.json());
      setItems((prev) => [...prev, ...res.data]);
      setMeta(res.meta);
    } finally {
      setLoadingMore(false);
    }
  }

  const activeCount = FILTER_KEYS.filter((k) => k !== "sort" && k !== "q" && filters[k]).length;
  const priceKey = `${filters.minPrice}-${filters.maxPrice}`;

  const chip = (active: boolean) =>
    cn("rounded-full border px-3 py-1.5 text-sm transition", active ? "border-ink bg-ink text-kaolin" : "border-line bg-white/70 hover:border-ink/40");

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <SearchBox value={filters.q} onSubmit={(q) => setFilter({ q })} />
        </div>
        <div className="flex gap-2">
          <label htmlFor="sort" className="sr-only">Sắp xếp</label>
          <select
            id="sort"
            value={filters.sort || "newest"}
            onChange={(e) => setFilter({ sort: e.target.value === "newest" ? undefined : e.target.value })}
            className="h-12 rounded-full border border-line bg-white px-4 text-sm"
          >
            <option value="newest">Mới ra lò</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
          <Button variant="outline" className="h-12 rounded-full lg:hidden" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters}>
            <SlidersHorizontal className="size-4" /> Bộ lọc{activeCount ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className={cn("space-y-7 lg:block", showFilters ? "block" : "hidden")} aria-label="Bộ lọc">
          <fieldset>
            <legend className="eyebrow mb-3">Phân loại</legend>
            <div className="flex flex-wrap gap-2">
              <button className={chip(!filters.category)} onClick={() => setFilter({ category: undefined })}>Tất cả</button>
              {CATEGORIES.map((c) => (
                <button key={c.slug} className={chip(filters.category === c.slug)} onClick={() => setFilter({ category: filters.category === c.slug ? undefined : c.slug })}>
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow mb-3">Dòng men</legend>
            <div className="flex flex-wrap gap-2">
              {GLAZE_KEYS.map((g) => (
                <button key={g} className={cn(chip(filters.glaze === g), "inline-flex items-center gap-1.5")} onClick={() => setFilter({ glaze: filters.glaze === g ? undefined : g })}>
                  <span className="size-2.5 rounded-full ring-1 ring-ink/10" style={{ background: GLAZES[g].color }} />
                  {GLAZES[g].label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="eyebrow mb-3">Hộ gia đình</legend>
            <label htmlFor="artisan-filter" className="sr-only">Chọn xưởng</label>
            <select id="artisan-filter" value={filters.artisan} onChange={(e) => setFilter({ artisan: e.target.value || undefined })} className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm">
              <option value="">Tất cả xưởng</option>
              {artisans.map((a) => <option key={a.slug} value={a.slug}>{a.workshopName}</option>)}
            </select>
          </fieldset>
          <fieldset>
            <legend className="eyebrow mb-3">Khoảng giá</legend>
            <div className="flex flex-col gap-2">
              {PRICE_PRESETS.map((p) => {
                const key = `${p.min ?? ""}-${p.max ?? ""}`;
                return (
                  <button key={key} className={cn(chip(priceKey === key), "text-left")} onClick={() => setFilter(priceKey === key ? { minPrice: undefined, maxPrice: undefined } : { minPrice: p.min?.toString(), maxPrice: p.max?.toString() })}>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="eyebrow mb-3">Khác</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-terracotta" checked={filters.unique === "1"} onChange={(e) => setFilter({ unique: e.target.checked ? "1" : undefined })} /> Chỉ tác phẩm độc bản
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-terracotta" checked={filters.traceable === "1"} onChange={(e) => setFilter({ traceable: e.target.checked ? "1" : undefined })} /> Có tem truy xuất QR
            </label>
          </fieldset>
          {activeCount > 0 && (
            <button onClick={() => router.replace("/products", { scroll: false })} className="inline-flex items-center gap-1 text-sm text-terracotta">
              <X className="size-4" /> Xóa bộ lọc
            </button>
          )}
        </aside>

        <div aria-live="polite" aria-busy={loading}>
          <p className="mb-5 text-sm text-ash">
            {loading ? "Đang tải…" : `${meta.total} tác phẩm`}
            {filters.q && ` cho “${filters.q}”`}
          </p>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                  <Skeleton className="mt-2 h-5 w-full" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Chưa có tác phẩm phù hợp"
              description="Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác, ví dụ “men lam”."
              action={<Button variant="outline" onClick={() => router.replace("/products")}>Xóa bộ lọc</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
                {items.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 3} />)}
              </div>
              {meta.page < meta.pageCount && (
                <div className="mt-12 text-center">
                  <Button variant="outline" onClick={loadMore} loading={loadingMore}>
                    Xem thêm ({meta.total - items.length} tác phẩm)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
