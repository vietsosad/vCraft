import type { SVGProps } from "react";

/** Biểu tượng nét vẽ của các điểm dừng trên đường làng (nét 2.2, theo màu chữ). */
export type TramKind = "cong" | "lo" | "banxoay" | "ke" | "trien" | "thu" | "danhgia" | "hoso";

const PATHS: Record<TramKind, React.ReactNode> = {
  cong: (
    <>
      <path d="M5 16c7-1 13-5 19-9 6 4 12 8 19 9" />
      <path d="M9 16v26M39 16v26M17 21v21M31 21v21M13 21h22M4 42h40" />
      <path d="M20 42v-9a4 4 0 0 1 8 0v9" />
    </>
  ),
  lo: (
    <>
      <path d="M14 42V24c0-6 4-9 7-11V5h6v8c3 2 7 5 7 11v18M9 42h30" />
      <path d="M20 42v-7a4 4 0 0 1 8 0v7" />
      <path d="M24 41c-2.4-2-1.6-4.4 0-6 1.6 1.6 2.4 4 0 6z" fill="#ee8a43" stroke="none" />
    </>
  ),
  banxoay: (
    <>
      <ellipse cx="24" cy="35" rx="17" ry="4.5" />
      <path d="M18 32c-3-4-3-10 2-13v-4h8v4c5 3 5 9 2 13" />
      <path d="M24 40v4M14 44h20" />
    </>
  ),
  ke: (
    <>
      <path d="M5 26h38M5 42h38M8 26v16M40 26v16" />
      <path d="M14 26c-2-3-2-7 1-9v-3h4v3c3 2 3 6 1 9M28 26c-1-2 0-5 4-5s5 3 4 5M14 42c-1-3 0-6 4-6s5 3 4 6M29 42c-2-2-2-6 2-8v-2h4v2c4 2 4 6 2 8" />
    </>
  ),
  trien: (
    <>
      <rect x="9" y="9" width="30" height="30" rx="3" />
      <rect x="14" y="14" width="20" height="20" rx="1" />
      <path d="M24 17l2 4 4.4.6-3.2 3.1.8 4.3-4-2.1-4 2.1.8-4.3-3.2-3.1 4.4-.6z" />
    </>
  ),
  thu: (
    <>
      <path d="M5 33h38l-5 8H10z" />
      <path d="M26 33V9l12 9H26" />
      <rect x="9" y="20" width="12" height="9" rx="1" />
      <path d="M9 21l6 4.5 6-4.5" />
    </>
  ),
  danhgia: (
    <>
      <path d="M24 6l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 33.1l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z" />
      <path d="M10 44h28" />
    </>
  ),
  hoso: (
    <>
      <rect x="7" y="9" width="34" height="30" rx="3" />
      <circle cx="18" cy="21" r="4.5" />
      <path d="M11 33c1.5-3.5 4-5 7-5s5.5 1.5 7 5M28 19h8M28 25h8M28 31h5" />
    </>
  ),
};

export function TramIcon({ kind, size = 40, ...props }: { kind: TramKind; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      {PATHS[kind]}
    </svg>
  );
}

/** Dải hồi văn (chữ triện vuông) chạy dưới đầu trang và dưới các đầu mục. */
export function HoiVan({ id, className }: { id: string; className?: string }) {
  return (
    <svg width="100%" height="12" aria-hidden className={className} style={{ display: "block" }}>
      <defs>
        <pattern id={id} width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 10.5 H5 V2 H15 V8 H9.5 V5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M12 10.5 H24" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${id})`} />
    </svg>
  );
}

/** Mũi tên đi tiếp. */
export function ArrowGo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
