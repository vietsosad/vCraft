import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ConciergeDrawer } from "@/components/ai/concierge-drawer";

/** Khu công khai: triển lãm, bản đồ, truy xuất, bản tin. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ConciergeDrawer />
    </>
  );
}
