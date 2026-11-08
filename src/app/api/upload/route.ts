import { withApi, ok, assertSameOrigin } from "@/lib/http";
import { getCurrentUser } from "@/lib/auth/session";
import { BadRequestError, UnauthorizedError } from "@/lib/errors";
import { processImages } from "@/lib/services/media-service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/upload – tải nhiều ảnh (multipart/form-data, trường `files`).
 * - purpose=proof: minh chứng đăng ký hộ nghề, cho phép khi chưa đăng nhập, lưu ở vùng RIÊNG TƯ.
 * - các mục đích khác: bắt buộc đăng nhập, lưu ở vùng công khai /media.
 * Trả về danh sách ảnh đã tối ưu kèm dung lượng trước/sau để minh họa hiệu quả nén.
 */
export const POST = withApi(async (req) => {
  assertSameOrigin(req);
  const form = await req.formData().catch(() => {
    throw new BadRequestError("Yêu cầu phải là multipart/form-data.");
  });
  const purpose = String(form.get("purpose") ?? "general");
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  const user = await getCurrentUser();
  if (purpose !== "proof" && !user) throw new UnauthorizedError();
  rateLimit(`upload:${user?.id ?? clientIp(req)}`, purpose === "proof" ? 10 : 60, 60 * 60 * 1000);

  const images = await processImages(files, purpose === "proof" ? "private" : "public");
  return ok(
    images.map(({ originalBytes, bytes, ...image }) => ({ ...image, stats: { originalBytes, bytes } })),
    { status: 201 },
  );
});
