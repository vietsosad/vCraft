import type { ReactNode } from "react";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes } from "@/lib/services/buyer-zone";
import { LangShell } from "@/components/lang/lang-shell";
import "@/styles/lang.css";

/** Khu khách hàng: "Đường làng" – một ngày dạo làng gốm Bát Tràng, tách khỏi trang chủ và trang đăng nhập. */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await pageRequireRole("/account", "BUYER");
  const [reviews, quotes, unread] = await Promise.all([
    pendingReviews(user.id),
    buyerQuotes(user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return (
    <LangShell
      user={{ name: user.name, email: user.email, role: user.role, status: user.status }}
      badges={{ reviews: reviews.length, quotes: quotes.filter((q) => q.next).length, unread }}
    >
      {children}
    </LangShell>
  );
}
