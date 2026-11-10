import type { Metadata, Viewport } from "next";
import { Phudu, Alegreya, Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { MotionRuntime } from "@/components/motion/motion-runtime";
import { DemoBar } from "@/components/layout/demo-bar";

/* Biển hiệu ghép gốm – chữ hoa chắc, dấu tiếng Việt rõ ở cỡ lớn */
const phudu = Phudu({ subsets: ["latin", "vietnamese"], variable: "--font-phudu", display: "swap" });
/* Giọng kể – tên tác phẩm, tên xưởng, lời nghệ nhân */
const alegreya = Alegreya({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-alegreya", display: "swap" });
/* Chữ làm việc – thiết kế riêng cho tiếng Việt */
const beVietnam = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-bevietnam", display: "swap" });
/* Mã lô, mã yêu cầu */
const jetbrains = JetBrains_Mono({ subsets: ["latin", "vietnamese"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: "vCraft · Tinh hoa làng nghề, muôn phương lan tỏa", template: "%s · vCraft" },
  description:
    "Triển lãm số làng gốm Bát Tràng: câu chuyện nghệ nhân, truy xuất nguồn gốc từng lô bằng QR, bản đồ xưởng mở cửa, đặt lịch nặn gốm và sàn báo giá sỉ.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "vCraft" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2e8" },
    { media: "(prefers-color-scheme: dark)", color: "#120f0d" },
  ],
};

/**
 * Đặt chế độ sáng/tối trước khi vẽ trang (không nháy màu) và đánh dấu html.js
 * để các viên gốm chỉ ẩn chờ hiệu ứng khi JavaScript chắc chắn chạy.
 */
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('vcraft-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${phudu.variable} ${alegreya.variable} ${beVietnam.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh">
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded focus:bg-dem focus:px-4 focus:py-2 focus:text-giay"
          >
            Bỏ qua điều hướng
          </a>
          <DemoBar />
          {children}
          <MotionRuntime />
        </ToastProvider>
      </body>
    </html>
  );
}
