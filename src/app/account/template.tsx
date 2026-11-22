import type { ReactNode } from "react";

/** Mỗi lần chuyển mục: tấm vải trượt lên một chút; các dải tự dệt vào khi hiện ra. */
export default function AccountTemplate({ children }: { children: ReactNode }) {
  return <div className="weave-page">{children}</div>;
}
