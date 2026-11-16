import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Đầu lòng ngăn kéo: tên ngăn khắc chữ biển hiệu, dải hồi văn vàng, lời dẫn và thao tác chính. */
export function DrawerHead({ title, description, actions, className }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <header className={cn("mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="title-lg">{title}</h1>
        <div className="hoi-van mt-3 w-36 opacity-90" aria-hidden />
        {description && <p className="mt-3 max-w-2xl text-tro">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Tên một nhóm trong ngăn (vd "Sắp tới", "Đã qua"): chữ Alegreya kèm số đếm, không dùng làm dòng kicker. */
export function ShelfTitle({ children, count, className }: { children: ReactNode; count?: number; className?: string }) {
  return (
    <h2 className={cn("mb-4 flex items-baseline gap-2 font-serif text-[1.35rem] font-bold normal-case tracking-normal", className)}>
      {children}
      {count !== undefined && <span className="font-sans text-sm font-semibold tabular text-tro">{count}</span>}
    </h2>
  );
}
