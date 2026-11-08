import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";
import { ConciergeDrawer } from "@/components/ai/concierge-drawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "vCraft · Tinh hoa làng nghề, muôn phương lan tỏa", template: "%s · vCraft" },
  description:
    "Triển lãm số làng gốm Bát Tràng: câu chuyện nghệ nhân, truy xuất nguồn gốc từng lô bằng QR, bản đồ xưởng mở cửa và sàn báo giá sỉ.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "vCraft" },
};

export const viewport: Viewport = { themeColor: "#f9f6f0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${cormorant.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh">
        <ToastProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-kaolin">
            Bỏ qua điều hướng
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <ConciergeDrawer />
        </ToastProvider>
      </body>
    </html>
  );
}
