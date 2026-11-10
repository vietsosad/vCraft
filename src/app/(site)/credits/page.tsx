import type { Metadata } from "next";
import manifest from "../../../../public/seed/manifest.json";

export const metadata: Metadata = { title: "Ghi công ảnh tư liệu" };

/** Ghi công đầy đủ cho ảnh giấy phép mở dùng trong dữ liệu mẫu. */
export default function CreditsPage() {
  const entries = Object.entries(manifest);
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl">Ghi công ảnh tư liệu</h1>
      <p className="mt-3 text-tro">
        Ảnh trong dữ liệu mẫu lấy từ Wikimedia Commons theo giấy phép CC BY-SA, CC BY hoặc CC0 / phạm vi công cộng, đã được thu nhỏ và nén lại. Các
        xưởng và nghệ nhân trong dữ liệu mẫu là hư cấu; điểm di sản dùng tên thật. Bản đồ © OpenStreetMap contributors.
      </p>
      <ul className="mt-8 divide-y divide-vua text-sm">
        {entries.map(([id, m]) => (
          <li key={id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto]">
            <span><span className="text-muc">{m.credit.title}</span><br /><span className="text-tro">{m.credit.author}</span></span>
            <span className="flex items-center gap-3 font-mono text-xs"><span>{m.credit.license}</span><a href={m.credit.url} target="_blank" rel="noreferrer" className="text-datnung underline">nguồn</a></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
