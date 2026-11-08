/**
 * Client gọi REST API bằng fetch – dùng trong client component.
 * Mọi phản hồi theo định dạng `{ data }` hoặc `{ error: { code, message, details } }`.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }

  /** Lỗi theo từng trường (422) để hiển thị ngay dưới ô nhập. */
  get fieldErrors(): Record<string, string> {
    if (this.code !== "VALIDATION_ERROR" || !this.details || typeof this.details !== "object") return {};
    return Object.fromEntries(
      Object.entries(this.details as Record<string, string[]>).map(([k, v]) => [k, v?.[0] ?? ""]),
    );
  }
}

type Options = { method?: string; body?: unknown; signal?: AbortSignal };

export async function api<T>(url: string, opts: Options = {}): Promise<T> {
  const res = await fetch(url, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: "same-origin",
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const err = payload?.error;
    throw new ApiError(res.status, err?.code ?? "NETWORK", err?.message ?? "Không kết nối được máy chủ.", err?.details);
  }
  return payload?.data as T;
}

/** Biến lỗi Zod phía client thành map { field: message }. */
export function zodFieldErrors(issues: { path: (string | number)[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
