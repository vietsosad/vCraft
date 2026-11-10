import { z } from "zod";
import { nameSchema, passwordSchema, phoneSchema, emailSchema } from "./auth";

/**
 * Schema cho các tiện ích tương tác: yêu thích, đánh giá, đặt lịch trải nghiệm, tài khoản.
 * Dùng chung client và server.
 */

export const favoriteSchema = z
  .object({ productId: z.string().cuid().optional(), artisanId: z.string().cuid().optional() })
  .refine((v) => !!v.productId !== !!v.artisanId, "Chọn đúng một sản phẩm hoặc một xưởng.");

export const reviewSchema = z
  .object({
    artisanId: z.string().cuid(),
    quoteCode: z.string().trim().optional(),
    bookingCode: z.string().trim().optional(),
    rating: z.coerce.number().int().min(1, "Chọn từ 1 đến 5 sao.").max(5, "Chọn từ 1 đến 5 sao."),
    comment: z.string().trim().min(10, "Viết ít nhất 10 ký tự để nghệ nhân hiểu bạn hài lòng điều gì.").max(1000),
  })
  .refine((v) => !!v.quoteCode !== !!v.bookingCode, "Đánh giá phải gắn với một đơn sỉ hoặc một buổi trải nghiệm.");
export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewReplySchema = z.object({
  reply: z.string().trim().min(2, "Lời đáp quá ngắn.").max(600),
});

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày chưa đúng định dạng.");

export const bookingCreateSchema = z.object({
  artisanSlug: z.string().trim().min(1),
  visitDate: isoDate,
  slot: z.string().regex(/^\d{2}:\d{2}$/, "Chọn một khung giờ."),
  guests: z.coerce.number().int().min(1, "Ít nhất 1 khách.").max(40, "Đoàn trên 40 khách vui lòng gửi yêu cầu đặt sỉ."),
  contactName: nameSchema,
  contactPhone: phoneSchema,
  note: z.string().trim().max(400).optional().or(z.literal("")),
});
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const bookingActionSchema = z.object({
  action: z.enum(["confirm", "decline", "complete", "cancel"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  version: z.coerce.number().int().min(1),
});

export const availabilityQuery = z.object({ date: isoDate });

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Hai lần nhập mật khẩu mới chưa khớp.", path: ["confirmPassword"] })
  .refine((v) => v.newPassword !== v.currentPassword, { message: "Mật khẩu mới phải khác mật khẩu hiện tại.", path: ["newPassword"] });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({ token: z.string().min(20), newPassword: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Hai lần nhập mật khẩu chưa khớp.", path: ["confirmPassword"] });
