/** Đường đi giữa hai điểm dừng: lữ khách đội nón lá bước trên con đường gạch trong lúc trang mới đang dựng. */
const DUONG = "M14 64 C 84 64 112 30 160 30 C 208 30 236 64 306 64";

export default function LangLoading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto flex min-h-[55vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-16">
      <div className="relative h-[84px] w-[320px] max-w-full" aria-hidden>
        <svg viewBox="0 0 320 84" width="320" height="84" className="absolute inset-0">
          <path d={DUONG} fill="none" className="f-road-s" strokeWidth="16" strokeLinecap="round" />
          <path d={DUONG} fill="none" stroke="var(--color-datnung)" strokeWidth="10" strokeDasharray="8 4" opacity=".22" />
          <circle cx="14" cy="64" r="5" fill="var(--color-su)" stroke="var(--color-lam)" strokeWidth="2.5" />
          <circle cx="306" cy="64" r="5" fill="var(--color-lam)" stroke="var(--color-lam)" strokeWidth="2.5" />
        </svg>
        <span className="lu-khach" style={{ offsetPath: `path("${DUONG}")` }}>
          <svg viewBox="-20 -50 40 56" width="34" height="48" className="buoc">
            <ellipse cx="0" cy="4" rx="12" ry="4" fill="#1c1a17" opacity=".18" />
            <path d="M-7 0 L-5 -22 H5 L7 0 Z" fill="#1f4e9a" />
            <circle cx="0" cy="-28" r="6" fill="#e9c9a6" />
            <path d="M-17 -30 L0 -46 L17 -30 Q0 -26 -17 -30 Z" fill="#c8962e" stroke="#84600f" strokeWidth="1" />
            <path d="M5 -16 L14 -10" stroke="#5a3323" strokeWidth="1.6" strokeLinecap="round" />
            <ellipse cx="14" cy="-3" rx="3.8" ry="5" fill="#d9502e" />
          </svg>
        </span>
      </div>
      <p className="font-serif text-[1.2rem] text-tro giong-ke">Đang đi tới điểm dừng…</p>
    </div>
  );
}
