import Link from "next/link";

/** Logo vCraft: chữ "v" cách điệu thành dáng chén nhìn nghiêng, nét men lam. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="vCraft – về trang chủ">
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <rect width="40" height="40" rx="7" fill="#1d3557" />
        <path d="M9 12c3 0 4.5 1 6.2 5.6L20 29l4.8-11.4C26.5 13 28 12 31 12" fill="none" stroke="#f9f6f0" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M13 31.5h14" stroke="#b84a39" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[1.65rem] font-semibold tracking-tight">
            v<span className="text-terracotta">Craft</span>
          </span>
          <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.22em] text-ash sm:block">Làng gốm Bát Tràng</span>
        </span>
      )}
    </Link>
  );
}
