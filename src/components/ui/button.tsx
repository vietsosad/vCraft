import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Nút dạng viên gốm men: góc 6px, gờ sáng phía trên, ấn xuống thì lún 1px.
 * primary = men lam (màu chủ đạo), earth = đất nung, celadon = men ngọc.
 */
type Variant = "primary" | "cobalt" | "earth" | "outline" | "ghost" | "celadon" | "danger";
type Size = "sm" | "md" | "lg";

const glazed = "shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-2px_0_rgb(0_0_0/0.12),var(--shadow-soft)] active:translate-y-px active:shadow-[inset_0_2px_3px_rgb(0_0_0/0.2)]";

const variants: Record<Variant, string> = {
  primary: cn("bg-lam text-on hover:bg-lam-sang", glazed),
  cobalt: cn("bg-lam text-on hover:bg-lam-sang", glazed),
  earth: cn("bg-datnung text-on hover:bg-datnung-dam", glazed),
  celadon: cn("bg-ngoc text-on hover:brightness-110", glazed),
  outline: "border border-muc/20 bg-su/60 text-muc hover:border-muc/45 hover:bg-su active:translate-y-px",
  ghost: "bg-transparent text-muc hover:bg-nga-dam",
  danger: cn("bg-doson text-on hover:bg-doson-dam", glazed),
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-[52px] px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-[var(--radius-tile)] font-semibold transition-[background-color,box-shadow,transform,border-color,filter] duration-200 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
