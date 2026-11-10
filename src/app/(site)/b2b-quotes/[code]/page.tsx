import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Đường dẫn cũ /b2b-quotes/:mã (có trong thông báo, mã QR, câu trả lời của trợ lý):
 * chuyển tới phòng báo giá trong đúng khu của người đang xem.
 */
export default async function LegacyQuoteRedirect({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/account/quotes/${code}`)}`);
  if (user.role === "ARTISAN") redirect(`/dashboard/artisan/quotes/${code}`);
  if (user.role === "ADMIN") redirect(`/dashboard/admin/coordination/${code}`);
  redirect(`/account/quotes/${code}`);
}
