import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { AUDIT_LABEL, auditLabel } from "@/lib/audit-labels";
import { PageHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Nhật ký hoạt động" };
export const dynamic = "force-dynamic";

const PAGE = 30;

/** Nhật ký thao tác quan trọng: lọc theo loại hành động, phân trang, xuất CSV. */
export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const action = sp.action && sp.action in AUDIT_LABEL ? sp.action : undefined;
  const where = action ? { action } : {};
  const [rows, total, actions] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE, take: PAGE, include: { actor: { select: { name: true, email: true, role: true } } } }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const href = (p: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    if (p.action) q.set("action", String(p.action));
    if (p.page && Number(p.page) > 1) q.set("page", String(p.page));
    const s = q.toString();
    return `/dashboard/admin/audit${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Nhật ký hoạt động"
        description="Mọi thao tác quan trọng đều được ghi lại: duyệt hộ, khóa tài khoản, chốt đơn, xác nhận lịch, xuất báo cáo."
        actions={<a href="/api/admin/reports/audit" download className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-tile)] border border-muc/20 bg-su/60 px-5 text-[15px] font-semibold hover:border-muc/45"><Download className="size-4" /> Xuất CSV</a>}
      />
      <nav aria-label="Lọc theo hành động" className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <Link href={href({})} aria-current={!action ? "page" : undefined} className={cn("shrink-0 rounded-[4px] px-3 py-1.5 text-sm", !action ? "bg-ngoc text-on" : "bg-su text-tro ring-1 ring-inset ring-vua hover:text-muc")}>
          Tất cả ({actions.reduce((s, a) => s + a._count._all, 0)})
        </Link>
        {actions.sort((a, b) => b._count._all - a._count._all).map((a) => (
          <Link key={a.action} href={href({ action: a.action })} aria-current={action === a.action ? "page" : undefined} className={cn("shrink-0 rounded-[4px] px-3 py-1.5 text-sm", action === a.action ? "bg-ngoc text-on" : "bg-su text-tro ring-1 ring-inset ring-vua hover:text-muc")}>
            {auditLabel(a.action)} ({a._count._all})
          </Link>
        ))}
      </nav>
      <div className="relative overflow-x-auto rounded-[8px] border border-vua bg-su">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-nga-dam text-left text-xs font-semibold text-tro">
            <tr><th className="px-4 py-3">Thời điểm</th><th className="px-4 py-3">Người thực hiện</th><th className="px-4 py-3">Hành động</th><th className="px-4 py-3">Đối tượng</th></tr>
          </thead>
          <tbody className="divide-y divide-vua">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-nga-dam/40">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-tro tabular">{formatDate(r.createdAt, true)}</td>
                <td className="px-4 py-3">{r.actor ? <><span className="font-medium">{r.actor.name}</span><span className="block text-xs text-tro">{r.actor.email}</span></> : <span className="text-tro">Hệ thống</span>}</td>
                <td className="px-4 py-3">{auditLabel(r.action)}</td>
                <td className="px-4 py-3 text-xs text-tro"><span className="code">{r.entity}</span> {r.entityId.length > 14 ? `${r.entityId.slice(0, 10)}…` : r.entityId}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-tro">Không có thao tác nào.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav aria-label="Phân trang" className="mt-4 flex items-center justify-between text-sm">
          <span className="text-tro">Trang {page}/{pages} · {total} dòng</span>
          <span className="flex gap-2">
            {page > 1 && <Link href={href({ action, page: page - 1 })} className="rounded-[4px] bg-su px-3 py-1.5 ring-1 ring-inset ring-vua">← Trước</Link>}
            {page < pages && <Link href={href({ action, page: page + 1 })} className="rounded-[4px] bg-su px-3 py-1.5 ring-1 ring-inset ring-vua">Sau →</Link>}
          </span>
        </nav>
      )}
    </>
  );
}
