import { z } from "zod";
import { CATEGORY_SLUGS, GLAZE_KEYS } from "@/lib/constants";
import { mediaImageSchema } from "@/lib/types";

export const quoteCreateSchema = z.object({
  organizationName: z.string().trim().min(2, "Nhập tên tổ chức.").max(160),
  title: z.string().trim().min(10, "Tiêu đề cần ít nhất 10 ký tự.").max(200),
  category: z.enum(CATEGORY_SLUGS),
  preferredGlaze: z.enum(GLAZE_KEYS as [string, ...string[]]),
  quantity: z.coerce
    .number({ invalid_type_error: "Số lượng phải là số." })
    .int()
    .min(50, "Đơn sỉ tối thiểu 50 sản phẩm.")
    .max(1_000_000),
  targetBudgetPerUnit: z.coerce.number().int().min(1000, "Ngân sách tối thiểu 1.000 ₫/sản phẩm."),
  deadlineDays: z.coerce.number().int().min(7, "Thời hạn tối thiểu 7 ngày.").max(365),
  biddingDays: z.coerce.number().int().min(1, "Hạn nhận chào giá tối thiểu 1 ngày.").max(30).default(5),
  specifications: z.string().trim().min(20, "Mô tả yêu cầu cần ít nhất 20 ký tự.").max(4000),
  deliveryAddress: z.string().trim().min(5, "Nhập địa chỉ giao hàng."),
  referenceImages: z.array(mediaImageSchema).max(6).default([]),
}).refine((v) => v.biddingDays < v.deadlineDays, {
  path: ["biddingDays"],
  message: "Hạn nhận chào giá phải ngắn hơn thời hạn giao hàng.",
});
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>;

export const bidSchema = z.object({
  offeredPricePerUnit: z.coerce.number().int().min(1000, "Đơn giá tối thiểu 1.000 ₫."),
  committedQuantity: z.coerce.number().int().min(1, "Số lượng nhận làm tối thiểu 1."),
  estimatedDays: z.coerce.number().int().min(1).max(365),
  proposalNote: z.string().trim().min(10, "Ghi chú cần ít nhất 10 ký tự.").max(2000),
});
export type BidInput = z.infer<typeof bidSchema>;

export const bidUpdateSchema = bidSchema.extend({ version: z.number().int().min(1) });

/** Chốt phân bổ: gửi kèm version của yêu cầu và của từng chào giá mà người mua đã thấy. */
export const acceptSchema = z.object({
  expectedVersion: z.number().int().min(1),
  selections: z
    .array(
      z.object({
        bidId: z.string(),
        bidVersion: z.number().int().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Chọn ít nhất một chào giá."),
});
export type AcceptInput = z.infer<typeof acceptSchema>;

export const versionedActionSchema = z.object({
  expectedVersion: z.number().int().min(1),
  reason: z.string().trim().max(500).optional(),
});
