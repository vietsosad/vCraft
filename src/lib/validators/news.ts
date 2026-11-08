import { z } from "zod";
import { mediaImageSchema } from "@/lib/types";

export const newsInputSchema = z.object({
  title: z.string().trim().min(8, "Tiêu đề cần ít nhất 8 ký tự.").max(200),
  category: z.enum(["NGUYEN_LIEU", "LICH_CUP_DIEN", "CHINH_SACH", "SU_KIEN"]),
  excerpt: z.string().trim().min(20, "Tóm tắt cần ít nhất 20 ký tự.").max(300),
  content: z.string().trim().min(40, "Nội dung cần ít nhất 40 ký tự.").max(20000),
  coverImage: mediaImageSchema.nullable().optional(),
  isUrgent: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
export type NewsInput = z.infer<typeof newsInputSchema>;
