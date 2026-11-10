"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingStatus } from "@prisma/client";
import { Check, X, Flag, Ban } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: string; mark: "dot" | "diamond" | "square" | "ring" }> = {
  PENDING: { label: "Chờ xưởng xác nhận", tone: "gold", mark: "diamond" },
  CONFIRMED: { label: "Đã xác nhận", tone: "cobalt", mark: "dot" },
  COMPLETED: { label: "Đã diễn ra", tone: "celadon", mark: "square" },
  DECLINED: { label: "Xưởng từ chối", tone: "danger", mark: "ring" },
  CANCELLED: { label: "Đã hủy", tone: "ash", mark: "ring" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = BOOKING_STATUS[status];
  return <Badge tone={s.tone} mark={s.mark}>{s.label}</Badge>;
}

type Action = "confirm" | "decline" | "complete" | "cancel";

const COPY: Record<Action, { title: string; body: string; confirm: string; note?: string }> = {
  confirm: { title: "Xác nhận lịch hẹn?", body: "Khách sẽ nhận thông báo ngay.", confirm: "Xác nhận", note: "Lời nhắn cho khách (không bắt buộc)" },
  decline: { title: "Từ chối lịch hẹn?", body: "Hãy cho khách biết lý do để họ chọn giờ khác.", confirm: "Từ chối", note: "Lý do" },
  complete: { title: "Đánh dấu buổi trải nghiệm đã diễn ra?", body: "Khách sẽ được mời để lại đánh giá cho xưởng.", confirm: "Đã diễn ra" },
  cancel: { title: "Hủy lịch hẹn này?", body: "Xưởng sẽ nhận thông báo hủy. Bạn có thể đặt lại khung giờ khác bất cứ lúc nào.", confirm: "Hủy lịch" },
};

/** Thao tác trên một lịch hẹn: xưởng xác nhận/từ chối/hoàn tất, khách hủy. */
export function BookingActions({ code, version, status, as }: { code: string; version: number; status: BookingStatus; as: "artisan" | "buyer" }) {
  const [action, setAction] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const available: Action[] =
    as === "artisan"
      ? status === "PENDING" ? ["confirm", "decline"] : status === "CONFIRMED" ? ["complete", "decline"] : []
      : status === "PENDING" || status === "CONFIRMED" ? ["cancel"] : [];
  if (available.length === 0) return null;

  async function run() {
    if (!action) return;
    setLoading(true);
    try {
      await api(`/api/bookings/${code}`, { method: "PATCH", body: { action, version, note } });
      toast({ kind: "success", title: { confirm: "Đã xác nhận lịch hẹn", decline: "Đã từ chối lịch hẹn", complete: "Đã ghi nhận buổi trải nghiệm", cancel: "Đã hủy lịch hẹn" }[action] });
      setAction(null);
      setNote("");
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Không thực hiện được" });
      if (err instanceof ApiError && err.status === 409) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const ICON = { confirm: Check, decline: X, complete: Flag, cancel: Ban };
  const VARIANT = { confirm: "primary", decline: "outline", complete: "celadon", cancel: "outline" } as const;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {available.map((a) => {
          const Icon = ICON[a];
          return (
            <Button key={a} size="sm" variant={VARIANT[a]} onClick={() => setAction(a)}>
              <Icon className="size-4" /> {COPY[a].confirm}
            </Button>
          );
        })}
      </div>
      <Dialog open={!!action} onClose={() => setAction(null)} title={action ? COPY[action].title : ""}>
        {action && (
          <div className="space-y-4">
            <p className="text-sm text-tro">{COPY[action].body}</p>
            {COPY[action].note && (
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} aria-label={COPY[action].note} placeholder={COPY[action].note} />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAction(null)}>Quay lại</Button>
              <Button variant={action === "decline" || action === "cancel" ? "danger" : "primary"} loading={loading} onClick={run}>{COPY[action].confirm}</Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
