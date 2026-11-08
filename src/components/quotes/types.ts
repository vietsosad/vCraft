import type { BatchStatus, BidStatus, GlazeType, QuoteStatus, UserRole } from "@prisma/client";

/** Dạng JSON của chi tiết yêu cầu báo giá (ngày tháng là chuỗi ISO). */
export type QuoteView = {
  id: string;
  requestCode: string;
  title: string;
  organizationName: string;
  category: string;
  preferredGlaze: GlazeType;
  quantity: number;
  targetBudgetPerUnit: number;
  deadlineDays: number;
  specifications: string;
  deliveryAddress: string;
  biddingClosesAt: string | null;
  status: QuoteStatus;
  version: number;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  referenceImages: unknown;
  buyer: { name: string; organization: string | null };
  bids: {
    id: string;
    artisanId: string;
    offeredPricePerUnit: number;
    committedQuantity: number;
    estimatedDays: number;
    proposalNote: string;
    status: BidStatus;
    allocatedQuantity: number | null;
    version: number;
    updatedAt: string;
    artisan: { id: string; slug: string; workshopName: string; ratingAvg: number; maxMonthlyCapacity: number };
  }[];
  invitations: { artisanId: string; matchScore: number; matchReasons: unknown; invitedBy: string; artisan: { workshopName: string; slug: string } }[];
  allocatedBatches: { id: string; batchCode: string; batchTitle: string; status: BatchStatus; allocatedQuantity: number | null; productionStages: unknown; artisan: { workshopName: string; slug: string } }[];
  history: { id: string; fromStatus: QuoteStatus | null; toStatus: QuoteStatus; note: string | null; createdAt: string; actor: { name: string; role: UserRole } | null }[];
  viewer: { isOwner: boolean; isAdmin: boolean; isArtisan: boolean; invitation: { matchReasons: unknown; invitedBy: string } | null };
};
