import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "cobalt" | "outline" | "ghost" | "celadon" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-terracotta text-kaolin hover:bg-terracotta-dark shadow-soft",
  cobalt: "bg-cobalt text-kaolin hover:bg-cobalt-soft shadow-soft",
  celadon: "bg-celadon text-kaolin hover:brightness-110 shadow-soft",
  outline: "border border-ink/20 bg-transparent text-ink hover:border-ink/50 hover:bg-bisque",
  ghost: "bg-transparent text-ink hover:bg-bisque",
  danger: "bg-[#9f2a1f] text-kaolin hover:bg-[#82211a]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-[var(--radius-tile)] font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";

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
