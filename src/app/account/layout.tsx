import type { ReactNode } from "react";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes } from "@/lib/services/cabinet-service";
import { CabinetShell } from "@/components/cabinet/cabinet-shell";
import { cabinetBootScript } from "@/components/cabinet/cabinet-doors";
import "@/styles/cabinet.css";

/** Khu khách hàng: "Tủ chè" – khung riêng, không dùng chung với khu nghệ nhân và Ban quản lý. */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await pageRequireRole("/account", "BUYER");
  const [reviews, quotes, unread] = await Promise.all([
    pendingReviews(user.id),
    buyerQuotes(user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: cabinetBootScript }} />
      <CabinetShell
        user={{ name: user.name, email: user.email, role: user.role, status: user.status }}
        badges={{ reviews: reviews.length, quotes: quotes.filter((q) => q.next?.urgent).length, unread }}
      >
        {children}
      </CabinetShell>
    </>
  );
}
