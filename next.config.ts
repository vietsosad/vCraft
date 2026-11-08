import type { NextConfig } from "next";

/** Header bảo mật áp dụng cho mọi phản hồi. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1280, 1600],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /**
   * Viết lại URL: đường dẫn tiếng Việt thân thiện trỏ tới cùng trang (người dùng thấy URL tiếng Việt),
   * còn chuyển hướng 301 gom các URL cũ về một địa chỉ chuẩn.
   */
  async rewrites() {
    return [
      { source: "/san-pham", destination: "/products" },
      { source: "/san-pham/:slug", destination: "/products/:slug" },
      { source: "/nghe-nhan", destination: "/artisans" },
      { source: "/nghe-nhan/:slug", destination: "/artisans/:slug" },
      { source: "/ban-do", destination: "/map" },
      { source: "/truy-xuat/:code", destination: "/trace/:code" },
      { source: "/tin-tuc", destination: "/news" },
      { source: "/tin-tuc/:slug", destination: "/news/:slug" },
      { source: "/dat-hang-si", destination: "/b2b-quotes" },
      { source: "/dat-hang-si/:code", destination: "/b2b-quotes/:code" },
    ];
  },
  async redirects() {
    return [
      { source: "/xuong/:slug", destination: "/artisans/:slug", permanent: true },
      { source: "/dang-nhap", destination: "/login", permanent: true },
      { source: "/dang-ky", destination: "/register", permanent: true },
      { source: "/quan-tri", destination: "/dashboard/admin", permanent: true },
    ];
  },
};

export default nextConfig;
