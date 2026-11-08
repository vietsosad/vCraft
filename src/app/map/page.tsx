import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { listWorkshops } from "@/lib/services/catalog-service";
import { asImage } from "@/lib/types";
import { MapExplorer } from "@/components/map/map-explorer";

export const metadata: Metadata = {
  title: "Bản đồ làng nghề",
  description: "Bản đồ tương tác làng gốm Bát Tràng: xưởng đang mở cửa đón khách, trải nghiệm nặn gốm và điểm di sản.",
};
export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [workshops, heritage] = await Promise.all([listWorkshops(), prisma.heritageSite.findMany()]);
  return (
    <Suspense>
      <MapExplorer
        initial={{
          workshops: workshops.map((w) => ({ ...w, coverImage: asImage(w.coverImage) })),
          heritage: heritage.map((h) => ({ ...h, image: asImage(h.image) })),
        }}
      />
    </Suspense>
  );
}
