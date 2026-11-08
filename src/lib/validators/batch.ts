import { z } from "zod";
import { GLAZE_KEYS } from "@/lib/constants";
import { mediaImageSchema } from "@/lib/types";

export const batchCreateSchema = z.object({
  batchTitle: z.string().trim().min(5, "Tên lô cần ít nhất 5 ký tự.").max(120),
  glazeType: z.enum(GLAZE_KEYS as [string, ...string[]]),
  quantityProduced: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1.").max(100000),
  clayOrigin: z.string().trim().min(3).max(200),
  kilnType: z.string().trim().min(3).max(120),
  peakTempC: z.coerce.number().int().min(600).max(1400),
  firingDurationHr: z.coerce.number().int().min(1).max(120),
});
export type BatchCreateInput = z.infer<typeof batchCreateSchema>;

/** Thêm một mốc công đoạn: bắt buộc có ảnh minh chứng, không ở tương lai. */
export const stageInputSchema = z.object({
  key: z.string().optional(),
  title: z.string().trim().min(3, "Nhập tên công đoạn.").max(120),
  description: z.string().trim().min(10, "Mô tả cần ít nhất 10 ký tự.").max(2000),
  occurredAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Thời điểm không hợp lệ.")
    .refine((v) => Date.parse(v) <= Date.now() + 5 * 60 * 1000, "Thời điểm không thể ở tương lai."),
  temperatureC: z.coerce.number().int().min(0).max(1500).nullable().optional(),
  images: z.array(mediaImageSchema).min(1, "Cần ít nhất 1 ảnh minh chứng cho mỗi công đoạn.").max(6, "Tối đa 6 ảnh."),
});
export type StageInput = z.infer<typeof stageInputSchema>;
