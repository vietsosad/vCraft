import { cn } from "@/lib/cn";

/** Thước đo độ mạnh mật khẩu theo đúng chính sách của server. */
export function PasswordMeter({ value }: { value: string }) {
  const rules = [
    { ok: value.length >= 8, label: "8+ ký tự" },
    { ok: /[a-z]/.test(value), label: "chữ thường" },
    { ok: /[A-Z]/.test(value), label: "chữ hoa" },
    { ok: /\d/.test(value), label: "chữ số" },
  ];
  const score = rules.filter((r) => r.ok).length;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded", i < score ? (score === 4 ? "bg-ngoc" : "bg-vangrom") : "bg-nga-sau")} />
        ))}
      </div>
      <p className="flex flex-wrap gap-x-3 text-[12px] text-tro">
        {rules.map((r) => <span key={r.label} className={r.ok ? "text-ngoc" : ""}>{r.ok ? "✓" : "○"} {r.label}</span>)}
      </p>
    </div>
  );
}
