import {
  LayoutDashboard, FileText, Heart, CalendarDays, Star, UserCog, Store, Package, Layers, BarChart3,
  ShieldCheck, ClipboardCheck, Network, Newspaper, Users, ScrollText, Route, Flame, Stamp, Mail, type LucideIcon,
} from "lucide-react";

export type Role = "BUYER" | "ARTISAN" | "ADMIN";

export type ZoneLink = { href: string; label: string; icon: LucideIcon; exact?: boolean; badgeKey?: string; short?: string };

export type Zone = {
  name: string;
  roleLabel: string;
  home: string;
  loginHref: string;
  /** lớp nền chữ cái đại diện */
  avatar: string;
  /** dải men đầu menu */
  band: string;
  tone: "lam" | "datnung" | "ngoc";
  nav: ZoneLink[];
  menu: ZoneLink[];
  /** các tab dưới đáy màn hình điện thoại (tối đa 4; ô thứ năm luôn là "Khác") */
  tabs: string[];
};

/**
 * Ba khu riêng cho ba vai trò. Mỗi khu có màu men riêng, cổng đăng nhập riêng và menu riêng:
 * - Khách hàng : men lam  · /account
 * - Nghệ nhân  : đất nung · /dashboard/artisan
 * - Ban quản lý: men ngọc · /dashboard/admin
 */
export const ZONES: Record<Role, Zone> = {
  BUYER: {
    name: "Đường làng",
    roleLabel: "Khách hàng",
    home: "/account",
    loginHref: "/login",
    avatar: "bg-lam-nen",
    band: "tile-lam",
    tone: "lam",
    // Mỗi mục là một điểm dừng trên đường làng (xem src/components/lang)
    nav: [
      { href: "/account", label: "Việc chờ bạn", short: "Đường làng", icon: Route, exact: true },
      { href: "/account/quotes", label: "Lò đơn sỉ", short: "Lò đơn", icon: Flame, badgeKey: "quotes" },
      { href: "/account/bookings", label: "Bàn xoay", short: "Bàn xoay", icon: CalendarDays },
      { href: "/account/favorites", label: "Kệ trưng bày", short: "Kệ", icon: Heart },
      { href: "/account/traces", label: "Hộ chiếu", short: "Hộ chiếu", icon: Stamp },
      { href: "/account/reviews", label: "Đánh giá", short: "Đánh giá", icon: Star, badgeKey: "reviews" },
      { href: "/account/notifications", label: "Bến thư", short: "Thư", icon: Mail, badgeKey: "unread" },
      { href: "/account/profile", label: "Hồ sơ", short: "Hồ sơ", icon: UserCog },
    ],
    menu: [
      { href: "/account", label: "Việc chờ bạn", icon: Route },
      { href: "/account/quotes", label: "Lò đơn sỉ", icon: Flame },
      { href: "/account/bookings", label: "Bàn xoay – lịch nặn gốm", icon: CalendarDays },
      { href: "/account/traces", label: "Hộ chiếu làng nghề", icon: Stamp },
      { href: "/account/reviews", label: "Đánh giá", icon: Star },
      { href: "/account/profile", label: "Hồ sơ & bảo mật", icon: UserCog },
    ],
    tabs: ["/account", "/account/quotes", "/account/bookings", "/account/favorites"],
  },
  ARTISAN: {
    name: "Xưởng của tôi",
    roleLabel: "Nghệ nhân",
    home: "/dashboard/artisan",
    loginHref: "/login/artisan",
    avatar: "bg-datnung-nen",
    band: "tile-dat",
    tone: "datnung",
    nav: [
      { href: "/dashboard/artisan", label: "Tổng quan", short: "Xưởng", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/artisan/batches", label: "Lô & nhật ký", short: "Lô", icon: Layers },
      { href: "/dashboard/artisan/products", label: "Sản phẩm", short: "Sản phẩm", icon: Package },
      { href: "/dashboard/artisan/quotes", label: "Cơ hội báo giá", short: "Báo giá", icon: FileText, badgeKey: "quotes" },
      { href: "/dashboard/artisan/bookings", label: "Lịch trải nghiệm", short: "Lịch", icon: CalendarDays, badgeKey: "bookings" },
      { href: "/dashboard/artisan/reviews", label: "Đánh giá", short: "Đánh giá", icon: Star },
      { href: "/dashboard/artisan/stats", label: "Thống kê", short: "Thống kê", icon: BarChart3 },
      { href: "/dashboard/artisan/profile", label: "Hồ sơ xưởng", short: "Hồ sơ", icon: Store },
      { href: "/dashboard/artisan/account", label: "Tài khoản", short: "Tài khoản", icon: UserCog },
    ],
    menu: [
      { href: "/dashboard/artisan", label: "Tổng quan xưởng", icon: Store },
      { href: "/dashboard/artisan/bookings", label: "Lịch trải nghiệm", icon: CalendarDays },
      { href: "/dashboard/artisan/quotes", label: "Cơ hội báo giá", icon: FileText },
      { href: "/dashboard/artisan/account", label: "Tài khoản & bảo mật", icon: UserCog },
    ],
    tabs: ["/dashboard/artisan", "/dashboard/artisan/batches", "/dashboard/artisan/quotes", "/dashboard/artisan/bookings"],
  },
  ADMIN: {
    name: "Bảng điều phối",
    roleLabel: "Ban quản lý",
    home: "/dashboard/admin",
    loginHref: "/login/admin",
    avatar: "bg-ngoc-nen",
    band: "tile-ngoc",
    tone: "ngoc",
    nav: [
      { href: "/dashboard/admin", label: "Tổng quan", short: "Tổng quan", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/admin/approvals", label: "Duyệt hộ nghề", short: "Duyệt", icon: ClipboardCheck, badgeKey: "approvals" },
      { href: "/dashboard/admin/coordination", label: "Điều phối đơn sỉ", short: "Điều phối", icon: Network },
      { href: "/dashboard/admin/news", label: "Bản tin", short: "Bản tin", icon: Newspaper },
      { href: "/dashboard/admin/users", label: "Tài khoản người dùng", short: "Người dùng", icon: Users },
      { href: "/dashboard/admin/reports", label: "Báo cáo & xuất CSV", short: "Báo cáo", icon: BarChart3 },
      { href: "/dashboard/admin/audit", label: "Nhật ký hoạt động", short: "Nhật ký", icon: ScrollText },
      { href: "/dashboard/admin/account", label: "Tài khoản của tôi", short: "Tôi", icon: UserCog },
    ],
    menu: [
      { href: "/dashboard/admin", label: "Bảng điều phối", icon: ShieldCheck },
      { href: "/dashboard/admin/approvals", label: "Duyệt hộ nghề", icon: ClipboardCheck },
      { href: "/dashboard/admin/account", label: "Tài khoản & bảo mật", icon: UserCog },
    ],
    tabs: ["/dashboard/admin", "/dashboard/admin/approvals", "/dashboard/admin/coordination", "/dashboard/admin/news"],
  },
};
