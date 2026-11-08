/**
 * Các lỗi nghiệp vụ có mã HTTP và mã lỗi ổn định.
 * Route handler bắt chúng qua `withApi` và trả JSON `{ error: { code, message, details } }`.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown, code = "BAD_REQUEST") {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Bạn cần đăng nhập để tiếp tục.") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Bạn không có quyền thực hiện thao tác này.") {
    super(403, "FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Không tìm thấy dữ liệu.") {
    super(404, "NOT_FOUND", message);
  }
}

/** Xung đột đồng thời hoặc bản ghi đã bị khóa (HTTP 409). */
export class ConflictError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(409, code, message, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string) {
    super(429, "TOO_MANY_REQUESTS", message);
  }
}
