import type { Metadata } from "next";
import { RevealText } from "@/components/motion/reveal-text";
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
    <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <RevealText as="h1" text="Nghệ nhân & xưởng" className="title-lg block" />
          <p className="mt-3 max-w-2xl text-tro">
            {workshops.length} hộ nghề đã được Ban quản lý xác thực, {open} xưởng đang mở cửa đón khách lúc này.
          </p>
        </div>
        <ButtonLink href="/map" variant="outline">Xem trên bản đồ</ButtonLink>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {workshops.map((w, i) => (
          <div key={w.slug} data-reveal style={{ ["--d" as string]: `${(i % 3) * 80}ms` }}>
            <ArtisanCard a={{ ...w, coverImage: asImage(w.coverImage) }} />
          </div>
        ))}
      </div>
    </div>
  );
}
