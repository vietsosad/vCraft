import type { ReactNode } from "react";
import { Chakra_Petch } from "next/font/google";
import { pageRequireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { pendingReviews } from "@/lib/services/engagement-service";
import { buyerQuotes } from "@/lib/services/buyer-zone";
import { WeaveShell } from "@/components/weave/weave-shell";
import "@/styles/weave.css";

/** Chữ hiệu riêng của khu khách hàng: góc cắt như sợi dệt, khác chữ biển hiệu của trang chủ. */
const chakra = Chakra_Petch({ subsets: ["latin", "vietnamese"], weight: ["500", "600", "700"], variable: "--font-chakra", display: "swap" });

/** Khu khách hàng: "Tấm dệt" – thế giới thổ cẩm riêng, tách khỏi trang chủ và trang đăng nhập. */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await pageRequireRole("/account", "BUYER");
  const [reviews, quotes, unread] = await Promise.all([
    pendingReviews(user.id),
    buyerQuotes(user.id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return (
    <div className={chakra.variable}>
      <WeaveShell
        user={{ name: user.name, email: user.email, role: user.role, status: user.status }}
        badges={{ reviews: reviews.length, quotes: quotes.filter((q) => q.next).length, unread }}
      >
        {children}
      </WeaveShell>
    </div>
  );
}
