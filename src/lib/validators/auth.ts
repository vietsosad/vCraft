import { z } from "zod";
import { GLAZE_KEYS } from "@/lib/constants";
import { normalizePhone } from "@/lib/text";

/**
 * Schema dùng chung cho cả biểu mẫu (client) và API (server):
 * hai phía luôn kiểm tra theo cùng một quy tắc và cùng thông báo lỗi tiếng Việt.
 */
export const emailSchema = z
  .string({ required_error: "Vui lòng nhập email." })
  .trim()
  .toLowerCase()
  .email("Email chưa đúng định dạng.");

export const passwordSchema = z
  .string({ required_error: "Vui lòng nhập mật khẩu." })
  .min(8, "Mật khẩu cần ít nhất 8 ký tự.")
  .regex(/[a-z]/, "Mật khẩu cần có chữ thường.")
  .regex(/[A-Z]/, "Mật khẩu cần có chữ hoa.")
  .regex(/\d/, "Mật khẩu cần có chữ số.");

export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => normalizePhone(v) !== null, "Số điện thoại Việt Nam gồm 10 chữ số, ví dụ 0912 345 678.")
  .transform((v) => normalizePhone(v) as string);

export const nameSchema = z.string().trim().min(2, "Họ tên cần ít nhất 2 ký tự.").max(80);

/** Ba cổng đăng nhập riêng cho ba vai trò. */
export const PORTALS = ["customer", "artisan", "admin"] as const;
export type Portal = (typeof PORTALS)[number];

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  portal: z.enum(PORTALS).default("customer"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerBuyerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  organization: z.string().trim().max(120).optional().or(z.literal("")),
  password: passwordSchema,
});
export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;

/** Đăng ký nghệ nhân – 3 bước: tài khoản → xưởng & vị trí → minh chứng. */
export const artisanAccountStep = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const artisanWorkshopStep = z.object({
  workshopName: z.string().trim().min(3, "Tên xưởng cần ít nhất 3 ký tự.").max(100),
  clanName: z.string().trim().min(2, "Vui lòng nhập dòng họ.").max(60),
  establishedYear: z.coerce
    .number({ invalid_type_error: "Năm thành lập phải là số." })
    .int()
    .min(1400, "Năm thành lập không hợp lệ.")
    .max(new Date().getFullYear(), "Năm thành lập không thể ở tương lai."),
  address: z.string().trim().min(5, "Vui lòng nhập địa chỉ xưởng."),
  latitude: z.coerce.number().min(20.9, "Vị trí phải nằm trong khu vực Bát Tràng.").max(21.05, "Vị trí phải nằm trong khu vực Bát Tràng."),
  longitude: z.coerce.number().min(105.85, "Vị trí phải nằm trong khu vực Bát Tràng.").max(105.98, "Vị trí phải nằm trong khu vực Bát Tràng."),
  specialties: z.array(z.enum(GLAZE_KEYS as [string, ...string[]])).min(1, "Chọn ít nhất một dòng men sở trường."),
});

export const artisanProofStep = z.object({
  nationalId: z.string().trim().regex(/^\d{12}$/, "Số CCCD gồm đúng 12 chữ số."),
  proofNote: z.string().trim().max(500).optional().or(z.literal("")),
  proofDocuments: z
    .array(z.object({ src: z.string(), width: z.number(), height: z.number(), alt: z.string().default("") }))
    .min(1, "Tải lên ít nhất một ảnh minh chứng (giấy xác nhận của thôn hoặc Hội làng nghề)."),
});

export const registerArtisanSchema = artisanAccountStep.merge(artisanWorkshopStep).merge(artisanProofStep);
export type RegisterArtisanInput = z.infer<typeof registerArtisanSchema>;
