import { getCurrentUser } from "@/lib/auth/session";
import { RoleSwitcher } from "./role-switcher";

/** Thanh chuyển vai trò cho buổi vấn đáp – hiện ở mọi khu khi bật DEMO_MODE. */
export async function DemoBar() {
  if (process.env.DEMO_MODE !== "true") return null;
  const user = await getCurrentUser();
  return <RoleSwitcher currentEmail={user?.email ?? null} />;
}
