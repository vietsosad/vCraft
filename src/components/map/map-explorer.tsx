"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LocateFixed, Landmark } from "lucide-react";
import { api } from "@/lib/api-client";
import { GLAZES } from "@/lib/constants";
import { VillageMap } from "./map-client-wrapper";
import { askConcierge } from "@/components/ai/concierge-drawer";
import { VImage } from "@/components/ui/vimage";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import type { MapHeritage, MapWorkshop } from "./types";

const FILTERS = [
  { key: "openNow", label: "Đang mở cửa đón khách" },
  { key: "experience", label: "Có trải nghiệm nặn gốm" },
  { key: "wholesale", label: "Xưởng nhận đơn sỉ" },
] as const;

/**
 * Bản đồ chia đôi màn hình: bên trái danh sách xưởng có bộ lọc tức thì (gọi GET /api/workshops),
 * bên phải bản đồ Leaflet. Bấm thẻ thì bản đồ bay tới ghim; bấm ghim thì thẻ được đánh dấu.
 */
export function MapExplorer({ initial }: { initial: { workshops: MapWorkshop[]; heritage: MapHeritage[] } }) {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(initial);
  const [filters, setFilters] = useState<Record<string, boolean>>({ openNow: params.get("openNow") === "1", experience: false, wholesale: false });
  const [showHeritage, setShowHeritage] = useState(true);
  const [focus, setFocus] = useState<string | null>(params.get("focus"));
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<[number, number] | null>(null);
  const listRefs = useRef(new Map<string, HTMLLIElement>());
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, "1");
    setLoading(true);
    api<{ workshops: MapWorkshop[]; heritage: MapHeritage[] }>(`/api/workshops?${qs}`)
      .then(setData)
      .finally(() => setLoading(false));
    router.replace(`/map${filters.openNow ? "?openNow=1" : ""}`, { scroll: false });
  }, [filters, router]);

  useEffect(() => {
    if (focus) listRefs.current.get(focus)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focus]);

  function locate() {
    if (!navigator.geolocation) return toast({ kind: "error", title: "Trình duyệt không hỗ trợ định vị" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setMe([pos.coords.latitude, pos.coords.longitude]),
      () => toast({ kind: "error", title: "Không lấy được vị trí", description: "Hãy cho phép trình duyệt truy cập vị trí." }),
    );
  }

  const openCount = data.workshops.filter((w) => w.openState.isOpenNow).length;

  return (
    <div className="grid h-[calc(100dvh-64px-var(--demo-h))] min-h-[560px] grid-rows-[auto_1fr] md:h-[calc(100dvh-72px-var(--demo-h))] grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-1">
      <div className="flex min-w-0 max-h-[45dvh] flex-col border-b border-vua bg-nga lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="space-y-3 border-b border-vua p-4">
          <div>
            <h1 className="text-3xl">Bản đồ làng nghề</h1>
            <p className="text-sm text-tro">{data.workshops.length} xưởng · <span className="text-ngoc">{openCount} đang mở cửa</span> · giờ Việt Nam</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                aria-pressed={filters[f.key]}
                onClick={() => setFilters((p) => ({ ...p, [f.key]: !p[f.key] }))}
                className={cn("rounded-[4px] border px-3 py-1.5 text-xs transition", filters[f.key] ? "border-ngoc bg-ngoc text-on" : "border-vua bg-su/70 hover:border-muc/40")}
              >
                {f.label}
              </button>
            ))}
            <button aria-pressed={showHeritage} onClick={() => setShowHeritage((v) => !v)} className={cn("inline-flex items-center gap-1 rounded-[4px] border px-3 py-1.5 text-xs", showHeritage ? "border-datnung bg-datnung text-on" : "border-vua bg-su/70")}>
              <Landmark className="size-3" /> Di tích
            </button>
            <button onClick={locate} className="inline-flex items-center gap-1 rounded-[4px] border border-vua bg-su/70 px-3 py-1.5 text-xs hover:border-muc/40">
              <LocateFixed className="size-3" /> Vị trí của tôi
            </button>
          </div>
        </div>
        <ul className={cn("flex-1 divide-y divide-vua overflow-y-auto", loading && "opacity-60")} aria-live="polite">
          {data.workshops.length === 0 && <li className="p-6 text-center text-sm text-tro">Không có xưởng nào khớp bộ lọc lúc này.</li>}
          {data.workshops.map((w) => (
            <li
              key={w.slug}
              ref={(el) => {
                if (el) listRefs.current.set(w.slug, el);
              }}
            >
              <button onClick={() => setFocus(w.slug)} className={cn("flex w-full gap-3 p-3.5 text-left transition hover:bg-nga-dam/70", focus === w.slug && "bg-nga-dam")}>
                <VImage image={w.coverImage} ratio="1/1" sizes="72px" className="w-[72px] shrink-0 rounded" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-lg leading-tight">{w.workshopName}</span>
                  <span className="block truncate text-xs text-tro">{w.artisanTitle} {w.artisanName}</span>
                  <span className={cn("mt-1 block text-xs", w.openState.isOpenNow ? "text-ngoc" : "text-tro")}>● {w.openState.label}</span>
                  <span className="mt-1 flex gap-1">
                    {w.specialties.map((s) => <span key={s} title={GLAZES[s].label} className="size-2.5 rounded-[2px] ring-1 ring-muc/10" style={{ background: GLAZES[s].color }} />)}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {showHeritage && data.heritage.map((h) => (
            <li key={h.slug}>
              <button onClick={() => setFocus(h.slug)} className={cn("flex w-full items-center gap-3 p-3.5 text-left hover:bg-nga-dam/70", focus === h.slug && "bg-nga-dam")}>
                <span className="grid size-9 shrink-0 place-items-center rounded bg-datnung text-on"><Landmark className="size-4" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{h.name}</span>
                  <span className="block truncate text-xs text-tro">{h.openingHours ? `Mở ${h.openingHours}` : "Di sản làng"}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative">
        <VillageMap
          workshops={data.workshops}
          heritage={showHeritage ? data.heritage : []}
          focus={focus}
          onSelect={setFocus}
          onAskAi={askConcierge}
          myLocation={me}
        />
      </div>
    </div>
  );
}
