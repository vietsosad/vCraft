import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConciergeDrawer } from "@/components/ai/concierge-drawer";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SiteMain } from "@/components/layout/site-main";

/** Khu công khai: triển lãm, bản đồ, truy xuất, bản tin. Trang chủ giữ nguyên; các trang bên trong dùng phạm vi thao tác. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <SiteMain>{children}</SiteMain>
      <Footer />
      <ConciergeDrawer />
      <SmoothScroll />
    </>
  );
}
