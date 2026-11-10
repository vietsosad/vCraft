"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, Badge, VerifiedSeal } from "@/components/ui/primitives";
import { Textarea } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";

export function ApprovalActions({ id, status, note }: { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; note: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(action);
    try {
      await api(`/api/admin/applications/${id}/${action}`, { body: { note: reason || undefined } });
      toast({ kind: "success", title: action === "approve" ? "Đã duyệt hộ nghề" : "Đã từ chối hồ sơ", description: "Chủ xưởng đã nhận thông báo." });
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    } finally {
      setBusy(null);
    }
  }

  if (status === "APPROVED") {
    return <Card className="space-y-3 p-6 text-center"><VerifiedSeal className="mx-auto" /><p className="text-sm text-tro">Hồ sơ đã được duyệt. Xưởng đang hiển thị công khai.</p></Card>;
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between"><p className="font-medium">Quyết định</p><Badge tone={status === "PENDING" ? "gold" : "terracotta"}>{status === "PENDING" ? "Chờ duyệt" : "Đã từ chối"}</Badge></div>
      {note && <p className="rounded bg-nga-dam p-2 text-xs text-tro">Ghi chú trước: {note}</p>}
      <label htmlFor="reason" className="block text-sm font-medium">Ghi chú / lý do từ chối</label>
      <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Bắt buộc khi từ chối, tối thiểu 10 ký tự để hộ nghề biết cần bổ sung gì" />
      <div className="grid gap-2">
        <Button variant="celadon" onClick={() => act("approve")} loading={busy === "approve"}><CheckCircle2 className="size-4" /> Duyệt và cấp huy hiệu</Button>
        <Button variant="outline" onClick={() => act("reject")} loading={busy === "reject"} disabled={reason.trim().length < 10}><XCircle className="size-4" /> Từ chối</Button>
      </div>
    </Card>
  );
}
