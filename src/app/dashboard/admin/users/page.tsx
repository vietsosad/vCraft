import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/primitives";
import { SuspendButton } from "@/components/admin/suspend-button";

export const dynamic = "force-dynamic";

const ROLE = { ADMIN: "Ban quản lý", ARTISAN: "Nghệ nhân", BUYER: "Khách hàng" } as const;
const STATUS = { ACTIVE: ["Hoạt động", "celadon"], PENDING: ["Chờ duyệt", "gold"], SUSPENDED: ["Đã khóa", "terracotta"] } as const;

export default async function UsersPage() {
  const me = await getCurrentUser();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, artisanProfile: { select: { workshopName: true } }, _count: { select: { sessions: true } } },
  });
  return (
    <div>
      <h2 className="text-3xl">Tài khoản</h2>
      <p className="mb-6 text-sm text-ash">Tạm khóa một hộ (ví dụ khi phát hiện bán hàng nhập) sẽ thu hồi mọi phiên đăng nhập và ẩn toàn bộ sản phẩm của xưởng.</p>
      <div className="overflow-x-auto rounded-[var(--radius-tile)] border border-line bg-white/70">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-bisque/70 text-left text-xs uppercase tracking-wider text-ash">
            <tr><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Phiên</th><th className="px-4 py-3">Tạo lúc</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3"><p className="font-medium">{u.name}</p><p className="text-xs text-ash">{u.email}{u.artisanProfile ? ` · ${u.artisanProfile.workshopName}` : ""}</p></td>
                <td className="px-4 py-3">{ROLE[u.role]}</td>
                <td className="px-4 py-3"><Badge tone={STATUS[u.status][1]}>{STATUS[u.status][0]}</Badge></td>
                <td className="px-4 py-3 font-mono">{u._count.sessions}</td>
                <td className="px-4 py-3 text-xs text-ash">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">{u.id !== me?.id && u.role !== "ADMIN" && <SuspendButton id={u.id} suspended={u.status === "SUSPENDED"} name={u.name} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
