"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function MarkAllRead() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        await api("/api/notifications", { body: { all: true } }).catch(() => undefined);
        setLoading(false);
        router.refresh();
      }}
    >
      <CheckCheck className="size-4" /> Đánh dấu đã đọc tất cả
    </Button>
  );
}
