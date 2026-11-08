import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "./logo";
import { NavLinks, MobileNav } from "./nav-links";
import { UserMenu } from "./user-menu";
import { RoleSwitcher } from "./role-switcher";
import { NotificationBell } from "./notification-bell";
import { ButtonLink } from "@/components/ui/button";

export async function Header() {
  const user = await getCurrentUser();
  const demo = process.env.DEMO_MODE === "true";

  return (
    <header className="sticky top-0 z-[500] border-b border-line/80 bg-kaolin/90 backdrop-blur-md">
      {demo && <RoleSwitcher currentEmail={user?.email ?? null} />}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[72px] md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <UserMenu user={{ name: user.name, email: user.email, role: user.role, status: user.status }} />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink href="/login" variant="ghost" size="sm">
                Đăng nhập
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Đăng ký
              </ButtonLink>
            </div>
          )}
          <MobileNav loggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
