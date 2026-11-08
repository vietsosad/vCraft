"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

/** Công tắc "Đang nhận khách tham quan" – lưu ngay bằng fetch, ghim trên bản đồ đổi màu tức thì. */
export function OpenToggle({ initial, label: initialLabel }: { initial: boolean; label: string }) {
  const toast = useToast();
  const [on, setOn] = useState(initial);
  const [label, setLabel] = useState(initialLabel);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const res = await api<{ openState: { label: string } }>("/api/me/open-status", { body: { isOpenForVisit: next } });
      setLabel(res.openState.label);
      toast({ kind: "success", title: next ? "Đã mở nhận khách tham quan" : "Đã tạm ngừng nhận khách", description: "Bản đồ làng đã cập nhật." });
    } catch (err) {
      setOn(!next);
      toast({ kind: "error", title: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        role="switch"
        aria-checked={on}
        aria-label="Nhận khách tham quan"
        onClick={toggle}
        disabled={busy}
        className={cn("relative h-8 w-14 shrink-0 rounded-full transition", on ? "bg-celadon" : "bg-ash/40")}
      >
        <span className={cn("absolute top-1 size-6 rounded-full bg-white shadow transition-all", on ? "left-7" : "left-1")} />
      </button>
      <div>
        <p className="font-medium">{on ? "Đang nhận khách tham quan" : "Tạm ngừng nhận khách"}</p>
        <p className="text-sm text-ash">{label}</p>
      </div>
    </div>
  );
}
