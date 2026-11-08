import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { encrypt } from "@/lib/crypto";
import { AppError, ConflictError, UnauthorizedError } from "@/lib/errors";
import { slugify, toSearchText } from "@/lib/text";
import type { LoginInput, RegisterArtisanInput, RegisterBuyerInput } from "@/lib/validators/auth";
import type { GlazeType } from "@prisma/client";
import { notifyAdmins } from "./notification-service";

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

/**
 * Kiểm tra đăng nhập. Sai quá 5 lần thì khóa tạm 15 phút (chống dò mật khẩu).
 * Thông báo lỗi giống nhau cho "sai email" và "sai mật khẩu" để không lộ email nào đã đăng ký.
 */
export async function authenticate(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const invalid = new UnauthorizedError("Email hoặc mật khẩu không đúng.");
  if (!user) throw invalid;

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(429, "ACCOUNT_LOCKED", `Tài khoản tạm khóa do đăng nhập sai nhiều lần. Thử lại sau ${minutes} phút.`);
  }
  if (user.status === "SUSPENDED") {
    throw new AppError(403, "ACCOUNT_SUSPENDED", "Tài khoản đã bị Ban quản lý tạm khóa. Vui lòng liên hệ BQL làng nghề.");
  }

  const okPassword = await verifyPassword(input.password, user.passwordHash);
  if (!okPassword) {
    const failed = user.failedLogins + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins: failed >= MAX_FAILED ? 0 : failed,
        lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60000) : null,
      },
    });
    throw invalid;
  }

  if (user.failedLogins > 0 || user.lockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  }
  return user;
}

async function assertEmailFree(email: string) {
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) throw new ConflictError("EMAIL_TAKEN", "Email này đã được đăng ký.", { email: ["Email này đã được đăng ký."] });
}

export async function registerBuyer(input: RegisterBuyerInput) {
  await assertEmailFree(input.email);
  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone,
      organization: input.organization || null,
      passwordHash: await hashPassword(input.password),
      role: "BUYER",
    },
  });
}

/** Tạo slug duy nhất bằng cách thêm hậu tố số khi trùng. */
async function uniqueWorkshopSlug(name: string) {
  const base = slugify(name) || "xuong-gom";
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.artisanProfile.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Đăng ký hộ nghề: tạo tài khoản ở trạng thái PENDING cùng hồ sơ xưởng chờ duyệt.
 * Số CCCD được mã hóa AES-256-GCM trước khi lưu. BQL nhận thông báo để kiểm duyệt.
 */
export async function registerArtisan(input: RegisterArtisanInput) {
  await assertEmailFree(input.email);
  const slug = await uniqueWorkshopSlug(input.workshopName);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
      role: "ARTISAN",
      status: "PENDING",
      artisanProfile: {
        create: {
          slug,
          workshopName: input.workshopName,
          artisanName: input.name,
          artisanTitle: "Thợ gốm",
          clanName: input.clanName,
          establishedYear: input.establishedYear,
          familyHistory: input.proofNote || `Xưởng ${input.workshopName} của dòng họ ${input.clanName}.`,
          address: input.address,
          latitude: input.latitude,
          longitude: input.longitude,
          specialties: input.specialties as GlazeType[],
          nationalIdEnc: encrypt(input.nationalId),
          proofDocuments: input.proofDocuments,
          isOpenForVisit: false,
          verificationStatus: "PENDING",
          searchText: toSearchText(input.workshopName, input.name, input.clanName, input.address),
        },
      },
    },
    include: { artisanProfile: true },
  });

  await notifyAdmins({
    type: "APPLICATION_SUBMITTED",
    title: "Hồ sơ hộ nghề mới chờ duyệt",
    body: `${input.workshopName} (dòng họ ${input.clanName}) vừa gửi hồ sơ đăng ký.`,
    link: `/dashboard/admin/approvals/${user.artisanProfile!.id}`,
  });
  return user;
}

export async function isEmailTaken(email: string) {
  return !!(await prisma.user.findUnique({ where: { email }, select: { id: true } }));
}
