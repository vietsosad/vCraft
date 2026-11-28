"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function MarkAllRead() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <Button
      size="sm"
      variant="ghost"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await api("/api/notifications", { body: { all: true } });
          router.refresh();
        } catch {
          toast({ kind: "error", title: "Chưa đánh dấu được tất cả thông báo." });
        } finally {
          setLoading(false);
        }
      }}
    >
      <CheckCheck className="size-4" /> Đánh dấu đã đọc tất cả
    </Button>
  );
}
