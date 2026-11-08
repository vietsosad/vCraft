import { z } from "zod";
import { CATEGORY_SLUGS, GLAZE_KEYS } from "@/lib/constants";
import { certificationSchema, mediaImageSchema } from "@/lib/types";

const glazeEnum = z.enum(GLAZE_KEYS as [string, ...string[]]);

/** Tham số lọc danh sách sản phẩm (query string). */
export const productQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORY_SLUGS).optional(),
  glaze: glazeEnum.optional(),
  artisan: z.string().trim().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  unique: z.enum(["1"]).optional(),
  traceable: z.enum(["1"]).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

export const productInputSchema = z.object({
  name: z.string().trim().min(3, "Tên sản phẩm cần ít nhất 3 ký tự.").max(120),
  category: z.enum(CATEGORY_SLUGS, { errorMap: () => ({ message: "Chọn một phân loại." }) }),
  glazeType: glazeEnum,
  priceVnd: z.coerce
    .number({ invalid_type_error: "Giá phải là số." })
    .int()
    .min(10000, "Giá tối thiểu 10.000 ₫.")
    .max(500_000_000, "Giá vượt quá giới hạn."),
  dimensions: z.string().trim().min(2, "Nhập kích thước, ví dụ Cao 35 cm × Ø 20 cm."),
  firingTempC: z.coerce.number().int().min(600).max(1400).default(1300),
  glazeThickness: z.string().trim().default("0.3mm"),
  story: z.string().trim().min(20, "Câu chuyện sản phẩm cần ít nhất 20 ký tự."),
  images: z.array(mediaImageSchema).min(1, "Tải lên ít nhất một ảnh.").max(12, "Tối đa 12 ảnh."),
  isUniquePiece: z.boolean().default(false),
  stock: z.coerce.number().int().min(0).default(1),
  isPublished: z.boolean().default(true),
  currentBatchId: z.string().nullable().optional(),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const workshopUpdateSchema = z.object({
  workshopName: z.string().trim().min(3).max(100),
  artisanName: z.string().trim().min(2).max(80),
  artisanTitle: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  familyHistory: z.string().trim().min(40, "Câu chuyện gia đình cần ít nhất 40 ký tự."),
  address: z.string().trim().min(5),
  latitude: z.coerce.number().min(20.9).max(21.05),
  longitude: z.coerce.number().min(105.85).max(105.98),
  openingHours: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/, "Giờ mở cửa dạng 08:00-17:00.")
    .refine((v) => v.split("-")[0] < v.split("-")[1], "Giờ đóng cửa phải sau giờ mở cửa."),
  openDays: z.array(z.number().int().min(0).max(6)).min(1, "Chọn ít nhất một ngày mở cửa."),
  isOpenForVisit: z.boolean(),
  experienceOffered: z.boolean(),
  experiencePriceVnd: z.coerce.number().int().min(0).max(5_000_000),
  acceptsWholesale: z.boolean(),
  maxMonthlyCapacity: z.coerce.number().int().min(0).max(1_000_000),
  specialties: z.array(glazeEnum).min(1, "Chọn ít nhất một dòng men."),
  certifications: z.array(certificationSchema).max(20),
  workshopImages: z.array(mediaImageSchema).max(30),
});
export type WorkshopUpdateInput = z.infer<typeof workshopUpdateSchema>;
