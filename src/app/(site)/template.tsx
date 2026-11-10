/** Mỗi lần chuyển trang, nội dung mới "trồi" lên nhẹ (CSS, không chặn hiển thị). */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
