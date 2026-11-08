"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function SuspendButton({ id, suspended, name }: { id: string; suspended: boolean; name: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await api(`/api/admin/users/${id}`, { method: "PATCH", body: { suspended: !suspended } });
      toast({ kind: "success", title: suspended ? `Đã mở khóa ${name}` : `Đã khóa ${name}`, description: suspended ? undefined : "Mọi phiên đăng nhập đã bị thu hồi." });
      router.refresh();
    } catch (err) {
      toast({ kind: "error", title: err instanceof ApiError ? err.message : "Có lỗi" });
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <>
      <Button size="sm" variant={suspended ? "outline" : "ghost"} className={suspended ? "" : "text-terracotta"} onClick={() => setOpen(true)}>{suspended ? "Mở khóa" : "Tạm khóa"}</Button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} onConfirm={confirm} loading={busy} danger={!suspended} title={suspended ? "Mở khóa tài khoản?" : "Tạm khóa tài khoản?"} confirmLabel={suspended ? "Mở khóa" : "Khóa"}>
        {suspended ? `${name} sẽ đăng nhập lại được.` : `${name} sẽ bị đăng xuất khỏi mọi thiết bị, sản phẩm của xưởng (nếu có) bị ẩn khỏi trang công khai.`}
      </ConfirmDialog>
    </>
  );
}
