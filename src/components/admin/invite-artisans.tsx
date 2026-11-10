"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/format";

/** BQL mời thêm xưởng vào yêu cầu đang thiếu công suất. */
export function InviteArtisans({ code, artisans }: { code: string; artisans: { id: string; workshopName: string; maxMonthlyCapacity: number }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function invite() {
    setBusy(true);
    try {
      await api(`/api/quotes/${code}/invite`, { body: { artisanIds: picked } });
      toast({ kind: "success", title: `Đã mời thêm ${picked.length} xưởng` });
      setPicked([]);
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded-md border border-dashed border-lam/40 bg-lam/[0.04] p-3">
      <p className="text-sm font-medium text-lam">Chưa đủ công suất – mời thêm xưởng:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {artisans.map((a) => (
          <label key={a.id} className="flex items-center gap-1.5 rounded-[4px] border border-vua bg-su px-3 py-1 text-xs">
            <input type="checkbox" className="accent-lam" checked={picked.includes(a.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, a.id] : picked.filter((x) => x !== a.id))} />
            {a.workshopName} <span className="text-tro">({formatNumber(a.maxMonthlyCapacity)}/th)</span>
          </label>
        ))}
      </div>
      <Button size="sm" variant="cobalt" className="mt-2" disabled={!picked.length} loading={busy} onClick={invite}><UserPlus className="size-4" /> Gửi lời mời</Button>
    </div>
  );
}
