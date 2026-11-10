import Link from "next/link";
import { prisma } from "@/lib/db";
import { GLAZES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { Badge, EmptyState } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

const TONE = { PENDING: ["Chờ duyệt", "gold"], APPROVED: ["Đã duyệt", "celadon"], REJECTED: ["Từ chối", "terracotta"] } as const;

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "PENDING" } = await searchParams;
  const filter = ["PENDING", "APPROVED", "REJECTED"].includes(status) ? (status as keyof typeof TONE) : "PENDING";
  const rows = await prisma.artisanProfile.findMany({
    where: { verificationStatus: filter },
    orderBy: { createdAt: "desc" },
    select: { id: true, workshopName: true, clanName: true, address: true, specialties: true, verificationStatus: true, createdAt: true, user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl">Kiểm duyệt hộ nghề</h2>
          <p className="text-sm text-tro">Đối chiếu minh chứng với danh sách hộ làm nghề trước khi cấp huy hiệu – chặn hàng nhái trà trộn.</p>
        </div>
        <div className="flex gap-1 rounded-[8px] border border-vua bg-su p-1 text-sm">
          {(Object.keys(TONE) as (keyof typeof TONE)[]).map((s) => (
            <Link key={s} href={`/dashboard/admin/approvals?status=${s}`} className={`rounded-[5px] px-3 py-1 ${s === filter ? "bg-lam text-on" : "text-tro hover:text-muc"}`}>{TONE[s][0]}</Link>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Không có hồ sơ nào" description={filter === "PENDING" ? "Mọi hồ sơ đều đã được xử lý." : undefined} />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/dashboard/admin/approvals/${r.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-tile)] border border-vua bg-su/70 p-5 hover:border-lam/40">
                <div>
                  <p className="font-serif text-xl">{r.workshopName}</p>
                  <p className="text-sm text-tro">{r.user.name} · dòng họ {r.clanName} · {r.user.email}</p>
                  <p className="text-xs text-tro">{r.address} · {r.specialties.map((s) => GLAZES[s].label).join(", ")}</p>
                </div>
                <div className="text-right">
                  <Badge tone={TONE[r.verificationStatus][1]}>{TONE[r.verificationStatus][0]}</Badge>
                  <p className="mt-1 text-xs text-tro">Gửi {formatDate(r.createdAt, true)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
