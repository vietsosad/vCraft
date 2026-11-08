import { TooManyRequestsError } from "./errors";

/**
 * Giới hạn tần suất đơn giản trong bộ nhớ (cửa sổ trượt cố định).
 * Đủ cho một tiến trình Node khi demo; triển khai nhiều máy chủ thì thay bằng Redis.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const seconds = Math.ceil((bucket.resetAt - now) / 1000);
    throw new TooManyRequestsError(`Bạn thao tác quá nhanh, vui lòng thử lại sau ${seconds} giây.`);
  }
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
