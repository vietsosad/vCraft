import type { Metadata } from "next";
import { listWorkshops } from "@/lib/services/catalog-service";
import { asImage } from "@/lib/types";
import { ArtisanCard } from "@/components/exhibition/artisan-card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Nghệ nhân & xưởng", description: "Các hộ nghề gốm Bát Tràng đã được Ban quản lý xác thực." };
export const dynamic = "force-dynamic";

export default async function ArtisansPage() {
  const workshops = await listWorkshops();
  const open = workshops.filter((w) => w.openState.isOpenNow).length;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Những người giữ lửa</p>
          <h1 className="mt-3 text-5xl md:text-6xl">Nghệ nhân & xưởng</h1>
          <p className="mt-3 max-w-2xl text-ash">
            {workshops.length} hộ nghề đã được Ban quản lý xác thực, {open} xưởng đang mở cửa đón khách lúc này.
          </p>
        </div>
        <ButtonLink href="/map" variant="outline">Xem trên bản đồ</ButtonLink>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map((w) => <ArtisanCard key={w.slug} a={{ ...w, coverImage: asImage(w.coverImage) }} />)}
      </div>
    </div>
  );
}
