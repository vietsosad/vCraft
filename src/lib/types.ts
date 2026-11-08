import { z } from "zod";

/** Ảnh đã tối ưu (WebP) kèm ảnh mờ giữ chỗ – dùng chung cho sản phẩm, xưởng, nhật ký. */
export const mediaImageSchema = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().optional(),
  alt: z.string().default(""),
  thumb: z.string().optional(),
  credit: z
    .object({ title: z.string(), author: z.string(), license: z.string(), url: z.string() })
    .optional(),
});
export type MediaImage = z.infer<typeof mediaImageSchema>;

/** Một mốc trong nhật ký sản xuất của lô. */
export const productionStageSchema = z.object({
  id: z.string(),
  key: z.string().optional(),
  title: z.string(),
  description: z.string(),
  occurredAt: z.string(),
  temperatureC: z.number().int().nullable().optional(),
  images: z.array(mediaImageSchema).default([]),
  isAddendum: z.boolean().optional(),
  recordedAt: z.string().optional(),
});
export type ProductionStage = z.infer<typeof productionStageSchema>;

export const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  year: z.number().int(),
});
export type Certification = z.infer<typeof certificationSchema>;

/** Đọc an toàn cột Json từ Prisma thành kiểu đã biết; dữ liệu hỏng thì trả mặc định. */
export function asImages(value: unknown): MediaImage[] {
  const parsed = z.array(mediaImageSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asImage(value: unknown): MediaImage | null {
  const parsed = mediaImageSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function asStages(value: unknown): ProductionStage[] {
  const parsed = z.array(productionStageSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asCertifications(value: unknown): Certification[] {
  const parsed = z.array(certificationSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function asStrings(value: unknown): string[] {
  const parsed = z.array(z.string()).safeParse(value);
  return parsed.success ? parsed.data : [];
}
