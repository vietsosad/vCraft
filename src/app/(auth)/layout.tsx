/** Khu xác thực: toàn màn hình, không có đầu trang triển lãm; chữ theo phạm vi thao tác. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main" className="ui-operate">{children}</main>;
}
