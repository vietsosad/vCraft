import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/crypto";

export const SESSION_COOKIE = "vcraft_session";
const SESSION_DAYS = 7;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  organization: string | null;
  artisanId: string | null;
  artisanSlug: string | null;
  artisanVerified: boolean;
};

/**
 * Tạo phiên đăng nhập mới:
 * - Sinh token ngẫu nhiên 256 bit, cookie giữ token gốc (httpOnly, SameSite=Lax, Secure ở production).
 * - CSDL chỉ lưu bản băm SHA-256, nên lộ CSDL cũng không dùng lại được phiên.
 */
export async function createSession(userId: string) {
  const token = randomToken();
  const h = await headers();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(token),
      userAgent: h.get("user-agent")?.slice(0, 250) ?? null,
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      expiresAt,
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Thu hồi phiên hiện tại và xóa cookie. */
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Thu hồi mọi phiên của một người dùng (đổi mật khẩu, bị khóa tài khoản). */
export async function revokeAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

/**
 * Người dùng hiện tại (hoặc null). Được cache trong phạm vi một request.
 * Tài khoản bị khóa coi như chưa đăng nhập.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: {
        include: { artisanProfile: { select: { id: true, slug: true, verificationStatus: true } } },
      },
    },
  });
  if (!session || session.expiresAt < new Date() || session.user.status === "SUSPENDED") return null;

  // Gia hạn trượt: cập nhật lastSeenAt tối đa 1 lần mỗi 10 phút
  if (Date.now() - session.lastSeenAt.getTime() > 10 * 60 * 1000) {
    await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    organization: user.organization,
    artisanId: user.artisanProfile?.id ?? null,
    artisanSlug: user.artisanProfile?.slug ?? null,
    artisanVerified: user.artisanProfile?.verificationStatus === "APPROVED",
  };
});
