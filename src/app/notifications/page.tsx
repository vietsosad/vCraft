import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/** /notifications chung → trang thông báo trong khu của từng vai trò. */
export default async function NotificationsRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");
  redirect(user.role === "ARTISAN" ? "/dashboard/artisan/notifications" : user.role === "ADMIN" ? "/dashboard/admin/notifications" : "/account/notifications");
}
