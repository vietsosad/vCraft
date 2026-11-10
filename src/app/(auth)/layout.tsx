/** Khu xác thực: toàn màn hình, không có đầu trang triển lãm. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
