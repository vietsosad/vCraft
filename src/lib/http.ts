import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type output } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, BadRequestError } from "./errors";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Trả dữ liệu thành công theo định dạng thống nhất `{ data, meta? }`. */
export function ok<T>(data: T, init?: { status?: number; meta?: Record<string, unknown> }) {
  return NextResponse.json(init?.meta ? { data, meta: init.meta } : { data }, { status: init?.status ?? 200 });
}

/** Chuyển lỗi bất kỳ thành phản hồi JSON có mã lỗi ổn định. */
export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại.",
          details: err.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return NextResponse.json(
      { error: { code: "DUPLICATE", message: "Dữ liệu đã tồn tại.", details: err.meta } },
      { status: 409 },
    );
  }
  console.error("[api] lỗi không mong đợi:", err);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Đã có lỗi xảy ra, vui lòng thử lại sau." } },
    { status: 500 },
  );
}

/**
 * Bọc route handler: bắt lỗi và chuyển thành JSON.
 * Giúp mọi handler chỉ còn tập trung vào nghiệp vụ.
 */
export function withApi<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/** Đọc và kiểm tra body JSON bằng schema Zod. */
export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<output<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new BadRequestError("Body phải là JSON hợp lệ.");
  }
  return schema.parse(raw);
}

/** Đọc và kiểm tra query string bằng schema Zod. */
export function parseQuery<S extends ZodTypeAny>(req: Request, schema: S): output<S> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  return schema.parse(params);
}

/**
 * Chống CSRF cho các yêu cầu thay đổi dữ liệu:
 * header Origin (nếu có) phải trùng host của ứng dụng. Kết hợp cookie SameSite=Lax.
 */
export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host && new URL(origin).host !== host) {
    throw new AppError(403, "CSRF_REJECTED", "Yêu cầu bị từ chối vì không cùng nguồn gốc.");
  }
}
