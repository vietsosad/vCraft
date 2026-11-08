import type { GlazeType, HeritageKind } from "@prisma/client";
import type { MediaImage } from "@/lib/types";
import type { OpenState } from "@/lib/opening-hours";

export type MapWorkshop = {
  id: string;
  slug: string;
  workshopName: string;
  artisanName: string;
  artisanTitle: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  experienceOffered: boolean;
  experiencePriceVnd: number;
  acceptsWholesale: boolean;
  specialties: GlazeType[];
  coverImage: MediaImage | null;
  openState: OpenState;
};

export type MapHeritage = {
  id: string;
  slug: string;
  name: string;
  kind: HeritageKind;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string | null;
  ticketInfo: string | null;
  image: MediaImage | null;
};
