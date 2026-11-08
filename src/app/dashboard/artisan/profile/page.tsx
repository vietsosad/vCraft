import { prisma } from "@/lib/db";
import { pageRequireRole } from "@/lib/auth/guards";
import { asCertifications, asImages } from "@/lib/types";
import { WorkshopForm } from "@/components/artisan/workshop-form";

export const dynamic = "force-dynamic";

export default async function WorkshopProfilePage() {
  const user = await pageRequireRole("/dashboard/artisan/profile", "ARTISAN");
  const w = await prisma.artisanProfile.findUniqueOrThrow({ where: { id: user.artisanId! } });
  return (
    <WorkshopForm
      initial={{
        workshopName: w.workshopName, artisanName: w.artisanName, artisanTitle: w.artisanTitle, tagline: w.tagline ?? "", familyHistory: w.familyHistory,
        address: w.address, latitude: w.latitude, longitude: w.longitude, openingHours: w.openingHours, openDays: w.openDays,
        isOpenForVisit: w.isOpenForVisit, experienceOffered: w.experienceOffered, experiencePriceVnd: w.experiencePriceVnd,
        acceptsWholesale: w.acceptsWholesale, maxMonthlyCapacity: w.maxMonthlyCapacity, specialties: w.specialties,
        certifications: asCertifications(w.certifications), workshopImages: asImages(w.workshopImages),
      }}
    />
  );
}
