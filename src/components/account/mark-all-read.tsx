"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

/** Đánh dấu mọi thư đã đọc; khu khách hàng dùng nút viền cỡ vừa, các khu khác giữ nút chữ nhỏ. */
export function MarkAllRead({ variant = "ghost", size = "sm" }: { variant?: "ghost" | "outline"; size?: "sm" | "md" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <Button
      size={size}
      variant={variant}
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
