import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { randomToken, sha256 } from "@/lib/crypto";
import { AppError, BadRequestError } from "@/lib/errors";
import { normalizePhone } from "@/lib/text";
import { audit } from "./audit";
import { notify } from "./notification-service";

const RESET_MINUTES = 30;

export async function updateProfile(userId: string, input: { name: string; phone?: string; organization?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone ? normalizePhone(input.phone) : null,
      organization: input.organization || null,
    },
    select: { id: true, name: true, phone: true, organization: true },
  });
}

/** Đổi mật khẩu: kiểm tra mật khẩu cũ, rồi thu hồi mọi phiên khác (giữ phiên hiện tại). */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new AppError(422, "VALIDATION_ERROR", "Mật khẩu hiện tại chưa đúng.", { currentPassword: ["Mật khẩu hiện tại chưa đúng."] });
  }
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const revoked = await prisma.session.deleteMany({ where: { userId, ...(token ? { tokenHash: { not: sha256(token) } } : {}) } });
  await audit(userId, "user.password_changed", "User", userId);
  return { revokedSessions: revoked.count };
}

export async function listSessions(userId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const current = token ? sha256(token) : null;
  const rows = await prisma.session.findMany({ where: { userId, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" } });
  return rows.map((s) => ({ id: s.id, userAgent: s.userAgent, ipAddress: s.ipAddress, lastSeenAt: s.lastSeenAt, current: s.tokenHash === current }));
}

/**
 * Quên mật khẩu: luôn trả lời giống nhau dù email có tồn tại hay không (không lộ tài khoản).
 * Hệ thống chưa nối dịch vụ email, nên ở chế độ demo trả kèm đường dẫn đặt lại để kiểm thử;
 * khi vận hành thật, đường dẫn này được gửi qua email.
 */
export async function requestPasswordReset(email: string, appUrl: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status === "SUSPENDED") return { demoLink: null };
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  const token = randomToken();
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000) },
  });
  await audit(user.id, "user.password_reset_requested", "User", user.id);
  const link = `${appUrl}/reset-password?token=${token}`;
  return { demoLink: process.env.DEMO_MODE === "true" ? link : null };
}

export async function resetPassword(token: string, newPassword: string) {
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new BadRequestError("Đường dẫn đặt lại đã hết hạn hoặc đã được dùng. Vui lòng yêu cầu đường dẫn mới.", undefined, "RESET_INVALID");
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(newPassword), failedLogins: 0, lockedUntil: null } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await notify(row.userId, { type: "PASSWORD_RESET", title: "Mật khẩu đã được đặt lại", body: "Mọi phiên đăng nhập cũ đã bị đăng xuất. Nếu không phải bạn, hãy liên hệ Ban quản lý ngay." });
  await audit(row.userId, "user.password_reset", "User", row.userId);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: row.userId }, select: { role: true } });
  return { role: user.role };
}
