"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./button";

/** Hộp thoại modal dựa trên phần tử <dialog> gốc: tự bẫy focus, đóng bằng Esc. */
export function Dialog({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="vc-dialog m-auto w-[min(92vw,520px)] rounded-[10px] border border-vua bg-nga p-0 text-muc shadow-lift backdrop:bg-dem/45 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex items-center justify-between border-b border-vua px-5 py-4">
        <h2 className="font-serif text-2xl font-bold normal-case">{title}</h2>
        <button onClick={onClose} aria-label="Đóng" className="grid size-9 place-items-center rounded-[var(--radius-tile)] hover:bg-nga-dam"><X className="size-5" /></button>
      </div>
      <div className="px-5 py-4 text-sm">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-vua px-5 py-3">{footer}</div>}
    </dialog>
  );
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, children, confirmLabel = "Xác nhận", loading, danger,
}: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; children: ReactNode; confirmLabel?: string; loading?: boolean; danger?: boolean }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
